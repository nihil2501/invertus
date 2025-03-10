export default defineBackground(() => {
  chrome.action.onClicked.addListener(onActionClickedListener);
  chrome.commands.onCommand.addListener(onCommandListener);
  chrome.webNavigation.onCommitted.addListener(onNavigationCommittedListener);
  storage.watch<string[]>(hostnamesStorageItem.key, onHostnamesChanged);
});

const onCommandListener = (
  _command: string,
  { url, pendingUrl }: chrome.tabs.Tab,
): void => {
  if (!pendingUrl) toggleUrl(url);
};

const onActionClickedListener = ({
  url,
  pendingUrl,
}: chrome.tabs.Tab): void => {
  if (!pendingUrl) toggleUrl(url);
};

const onNavigationCommittedListener = ({
  url,
  tabId,
  frameId,
}: chrome.webNavigation.WebNavigationTransitionCallbackDetails) => {
  if (frameId !== 0) return;

  whenHostnameValid(url, async (hostname) => {
    if (await hostnamesIncludes(hostname)) {
      updateTab(tabId, "add");
    }
  });
};

const onHostnamesChanged = async (
  newHostnames: string[] | null,
  oldHostnames: string[] | null,
) => {
  updateTabs(difference(newHostnames, oldHostnames), "add");
  updateTabs(difference(oldHostnames, newHostnames), "remove");
};

const updateTabs = async (hostnames: string[], action: "add" | "remove") => {
  for (const hostname of hostnames) {
    const query = { url: `*://${hostname}/*` };
    const tabs = await chrome.tabs.query(query);

    for (const { id: tabId } of tabs) {
      if (!tabId) continue;
      updateTab(tabId, action);
    }
  }
};

const difference = <T>(a: T[] | null, b: T[] | null) =>
  (a ?? []).filter((el) => !(b ?? []).includes(el));

const hostnamesStorageItem = storage.defineItem<string[]>("sync:hostnames", {
  init: () => [],
  fallback: [],
});

const toggleUrl = async (rawUrl: string | undefined) => {
  whenHostnameValid(rawUrl, toggleHostname);
};

const whenHostnameValid = (
  rawUrl: string | undefined,
  callback: (hostname: string) => Promise<void>,
) => {
  if (!rawUrl) return;
  const url = new URL(rawUrl);

  for (const { value, property } of URL_INVALID_RULES) {
    if (url[property] === value) return;
  }

  callback(url.hostname);
};

const toggleHostname = async (hostname: string): Promise<void> => {
  const hostnames = await hostnamesStorageItem.getValue();
  const updatedHostnames = hostnames.filter(
    (storedHostname) => storedHostname !== hostname,
  );

  if (updatedHostnames.length === hostnames.length) {
    updatedHostnames.unshift(hostname);
  }

  hostnamesStorageItem.setValue(updatedHostnames);
};

const URL_INVALID_RULES: Array<{
  property: "hostname" | "protocol";
  value: string;
}> = [
  { property: "hostname", value: "ogs.google.com" },
  { property: "protocol", value: "chrome:" },
  { property: "protocol", value: "about:" },
];

const updateTab = (tabId: number, action: "add" | "remove") => {
  chrome.scripting.executeScript({
    target: { tabId },
    args: [action],
    func: (action) => document.documentElement.classList[action]("invertus"),
  });
};

async function hostnamesIncludes(hostname: string) {
  const hostnames = await hostnamesStorageItem.getValue();
  return hostnames.includes(hostname);
}

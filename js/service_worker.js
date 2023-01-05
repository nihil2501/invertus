chrome.webNavigation.onCompleted.addListener((payload) => {
  validly(payload, onPageCompleted);
});

chrome.action.onClicked.addListener(({ url, id: tabId }) => {
  validly({ url, tabId }, onActionClicked);
});

const onPageCompleted = async ({ hostname, tabId }) => {
  const active = await fetchStorage(hostname);
  if (active) {
    updateAppearance({ tabId, active});
  }
};

const onActionClicked = async ({ hostname, tabId }) => {
  const active = !(await fetchStorage(hostname));
  updateAppearance({ tabId, active });
  updateStorage({ hostname, active });
};

const updateAppearance = ({ tabId, active }) => {
  const changeCSS = active ? "insertCSS" : "removeCSS";
  chrome.scripting[changeCSS]({
    files: ["css/style.css"],
    target: {
      allFrames: true,
      tabId,
    }
  });

  const path = active ? "/icons/action/active.png" : "/icons/action/inactive.png" 
  chrome.action.setIcon({ tabId, path });
};

const updateStorage = ({ hostname, active }) => {
  if (active) {
    chrome.storage.sync.set({ [hostname]: true });
  } else {
    chrome.storage.sync.remove(hostname);
  }
};

const fetchStorage = async (hostname) => {
  const active = await chrome.storage.sync.get(hostname);
  return active[hostname] ?? false;
};

const validly = ({ url, tabId }, callback) => {
  const hostname = getHostname(url);
  if (hostname) {
    callback({ hostname, tabId });
  }
};

const getHostname = (url) => {
  url = new URL(url);
  const urlInvalid = urlInvalidConditions.some((condition) => {
    return url[condition.property] === condition.value;
  });

  if (!urlInvalid) {
    return url.hostname;
  }
}

const urlInvalidConditions = [
  { property: "hostname", value: "ogs.google.com" },
  { property: "protocol", value: "chrome:" },
  { property: "protocol", value: "about:" },
];

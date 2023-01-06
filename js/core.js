export const restore = async ({ hostname, tabId }) => {
  const active = await fetchStorage(hostname);
  if (active) {
    updateTab({ tabId, active });
  }
};

export const update = async({ hostname, tabId }) => {
  const active = !await getCurrentTabActive({ tabId });
  updateTabs({ hostname, active });
  updateStorage({ hostname, active });
};

const updateTabs = async ({ hostname, active }) => {
  // This may not be strictly accurate for difference between `host` and
  // `hostname` which I think is `username:login`.
  const query = { url: `*://${hostname}/*` };
  const tabs = await chrome.tabs.query(query);

  for (const { id: tabId } of tabs) {
    updateTab({ tabId, active });
  }
};

const updateTab = ({ tabId, active }) => {
  const properties = activeTabProperties[active];

  chrome.scripting[properties.changeCSS]({
    files: ["css/style.css"],
    origin: "USER",
    target: {
      allFrames: true,
      tabId,
    }
  });

  const path = `/icons/action/${properties.file}`;
  chrome.action.setIcon({ tabId, path });

  const title = properties.title;
  chrome.action.setTitle({ tabId, title });
};

const getCurrentTabActive = async (details) => {
  const text = await chrome.action.getTitle(details);
  return text === activeTitle;
};

const activeTitle = "Invertus (active)";
const inactiveTitle = "Invertus (inactive)";

const activeTabProperties = {
  true: {
    changeCSS: "insertCSS",
    file: "active.png",
    title: activeTitle,
  },
  false: {
    changeCSS: "removeCSS",
    file: "inactive.png",
    title: inactiveTitle,
  },
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
  return active[hostname] || false;
};

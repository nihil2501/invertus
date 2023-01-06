export const onPageCompleted = async ({ hostname, tabId }) => {
  const active = await fetchStorage(hostname);
  if (active) {
    updateAppearance({ tabId, active});
  }
};

export const onActionClicked = async ({ hostname, tabId }) => {
  const active = !(await fetchStorage(hostname));
	// TODO: replace with updateAppearances({ hostname, active })
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

  const file = active ? "active.png" : "inactive.png";
  const path = `/icons/action/${file}`;
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

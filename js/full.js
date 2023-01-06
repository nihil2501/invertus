export const onPageCompleted = async ({ hostname, tabId }) => {
  const active = await fetchStorage(hostname);
  if (active) {
    updateAppearance({ tabId, active});
  }
};

export const onCommandIssued = async ({ command, hostname }) => {
  let active;
  switch(command) {
    case "activate":
      active = true;
      break;
    case "deactivate":
      active = false;
      break;
    default:
      console.warn("command not recognized", command);
      return;
  }

  updateAppearances({ hostname, active });
  updateStorage({ hostname, active });
};

const updateAppearances = async ({ hostname, active }) => {
  // This may not be strictly accurate for difference between `host` and
  // `hostname` which I think is `username:login`.
  const query = { url: `*://${hostname}/*` };
  const tabs = await chrome.tabs.query(query);

  for (const { id: tabId } of tabs) {
    updateAppearance({ tabId, active });
  }
};

// TODO: will need this for constrained-version.
// export const onActionClicked = async ({ hostname, tabId }) => {
//   const active = !(await fetchStorage(hostname));
//   updateAppearance({ tabId, active });
//   updateStorage({ hostname, active });
// };

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

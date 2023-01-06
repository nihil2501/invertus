export const updateAll = async ({ hostname, active }) => {
  // This may not be strictly accurate for difference between `host` and
  // `hostname` which I think is `username:login`.
  const query = { url: `*://${hostname}/*` };
  const tabs = await chrome.tabs.query(query);

  for (const { id: tabId } of tabs) {
    update({ tabId, active });
  }
};

export const update = ({ tabId, active }) => {
  const properties = activeProperties[active];

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

export const getCurrentActive = async (details) => {
  const title = await chrome.action.getTitle(details);
  return title === activeProperties.true.title;
};

const activeProperties = {
  true: {
    changeCSS: "insertCSS",
    file: "active.png",
    title: "Invertus (active)",
  },
  false: {
    changeCSS: "removeCSS",
    file: "inactive.png",
    title: "Invertus (inactive)",
  },
};

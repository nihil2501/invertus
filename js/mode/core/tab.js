const cssFile = "css/style.css";
const activeProperties = {
  true: {
    changeCSS: "insertCSS",
    iconPath: "/icons/action/active.png",
    iconTitle: "Invertus (active)",
    persistedBadgeText: " ",
  },
  false: {
    changeCSS: "removeCSS",
    iconPath: "/icons/action/inactive.png",
    iconTitle: "Invertus (inactive)",
    persistedBadgeText: "",
  },
};

export const updateAll = async ({ hostname, active, persisted }) => {
  // This may not be strictly accurate for difference between `host` and
  // `hostname` which I think is `username:login`.
  const query = { url: hostnameMatchPattern(hostname) };
  const tabs = await chrome.tabs.query(query);

  for (const { id: tabId } of tabs) {
    update({ tabId, active, persisted });
  }
};

// Need better conceptualization of the `persisted` stuff.
export const update = async ({ tabId, active, persisted }) => {
  const properties = activeProperties[active];

  // To not over-insert the CSS.
  const previousActive = await getActive({ tabId });
  if (active !== previousActive) {
    chrome.scripting[properties.changeCSS]({
      files: [cssFile],
      target: { tabId },
      origin: chrome.scripting.StyleOrigin.USER,
    });
  }

  const path = properties.iconPath;
  chrome.action.setIcon({ tabId, path });

  const title = properties.iconTitle;
  chrome.action.setTitle({ tabId, title });

  if (persisted) {
    const text = properties.persistedBadgeText;
    chrome.action.setBadgeText({ tabId, text });
  }
};

export const getActive = async (details) => {
  const title = await chrome.action.getTitle(details);
  return title === activeProperties.true.iconTitle;
};

const hostnameMatchPattern = (hostname) => {
  return `*://${hostname}/*`;
};
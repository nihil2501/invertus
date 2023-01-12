import cssFile from "url:/src/css/style.css";
import activeIconPath from "url:/src/icons/action/active.png";
import inactiveIconPath from "url:/src/icons/action/inactive.png";

const activeProperties = {
  true: {
    changeCSS: "insertCSS",
    iconPath: activeIconPath,
    iconTitle: "Invertus (active)",
    persistedBadgeText: " ",
  },
  false: {
    changeCSS: "removeCSS",
    iconPath: inactiveIconPath,
    iconTitle: "Invertus (inactive)",
    persistedBadgeText: "",
  },
};

export const updateAll =
  async ({ hostname, active, tabId, persisted }) => {
    // This may not be strictly accurate for difference between `host` and
    // `hostname` which I think is `username:login`.
    const query = { url: hostnameMatchPattern(hostname) };
    const tabs = await chrome.tabs.query(query);

    if (active == undefined) {
      active = await getActive({ tabId });
    }

    for (const tab of tabs) {
      update({
        tabId: tab.id,
        active,
        persisted
      });
    }

    return active;
  };

// Need better conceptualization of the `persisted` stuff.
export const update =
  async ({ tabId, active, persisted }) => {
    // To not over-insert the CSS.
    const previousActive = await getActive({ tabId });
    if (active === undefined) {
      active = !previousActive;
    }

    const properties = activeProperties[active];

    if (active !== previousActive) {
      chrome.scripting[properties.changeCSS]({
        origin: chrome.scripting.StyleOrigin.USER,
        target: { tabId },
        files: [cssFile],
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

    return active;
  };

const getActive =
  async (details) => {
    const title = await chrome.action.getTitle(details);
    return title === activeProperties.true.iconTitle;
  };

const hostnameMatchPattern =
  (hostname) => {
    return `*://${hostname}/*`;
  };
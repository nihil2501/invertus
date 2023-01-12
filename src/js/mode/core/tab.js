const cssFile = "style.css";
import cssURL from `url:/src/css/${cssFile}`;
import activeIconURL from "url:/src/icons/action/active.png";
import inactiveIconURL from "url:/src/icons/action/inactive.png";

const activeProperties = {
  true: {
    changeCSS: "insertCSS",
    iconURL: activeIconURL,
    iconTitle: "Invertus (active)",
    persistedBadgeText: " ",
  },
  false: {
    changeCSS: "removeCSS",
    iconURL: inactiveIconURL,
    iconTitle: "Invertus (inactive)",
    persistedBadgeText: "",
  },
};

export const updateAll =
  async ({ hostname, active, persisted }) => {
    // This may not be strictly accurate for difference between `host` and
    // `hostname` which I think is `username:login`.
    const query = { url: hostnameMatchPattern(hostname) };
    const tabs = await chrome.tabs.query(query);

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
    const previousActive = await getActive({ tabId });
    if (active === undefined) {
      active = !previousActive;
    }

    const properties = activeProperties[active];

    // To not double-insert the CSS.
    if (active !== previousActive) {
      chrome.scripting[properties.changeCSS]({
        files: [getCSSPath()],
        origin: chrome.scripting.StyleOrigin.USER,
        target: { tabId },
      });
    }

    const path = properties.iconURL;
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

// Hack because I can't figure out how to just refer to the file adequately.
const getCSSPath = () => {
  let re = new RegExp(cssFile.replace(".", "\\..*\\."));
  return cssURL.match(re)[0]; 
};
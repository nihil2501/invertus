export const updateAll =
  async ({ hostname, active, persisted }: {
    hostname: string,
    active: boolean,
    persisted: boolean
  }): Promise<boolean> => {
    // This may not be strictly accurate for difference between `host` and
    // `hostname` which I think is `username:login`.
    const query = { url: hostnameMatchPattern(hostname) };
    const tabs = await chrome.tabs.query(query);

    for (const tab of tabs) {
      update({
        tabId: tab.id!,
        active,
        persisted
      });
    }

    return active;
  };

// Need better conceptualization of the `persisted` stuff.
export const update =
  async ({ tabId, active, persisted }: {
    tabId: number,
    active?: boolean,
    persisted: boolean
  }): Promise<boolean> => {
    const previousActive = await getActive({ tabId });
    if (active === undefined) {
      active = !previousActive;
    }

    const properties = getActiveProperties(active);

    // To not double-insert the CSS.
    if (active !== previousActive) {
      properties.changeCSS({
        files: [getCSSPath()],
        origin: "USER",
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
  async (details: { tabId: number }): Promise<boolean> => {
    const title = await chrome.action.getTitle(details);
    return title === getActiveProperties(true).iconTitle;
  };

const hostnameMatchPattern =
  (hostname: string): string => {
    return `*://${hostname}/*`;
  };

const cssFile = "style.css";
import cssURL from "url:/src/css/style.css";
import activeIconURL from "url:/src/icons/action/active.png";
import inactiveIconURL from "url:/src/icons/action/inactive.png";

// Hack because I can't figure out how to just refer to the file adequately.
const getCSSPath = (): string => {
  let re = new RegExp(cssFile.replace(".", "\\..*\\."));
  return (cssURL as string).match(re)![0];
};

type ChangeCSS = (
  typeof chrome.scripting.insertCSS |
  typeof chrome.scripting.removeCSS
);

type TabConfiguration = {
  changeCSS: ChangeCSS,
  iconURL: string,
  iconTitle: string,
  persistedBadgeText: string,
}

const getActiveProperties =
  (active: boolean): TabConfiguration => {
    if (active) {
      return {
        changeCSS: chrome.scripting.insertCSS,
        iconURL: activeIconURL,
        iconTitle: "Invertus (active)",
        persistedBadgeText: " ",
      };
    } else {
      return {
        changeCSS: chrome.scripting.removeCSS,
        iconURL: inactiveIconURL,
        iconTitle: "Invertus (inactive)",
        persistedBadgeText: "",
      };
    }
  };

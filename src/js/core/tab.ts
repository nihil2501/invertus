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
        files: [cssPath],
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

const cssPath = "/src/css/style.css";
const activeIconPath = "/src/icons/action/active.png";
const inactiveIconPath = "/src/icons/action/inactive.png";

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
        iconURL: activeIconPath,
        iconTitle: "Invertus (active)",
        persistedBadgeText: " ",
      };
    } else {
      return {
        changeCSS: chrome.scripting.removeCSS,
        iconURL: inactiveIconPath,
        iconTitle: "Invertus (inactive)",
        persistedBadgeText: "",
      };
    }
  };

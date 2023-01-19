import cssURL from 'url:/src/css/style.css';
import activeIconURL from 'url:/src/icons/action/active.png';
import inactiveIconURL from 'url:/src/icons/action/inactive.png';

const cssFile = 'style.css';

export const updateAll =
  async ({ hostname, active, persisted }: {
    hostname: string,
    active: boolean,
    persisted: boolean
  }) => {
    // This may not be strictly accurate for difference between `host` and
    // `hostname` which I think is `username:login`.
    const query = { url: hostnameMatchPattern(hostname) };
    const tabs = await chrome.tabs.query(query);

    tabs.forEach((tab) => {
      update({
        tabId: tab.id!,
        active,
        persisted,
      });
    });

    return active;
  };

// Need better conceptualization of the `persisted` stuff.
export const update =
  async ({ tabId, active, persisted }: {
    tabId: number,
    active?: boolean,
    persisted: boolean
  }) => {
    let nextActive = active;
    const previousActive = await getActive({ tabId });
    if (nextActive === undefined) {
      nextActive = !previousActive;
    }

    const properties = getActiveProperties(nextActive);

    // To not double-insert the CSS.
    if (nextActive !== previousActive) {
      properties.changeCSS({
        files: [getCSSPath()],
        origin: 'USER',
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

    return nextActive;
  };

const getActive =
  async (details: { tabId: number }) => {
    const title = await chrome.action.getTitle(details);
    return title === getActiveProperties(true).iconTitle;
  };

const hostnameMatchPattern =
  (hostname: string) => {
    return `*://${hostname}/*`;
  };

// Hack because I can't figure out how to just refer to the file adequately.
const getCSSPath = () => {
  const re = new RegExp(cssFile.replace('.', '\\..*\\.'));
  return (cssURL as string).match(re)![0];
};

const getActiveProperties =
  (active: boolean) => {
    if (active) {
      return {
        changeCSS: chrome.scripting.insertCSS,
        iconURL: activeIconURL,
        iconTitle: 'Invertus (active)',
        persistedBadgeText: ' ',
      };
    }

    return {
      changeCSS: chrome.scripting.removeCSS,
      iconURL: inactiveIconURL,
      iconTitle: 'Invertus (inactive)',
      persistedBadgeText: '',
    };
  };

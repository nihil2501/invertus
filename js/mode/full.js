import Mode from "../mode.js";
import SimpleMode from "./simple.js";
import { whenHostnameValid } from "./helpers.js";
import { restore, fullUpdate as update } from "./core.js";

export default new Mode({
  requiredPermissions: {
    origins: [
      "*://*/*",
    ],
    permissions: [
      "storage",
      "webNavigation",
    ],
  },
  getEventListeners: () => {
    return [
      {
        event: chrome.webNavigation.onCommitted,
        listener: onNavigationCommittedListener,
      },
    ];
  },
  promotingMode: {
    mode: SimpleMode,
    getEventListeners: () => {
      return [
        {
          event: chrome.commands.onCommand,
          listener: onCommandListener,
        },
      ];
    },
  },
});

const onNavigationCommittedListener =
  ({ url, tabId, frameId }) => {
    // Is this the most relevant way to discriminate? Is it always and only an
    // outer frame navigation and ensuing CSS insertion that has the desired
    // result?
    if (frameId !== 0) {
      return;
    }

    console.debug("full.onNavigationCommittedListener");

    whenHostnameValid(url, (hostname) => {
      restore({ hostname, tabId });
    });
  };

const onCommandListener =
  // There is only one command declared for the extension: `full-update`
  (_command, { url, id: tabId }) => {
    console.debug("full.onCommandListener");
  
    whenHostnameValid(url, (hostname) => {
      update({ hostname, tabId });
    });
  };

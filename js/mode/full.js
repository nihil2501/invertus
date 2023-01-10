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
  ({ url, tabId }) => {
    whenHostnameValid(url, (hostname) => {
      restore({ hostname, tabId });
    });
  };

const onCommandListener =
  (command, { url, id: tabId }) => {
    whenHostnameValid(url, (hostname) => {
      update({ hostname, tabId });
    });
  };

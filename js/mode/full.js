import Mode from "../mode.js";
import SimpleMode from "./simple.js";
import { whenHostnameValid } from "./helpers.js";
import { restore, fullUpdate as update } from "./core.js";

export default new Mode({
  inheritedMode: SimpleMode,
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
        listener: ({ url, tabId }) => {
          whenHostnameValid(url, (hostname) => {
            restore({ hostname, tabId });
          });
        },
      },
      {
        event: chrome.commands.onCommand,
        // We only have one command so `command` argument is uninformative.
        listener: (command, { url, id: tabId }) => {
          whenHostnameValid(url, (hostname) => {
            update({ hostname, tabId });
          });
        },
      },
    ];
  },
});

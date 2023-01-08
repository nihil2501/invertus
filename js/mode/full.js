import { whenHostnameValid } from "./helpers.js";
import { restore, fullUpdate as update } from "./core.js";
import Mode from "../mode.js";

export default new Mode({
  additionalRequiredPermissions: {
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
        event: chrome.action.onClicked,
        listener: ({ url, id: tabId }) => {
          whenHostnameValid(url, (hostname) => {
            update({ hostname, tabId });
          });
        },
      },
    ];
  },
});

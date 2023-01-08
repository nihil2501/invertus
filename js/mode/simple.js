import { whenHostnameValid } from "./helpers.js";
import { simpleUpdate as update } from "./core.js";
import Mode from "../mode.js";

export default new Mode({
  additionalRequiredPermissions: {
    origins: [],
    permissions: [
      "scripting",
      "activeTab",
    ],
  },
  getEventListeners: () => {
    return [
      {
        event: chrome.action.onClicked,
        listener: ({ url, id: tabId }) => {
          whenHostnameValid(url, () => {
            update({ tabId });
          });
        },
      },
    ];
  },
});

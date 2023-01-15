import Mode from "../mode.js";
import { simpleUpdate as update } from "../core.js";
import { whenHostnameValid } from "../core/helpers.js";

export default new Mode({
  requiredPermissions: {
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
        listener: onActionClickedListener,
      },
    ];
  },
});

const onActionClickedListener =
  ({ url, id: tabId }) => {
    console.debug("simple.onActionClickedListener");

    whenHostnameValid(url, () => {
      update({ tabId });
    });
  };

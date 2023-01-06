import { whenHostnameValid } from "./helpers.js";
import { simpleUpdate as update } from "./core.js";
import Mode from "../mode.js";

export default new Mode({
  additionalRequiredPermissions: {
    origins: [],
    permissions: [
      "scripting",
      "storage",
      "activeTab",
    ],
  },
  getEventListeners: () => {
		return [
	    {
	      event: chrome.action.onClicked,
	      listener: onActionClickedListener,
	    },
	  ]
	},
});

const onActionClickedListener = ({ url, id: tabId }) => {
  whenHostnameValid(url, () => update({ tabId }));
};

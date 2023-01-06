import { whenHostnameValid } from "./helpers.js";
import { restore, fullUpdate as update } from "./core.js";
import Mode from "../mode.js";

export default new Mode({
  additionalRequiredPermissions: {
    origins: [
      "*://*/*"
    ],
    permissions: [
      "webNavigation"
    ],
  },
  getEventListeners: () => {
		return [
	    {
	      event: chrome.webNavigation.onCommitted,
	      listener: onNavigationCommittedListener,
	    },
	    {
	      event: chrome.action.onClicked,
	      listener: onActionClickedListener,
	    },
	  ]
	},
});

const onNavigationCommittedListener = ({ url, tabId }) => {
  whenHostnameValid(url, hostname => restore({ hostname, tabId }));
};

const onActionClickedListener = ({ url, id: tabId }) => {
  whenHostnameValid(url, hostname => update({ hostname, tabId }));
};

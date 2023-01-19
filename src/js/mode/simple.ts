import Mode from "../mode";
import { simpleUpdate as update } from "../core";
import { whenHostnameValid } from "../core/helpers";

export default new Mode({
  requiredPermissions: {
    origins: [],
    permissions: ["scripting", "activeTab"],
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

const onActionClickedListener = ({ url, id }: chrome.tabs.Tab): void => {
  console.debug("simple.onActionClickedListener");

  whenHostnameValid(url!, () => {
    update({ tabId: id! });
  });
};

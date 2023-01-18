import Mode from "../mode";
import SimpleMode from "./simple";
import { restore, fullUpdate as update } from "../core";
import { whenHostnameValid } from "../core/helpers";

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
  ({ url, tabId, frameId }: chrome.webNavigation.WebNavigationTransitionCallbackDetails): void => {
    // Is this the most relevant way to discriminate? Is it always and only an
    // outer frame navigation and ensuing CSS insertion that has the desired
    // result?
    if (frameId !== 0) {
      return;
    }

    whenHostnameValid(url, (hostname) => {
      console.debug("full.onNavigationCommittedListener");
      restore({ hostname, tabId });
    });
  };

const onCommandListener =
  // There is only one command declared for the extension: `full-update`
  (_command: string, { url }: chrome.tabs.Tab): void => {
    whenHostnameValid(url!, (hostname) => {
      console.debug("full.onCommandListener");
      update({ hostname });
    });
  };

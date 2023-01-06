import { restore, update } from "./core.js"
import { whenHostnameValid } from "./helpers.js"

chrome.webNavigation.onCommitted.addListener(({ url, tabId }) => {
  whenHostnameValid(url, hostname => restore({ hostname, tabId }));
});

chrome.action.onClicked.addListener(({ url, id: tabId }) => {
  whenHostnameValid(url, hostname => update({ hostname, tabId }));
});

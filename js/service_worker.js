import * as full from "./full.js"
import * as simple from "./simple.js"

chrome.webNavigation.onCompleted.addListener(({ url, tabId }) => {
  validly(url, (hostname) => {
    full.onPageCompleted({
      hostname,
      tabId,
    })
  });
});

chrome.commands.onCommand.addListener((command, { url }) => {
  validly(url, (hostname) => {
    full.onCommandIssued({
      command,
      hostname,
    })
  });
});

// chrome.action.onClicked.addListener(({ url, id }) => {
//   validly(url, (hostname) => {
//     full.onCommandIssued({
//       command: "activate",
//       hostname,
//     })
//   });
// });

// chrome.action.onClicked.addListener(
//   validly(full.onActionClicked)
// );

// TODO: will need this for constrained-version.
// chrome.action.onClicked.addListener(
//   pipeline([
//     normalizePayload({ id: "tabId" }),
//     validly(onActionClicked),
//   ])
// );

export const validly = (url, callback) => {
  url = new URL(url);
  for (const condition of urlInvalidConditions) {
    if (url[condition.property] === condition.value) {
      return;
    }
  }

  callback(url.hostname);
};

const urlInvalidConditions = [
  { property: "hostname", value: "ogs.google.com" },
  { property: "protocol", value: "chrome:" },
  { property: "protocol", value: "about:" },
];

import { onPageCompleted, onActionClicked } from "./logic.js"
import { pipeline, normalizePayload, validly } from "./helpers.js"

chrome.webNavigation.onCompleted.addListener(
  validly(onPageCompleted)
);

chrome.action.onClicked.addListener(
  pipeline([
    normalizePayload({ id: "tabId" }),
    validly(onActionClicked),
  ])
);

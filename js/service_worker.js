import Mode from "./mode/full.js";

const reconcileMode = async () => {
  const permissions = await chrome.permissions.getAll();
  Mode.reconcile(permissions);
};

chrome.permissions.onRemoved.addListener(
  reconcileMode
);

chrome.permissions.onAdded.addListener(
  reconcileMode
);

reconcileMode();

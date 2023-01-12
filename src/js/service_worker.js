import Mode from "./mode/full.js";

const reconcileMode = async (_permissions, initial) => {
  const permissions = await chrome.permissions.getAll();
  Mode.reconcile(permissions, initial);
};

chrome.permissions.onRemoved.addListener(
  reconcileMode
);

chrome.permissions.onAdded.addListener(
  reconcileMode
);

reconcileMode({}, true);

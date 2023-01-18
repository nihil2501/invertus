import Mode from "./mode/full";

const reconcileMode = async (_permissions: chrome.permissions.Permissions, initial = false) => {
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

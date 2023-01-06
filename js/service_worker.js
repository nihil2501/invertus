import SimpleMode from "./mode/simple.js";
import FullMode from "./mode/full.js";

const reconcileModeWithPermissions = async () => {
  const permissions = await chrome.permissions.getAll();

  if (SimpleMode.permittedBy(permissions)) {
    if (FullMode.permittedBy(permissions)) {
      SimpleMode.removeListeners();
      FullMode.ensureListenersAdded();
    } else {
      SimpleMode.ensureListenersAdded();
    }
  }
};

chrome.permissions.onRemoved.addListener(
  reconcileModeWithPermissions
);

chrome.permissions.onAdded.addListener(
  reconcileModeWithPermissions
);

reconcileModeWithPermissions();

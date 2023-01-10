import * as Tab from "./core/tab.js";
import * as Storage from "./core/storage.js";

export const restore = async ({ hostname, tabId }) => {
  const active = await Storage.fetch(hostname);
  if (active) {
    Tab.update({
      persisted: true,
      tabId,
      active,
    });
  }
};

export const fullUpdate = async ({ hostname, tabId }) => {
  const active = !await Tab.getActive({ tabId });
  Storage.update({ hostname, active });
  Tab.updateAll({
    persisted: true,
    hostname,
    active,
  });
};

export const simpleUpdate = async ({ tabId }) => {
  const active = !await Tab.getActive({ tabId });
  Tab.update({ tabId, active });
};

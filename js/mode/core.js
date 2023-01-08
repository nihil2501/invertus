import * as Tab from "./core/tab.js";
import * as Storage from "./core/storage.js";

export const restore = async ({ hostname, tabId }) => {
  const active = await Storage.fetch(hostname);
  if (active) {
    Tab.update({ tabId, active });
  }
};

export const fullUpdate = async ({ hostname, tabId }) => {
  const active = !await Tab.getCurrentActive({ tabId });
  Storage.update({ hostname, active });
  Tab.updateAll({ hostname, active });
};

export const simpleUpdate = async ({ tabId }) => {
  const active = !await Tab.getCurrentActive({ tabId });
  Tab.update({ tabId, active });
};

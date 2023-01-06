import * as tab from "./core/tab.js";
import * as storage from "./core/storage.js";

export const restore = async ({ hostname, tabId }) => {
  const active = await storage.fetch(hostname);
  if (active) {
    tab.update({ tabId, active });
  }
};

export const fullUpdate = async ({ hostname, tabId }) => {
  const active = !await tab.getCurrentActive({ tabId });
  storage.update({ hostname, active });
  tab.updateAll({ hostname, active });
};

export const simpleUpdate = async ({ tabId }) => {
  const active = !await tab.getCurrentActive({ tabId });
  tab.update({ tabId, active });
};

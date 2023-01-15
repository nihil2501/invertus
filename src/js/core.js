import * as Tab from "./core/tab.js";
import * as Storage from "./core/storage.js";

export const fullUpdate =
  async ({ hostname }) => {
    active = await Storage.toggle(hostname);

    Tab.updateAll({
      persisted: true,
      hostname,
      active,
    });
  };

export const simpleUpdate =
  async ({ tabId }) => {
    Tab.update({
      persisted: false,
      tabId,
    });
  };

export const restore =
  async ({ hostname, tabId }) => {
    const active = await Storage.fetch(hostname);

    if (active) {
      Tab.update({
        persisted: true,
        tabId,
        active,
      });
    }
  };

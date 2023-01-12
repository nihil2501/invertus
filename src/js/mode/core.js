import * as Tab from "./core/tab.js";
import * as Storage from "./core/storage.js";

const FullUpdateUX = {
  TOGGLE_TAB: "TOGGLE_TAB",
  TOGGLE_STORAGE: "TOGGLE_STORAGE",
};

// I think this UX is preferable because for both types of interaction:
// (1)  manipulating just this tab, and (2) manipulating all tabs for a
// hostname, both are directly accomplishable--no acrobatics required.
const fullUpdateUX = FullUpdateUX.TOGGLE_STORAGE;

export const fullUpdate =
  async ({ hostname, tabId }) => {
    let active;

    switch (fullUpdateUX) {
      case FullUpdateUX.TOGGLE_TAB:
        active =
          Tab.updateAll({
            persisted: true,
            hostname,    
            tabId,
          });

        Storage.update({
          hostname,
          active,
        });

        break;
      case FullUpdateUX.TOGGLE_STORAGE:
        active = await Storage.toggle(hostname);

        Tab.updateAll({
          persisted: true,
          hostname,
          active,
        });

        break;
    }
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

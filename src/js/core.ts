import * as Tab from "./core/tab";
import * as Storage from "./core/storage";

export const fullUpdate =
  async ({ hostname }: { hostname: string }): Promise<void> => {
    const active = await Storage.toggle(hostname);

    Tab.updateAll({
      persisted: true,
      hostname,
      active,
    });
  };

export const simpleUpdate =
  async ({ tabId }: { tabId: number }): Promise<void> => {
    Tab.update({
      persisted: false,
      tabId,
    });
  };

export const restore =
  async ({ hostname, tabId }: {
    hostname: string,
    tabId: number
  }): Promise<void> => {
    const active = await Storage.fetch(hostname);

    if (active) {
      Tab.update({
        persisted: true,
        tabId,
        active,
      });
    }
  };

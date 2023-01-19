import * as Tab from './core/tab';
import * as Storage from './core/storage';

export const fullUpdate =
  async ({ hostname }: { hostname: string }) => {
    const active = await Storage.toggle(hostname);

    Tab.updateAll({
      persisted: true,
      hostname,
      active,
    });
  };

export const simpleUpdate =
  async ({ tabId }: { tabId: number }) => {
    Tab.update({
      persisted: false,
      tabId,
    });
  };

export const restore =
  async ({ hostname, tabId }: {
    hostname: string,
    tabId: number
  }) => {
    const active = await Storage.fetch(hostname);

    if (active) {
      Tab.update({
        persisted: true,
        tabId,
        active,
      });
    }
  };

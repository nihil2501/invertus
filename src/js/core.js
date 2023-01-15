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

const urlInvalidRules = [
  { property: "hostname", value: "ogs.google.com" },
  { property: "protocol", value: "chrome:" },
  { property: "protocol", value: "about:" },
];

export const whenHostnameValid =
  (url, callback) => {
    url = new URL(url);
    for (const rule of urlInvalidRules) {
      if (url[rule.property] === rule.value) {
        return;
      }
    }

    callback(url.hostname);
  };

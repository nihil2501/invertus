export const toggle =
  async (hostname) => {
    const active = !await fetch(hostname);
    update({ hostname, active });
    return active;
  };

export const update =
  ({ hostname, active }) => {
    if (active) {
      chrome.storage.sync.set({ [hostname]: 1 });
    } else {
      chrome.storage.sync.remove(hostname);
    }
  };

export const fetch =
  async (hostname) => {
    const active = await chrome.storage.sync.get(hostname);
    return active[hostname] === 1;
  };

export default defineBackground(() => {
  browser.action.onClicked.addListener(async ({ id, url }) => {
    const hostname = getHostname(url);
    if (!hostname) return;
    if (!id) return;

    let on: boolean;
    try {
      on = await browser.tabs.sendMessage(id, MESSAGE.TOGGLE);
    } catch (error) {
      await Installation.inject(id);
      on = true;
    }

    if (on) {
      await Hostnames.refresh(hostname);
    } else {
      await Hostnames.remove(hostname);
    }
  });

  browser.commands.onCommand.addListener(async (message) => {
    if (message !== MESSAGE.REMEMBER) return;

    const url = browser.runtime.getURL("/options.html");
    browser.tabs.create({ url });
  });

  browser.runtime.onMessage.addListener(async (message, { url }) => {
    if (message !== MESSAGE.VISITED) return;

    const hostname = getHostname(url);
    if (!hostname) return;

    await Hostnames.refresh(hostname);
  });
});

const getHostname = (url?: string) => {
  if (!url) return;

  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== "http:" && protocol !== "https:") return;

    return hostname;
  } catch (e) {
    if (e instanceof TypeError) return;

    throw e;
  }
};

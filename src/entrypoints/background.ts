export default defineBackground(() => {
  // Just used for debugging.
  browser.tabs.create({ url: browser.runtime.getURL("/options.html") });

  browser.action.onClicked.addListener(async ({ id, url }) => {
    const hostnamePattern = getValidHostnamePattern(url);
    if (!hostnamePattern) return;
    if (!id) return;

    let activated: boolean;
    try {
      activated = await sendTabToggle(id);
    } catch (error) {
      await injectTabScripts(id);
      activated = true;
    }

    const tabs = await browser.tabs.query({ url: hostnamePattern });
    await Promise.allSettled(
      tabs.map((tab) => {
        if (!tab.id) return;
        if (tab.id === id) return;

        return sendTabToggle(tab.id, activated).catch((error) => {
          console.error(error);
        });
      }),
    );
  });
});

const activateUrlPattern = async (urlPattern: string) => {
  const permissions = { origins: [urlPattern] };
  const granted = await browser.permissions.request(permissions);
  if (!granted) return;

  await browser.scripting.unregisterContentScripts();
  await browser.scripting.registerContentScripts([
    {
      css: [CONSTANTS.SCRIPTS.STYLE.PATH],
      id: CONSTANTS.SCRIPTS.STYLE.ID,
      matches: [urlPattern],
    },
    {
      id: CONSTANTS.SCRIPTS.CONTENT.ID,
      js: [CONSTANTS.SCRIPTS.CONTENT.PATH],
      matches: [urlPattern],
    },
  ]);
};

const sendTabToggle = (id: number, activated?: boolean) => {
  return browser.tabs.sendMessage(id, {
    type: CONSTANTS.MESSAGES.TOGGLE,
    payload: activated,
  });
};

const injectTabScripts = async (id: number) => {
  await browser.scripting.insertCSS({
    files: [CONSTANTS.SCRIPTS.STYLE.PATH],
    origin: "USER",
    target: { tabId: id },
  });

  await browser.scripting.executeScript({
    files: [CONSTANTS.SCRIPTS.CONTENT.PATH],
    target: { tabId: id },
  });
};

const getValidHostnamePattern = (url = "") => {
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== "http:" && protocol !== "https:") return;

    return `*://${hostname}/*`;
  } catch (e) {
    if (e instanceof TypeError) return;
    throw e;
  }
};

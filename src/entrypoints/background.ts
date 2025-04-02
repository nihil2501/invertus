export default defineBackground(() => {
  browser.tabs.create({ url: browser.runtime.getURL("/options.html") });
  browser.action.onClicked.addListener(async ({ id, url }) => {
    console.debug("action", { id });
    if (!id) return;

    let activated: boolean;
    try {
      console.log("huhhhh");
      const newLocal = await sendTabToggle(id);
      console.debug({ newLocal });
      // activated = await sendTabToggle(id);
      switch (newLocal) {
        case "yes":
          activated = true;
          break;
        case "no":
          activated = false;
          break;
        default:
          throw "lolololol";
      }
      console.log("wtf 1", { activated });
    } catch (error) {
      console.log("what");
      await injectTabScripts(id);
      activated = true;
    }

    console.log("lol 1");
    const hostnamePattern = getValidHostnamePattern(url);
    if (!hostnamePattern) return;
    console.log("lol 2");

    const tabs = await browser.tabs.query({ url: hostnamePattern });
    console.debug(
      "tabs",
      tabs.map((tab) => tab.id),
    );

    const tabSends = tabs.flatMap((tab) => {
      if (!tab.id) return [];
      if (tab.id === id) return [];

      console.log("wtf 2", { activated });
      return [sendTabToggle(tab.id, activated).catch()];
    });

    await Promise.all(tabSends);
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
  console.debug("sendTabToggle", { id, activated });

  return browser.tabs.sendMessage(id, {
    type: CONSTANTS.MESSAGES.TOGGLE,
    payload: activated,
  });
};

const injectTabScripts = async (id: number) => {
  console.debug("injectTabScripts", { id });

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

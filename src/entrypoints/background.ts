export default defineBackground(() => {
  browser.action.onClicked.addListener(async ({ id, url }) => {
    try {
      // if (id) await activateTab(id);

      const hostnamePattern = getValidHostnamePattern(url);
      if (!hostnamePattern) return;

      // await activateUrlPattern(hostnamePattern);
      const tabs = await browser.tabs.query({ url: hostnamePattern });

      for (const tab of tabs) {
        if (!tab.id) continue;

        // TODO: Add concurrency to this.
        const activated = (await sendTabMessage(
          tab.id,
          CONSTANTS.MESSAGE,
          activateTab,
        )) as boolean; // Umm, would we get disagreement for this hostname?
      }
    } catch (error) {
      console.error(error);
    }
  });
});

const activateUrlPattern = async (urlPattern: string) => {
  const permissions = { origins: [urlPattern] };
  const granted = await browser.permissions.request(permissions);
  if (!granted) return;

  await browser.scripting.unregisterContentScripts();
  await browser.scripting.registerContentScripts([
    {
      css: [CONSTANTS.STYLE.PATH],
      id: CONSTANTS.STYLE.ID,
      matches: [urlPattern],
    },
    {
      id: CONSTANTS.CONTENT.ID,
      js: [CONSTANTS.CONTENT.PATH],
      matches: [urlPattern],
    },
  ]);
};

const activateTab = async (id: number) => {
  await browser.scripting.insertCSS({
    files: [CONSTANTS.STYLE.PATH],
    origin: "USER",
    target: { tabId: id },
  });

  await browser.scripting.executeScript({
    files: [CONSTANTS.CONTENT.PATH],
    target: { tabId: id },
  });
};

async function sendTabMessage(
  id: number,
  message: string,
  prepare?: (id: number) => Promise<void>,
) {
  try {
    return await browser.tabs.sendMessage(id, message);
  } catch (error) {
    if (!prepare) throw error;

    await prepare(id);
    return await sendTabMessage(id, message);
  }
}

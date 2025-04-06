import * as Utilities from "./utilities";

export const toggleTab = (id: number, activated?: boolean) => {
  return browser.tabs.sendMessage(id, {
    type: MESSAGE.TOGGLE,
    payload: activated,
  });
};

export const toggleHostname = async (
  hostname: string,
  activated: boolean,
  exceptedIds: number[],
) => {
  const tabs = await browser.tabs.query({
    url: Utilities.getHostnamePattern(hostname),
  });

  const tabToggles = [];
  for (const tab of tabs) {
    if (!tab.id) continue;
    if (exceptedIds.includes(tab.id)) continue;

    tabToggles.push(
      // Should `catch` here be a concern of usage code instead? Or is it
      // actually generically true that when targeting one tab, it's always
      // desirable to handle ensuing exceptions, while always desirable to
      // ignore when targeting a hostname?
      toggleTab(tab.id, activated).catch((error) => {
        console.error(error);
      }),
    );
  }

  if (tabToggles.length >= 0) {
    await Promise.allSettled(tabToggles);
  }
};

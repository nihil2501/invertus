export default defineBackground(() => {
  /*****************************************************************************
   *                                                                           *
   *                                  TOGGLE                                   *
   *                                                                           *
   ****************************************************************************/
  browser.action.onClicked.addListener(async ({ id, url }) => {
    const hostname = getHostname(url);
    if (!hostname) return;
    if (!id) return;

    let on: boolean;
    try {
      on = await browser.tabs.sendMessage(id, MESSAGE.TOGGLE);
    } catch (error) {
      await Install.inject(id);
      on = true;
    }

    if (on) {
      await Store.refresh(hostname);
    } else {
      await Store.remove(hostname);
    }
  });

  /*****************************************************************************
   *                                                                           *
   *                                  VISITED                                  *
   *                                                                           *
   ****************************************************************************/
  browser.runtime.onMessage.addListener((message, sender) => {
    if (MESSAGE.VISITED !== message) return;

    const hostname = getHostname(sender.url);
    if (!hostname) return;

    Store.refresh(hostname);
  });

  /*****************************************************************************
   *                                                                           *
   *                                  REMEMBER                                 *
   *                                                                           *
   ****************************************************************************/
  browser.commands.onCommand.addListener((message) => {
    if (MESSAGE.REMEMBER !== message) return;

    const url = browser.runtime.getURL("/options.html");
    browser.tabs.create({ url });
  });
});

/*******************************************************************************
 *                                                                             *
 *                                   HELPERS                                   *
 *                                                                             *
 ******************************************************************************/

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

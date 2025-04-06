import * as TabMessaging from "./tab-messaging";
import * as Utilities from "./utilities";
import * as ContentScriptInstallation from "./content-script-installation";
import * as HostnameStorage from "./hostname-storage";

export default defineBackground(() => {
  // Just used for debugging.
  browser.tabs.create({ url: browser.runtime.getURL("/options.html") });

  browser.action.onClicked.addListener(async ({ id, url }) => {
    const hostname = Utilities.getHostname(url);
    if (!hostname) return;
    if (!id) return;

    let on: boolean;
    try {
      on = await TabMessaging.toggleTab(id);
    } catch (error) {
      await ContentScriptInstallation.inject(id);
      on = true;
    }

    await TabMessaging.toggleHostname(hostname, on, [id]);

    if (on) {
      await HostnameStorage.refresh(hostname);
    } else {
      await HostnameStorage.remove(hostname);
    }
  });

  browser.commands.onCommand.addListener(async () => {
    const values = await HostnameStorage.get();
    console.debug({ values });
  });
});

// const activateUrlPattern = async (urlPattern: string) => {
//   const permissions = { origins: [urlPattern] };
//   const granted = await browser.permissions.request(permissions);
//   if (!granted) return;

//   await browser.scripting.unregisterContentScripts();
//   await browser.scripting.registerContentScripts([
//     {
//       css: [CONSTANTS.SCRIPTS.STYLE.PATH],
//       id: CONSTANTS.SCRIPTS.STYLE.ID,
//       matches: [urlPattern],
//     },
//     {
//       id: CONSTANTS.SCRIPTS.CONTENT.ID,
//       js: [CONSTANTS.SCRIPTS.CONTENT.PATH],
//       matches: [urlPattern],
//     },
//   ]);
// };

export const register = (hs: string[]) => reconcile(OP.REGISTER, hs);
export const preview = (hs: string[]) => reconcile(OP.PREVIEW, hs);
export const inject = async (id: number) => {
  await browser.scripting.insertCSS({
    files: [SCRIPT.STYLE.PATH],
    origin: "USER",
    target: { tabId: id },
  });

  await browser.scripting.executeScript({
    files: [SCRIPT.CONTENT.PATH],
    target: { tabId: id },
  });
};

/*******************************************************************************
 *                                                                             *
 *                                   HELPERS                                   *
 *                                                                             *
 ******************************************************************************/

const reconcile = async (op: Op, after: string[]) => {
  const originsBefore = (await browser.permissions.getAll()).origins ?? [];
  const before = originsBefore.map(getHostname);

  if (OP.REGISTER === op) {
    await browser.permissions.remove({ origins: originsBefore });
    await browser.scripting.unregisterContentScripts();

    if (after.length > 0) {
      const originsAfter = after.map(getHostnamePattern);
      await browser.permissions.request({ origins: originsAfter });

      await browser.scripting.registerContentScripts([
        {
          css: [SCRIPT.STYLE.PATH],
          id: SCRIPT.STYLE.ID,
          matches: originsAfter,
        },
        {
          id: SCRIPT.CONTENT.ID,
          js: [SCRIPT.CONTENT.PATH],
          matches: originsAfter,
        },
      ]);
    }
  }

  const added = after.filter((h) => !before.includes(h));
  const removed = before.filter((h) => !after.includes(h));

  return { added, removed };
};

const getHostnamePattern = (hostname: string) => `*://${hostname}/*`;
const getHostname = (hostnamePattern: string) => hostnamePattern.slice(4, -2);

type Op = keyof typeof OP;
const OP = { REGISTER: "REGISTER", PREVIEW: "PREVIEW" } as const;

const SCRIPT = {
  STYLE: {
    ID: "style",
    PATH: "content-scripts/style.css",
  },
  CONTENT: {
    ID: "content",
    PATH: "content-scripts/content.js",
  },
};

export const Install = {
  register(hs: string[]) {
    return reconcile(OP.REGISTER, hs);
  },

  preview(hs: string[]) {
    return reconcile(OP.PREVIEW, hs);
  },

  inject(id: number) {
    return Promise.all([
      browser.scripting.insertCSS({
        files: [SCRIPT.STYLE.PATH],
        origin: "USER",
        target: { tabId: id },
      }),

      browser.scripting.executeScript({
        files: [SCRIPT.CONTENT.PATH],
        target: { tabId: id },
      }),
    ]);
  },
};

/*******************************************************************************
 *                                                                             *
 *                                   HELPERS                                   *
 *                                                                             *
 ******************************************************************************/

const reconcile = async (op: Op, after: string[]) => {
  let { origins = [] } = await browser.permissions.getAll();
  origins = origins.filter((o) => !REQUIRED_ORIGINS.includes(o));
  const before = origins.map(getHostname);

  if (OP.REGISTER === op) {
    await browser.permissions.remove({ origins });
    await browser.scripting.unregisterContentScripts();

    if (after.length > 0) {
      origins = after.map(getHostnamePattern);
      await browser.permissions.request({ origins });

      await browser.scripting.registerContentScripts([
        {
          css: [SCRIPT.STYLE.PATH],
          id: SCRIPT.STYLE.ID,
          matches: origins,
        },
        {
          id: SCRIPT.CONTENT.ID,
          js: [SCRIPT.CONTENT.PATH],
          matches: origins,
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
const REQUIRED_ORIGINS = ["http://localhost/*"];

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

export const Installation = {
  async inject(id: number) {
    await browser.scripting.insertCSS({
      files: [INSTANCE.STYLE.PATH],
      origin: "USER",
      target: { tabId: id },
    });

    await browser.scripting.executeScript({
      files: [INSTANCE.CONTENT.PATH],
      target: { tabId: id },
    });
  },

  async register() {
    const after = await Hostnames.get();
    let before: string[] = [];

    let { origins } = await browser.permissions.getAll();
    if (origins) {
      origins = origins.filter((origin) => !REQUIRED_ORIGINS.includes(origin));
      before = origins.map(getHostname);

      await browser.permissions.remove({ origins });
    }

    origins = after.map(getHostnamePattern);
    await browser.permissions.request({ origins });

    await browser.scripting.unregisterContentScripts();
    if (origins.length > 0) {
      await browser.scripting.registerContentScripts([
        {
          css: [INSTANCE.STYLE.PATH],
          id: INSTANCE.STYLE.ID,
          matches: origins,
        },
        {
          id: INSTANCE.CONTENT.ID,
          js: [INSTANCE.CONTENT.PATH],
          matches: origins,
        },
      ]);
    }

    const added = after.filter((h) => !before.includes(h));
    const removed = before.filter((h) => !after.includes(h));

    return { added, removed };
  },
};

const getHostnamePattern = (hostname: string) => {
  return `*://${hostname}/*`;
};

const getHostname = (hostnamePattern: string) => {
  return hostnamePattern.slice(4, -2);
};

const REQUIRED_ORIGINS = ["http://localhost/*"];

const DIRECTORY = "content-scripts";

type Instance = {
  ID: `${string}-${typeof EXTENSION_ID}`;
  PATH: `${typeof DIRECTORY}/${string}`;
};

const INSTANCE: Record<string, Instance> = {
  STYLE: {
    ID: `style-${EXTENSION_ID}`,
    PATH: `${DIRECTORY}/style.css`,
  },
  CONTENT: {
    ID: `content-${EXTENSION_ID}`,
    PATH: `${DIRECTORY}/content.js`,
  },
};

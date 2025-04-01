const EXTENSION_ID = "invertus";

export const CONSTANTS = {
  CLASS: EXTENSION_ID,

  MESSAGES: {
    TOGGLE: `${EXTENSION_ID}-toggle`,
    VISITED: `${EXTENSION_ID}-visited`,
  },

  SCRIPTS: {
    STYLE: {
      ID: `${EXTENSION_ID}-style`,
      PATH: "content-scripts/style.css",
    },

    CONTENT: {
      ID: `${EXTENSION_ID}-content`,
      PATH: "content-scripts/content.js",
    },
  },
};

export const getValidHostnamePattern = (url = "") => {
  try {
    const parsedUrl = new URL(url);
    for (const { value, property } of URL_INVALID_RULES) {
      if (parsedUrl[property] === value) return;
    }

    return `*://${parsedUrl.hostname}/*`;
  } catch (e) {
    if (e instanceof TypeError) return;
    throw e;
  }
};

const URL_INVALID_RULES: Array<{
  property: "hostname" | "protocol";
  value: string;
}> = [
  { property: "hostname", value: "ogs.google.com" },
  { property: "protocol", value: "chrome:" },
  { property: "protocol", value: "about:" },
];

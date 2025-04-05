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

export const inject = async (id: number) => {
  await browser.scripting.insertCSS({
    files: [INSTANCE.STYLE.PATH],
    origin: "USER",
    target: { tabId: id },
  });

  await browser.scripting.executeScript({
    files: [INSTANCE.CONTENT.PATH],
    target: { tabId: id },
  });
};

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

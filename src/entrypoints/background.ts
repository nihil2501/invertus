export default defineBackground(() => {
  browser.action.onClicked.addListener(({ id, url }) => {
    whenHostnameValid(url, styleHostname);
    if (id) styleTab(id);
  });
});

const EXTENSION_ID = "invertus";
const STYLE_ID = `${EXTENSION_ID}-style`;
const CSS_PATH = "content-scripts/style.css";

const styleHostname = async (hostname: string) => {
  const matchPattern = `*://${hostname}/*`;

  // const permissions = { origins: [matchPattern] };
  // const granted = await browser.permissions.request(permissions);
  // if (!granted) return;

  browser.scripting.unregisterContentScripts(() => {
    browser.scripting.registerContentScripts([
      {
        id: STYLE_ID,
        matches: [matchPattern],
        css: [CSS_PATH],
      },
    ]);
  });
};

const styleTab = async (tabId: number) => {
  const cssInjection: chrome.scripting.CSSInjection = {
    files: [CSS_PATH],
    origin: "USER",
    target: { tabId },
  };

  browser.scripting.removeCSS(cssInjection);
  browser.scripting.insertCSS(cssInjection);
};

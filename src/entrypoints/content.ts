export default defineContentScript({
  registration: "runtime",

  main() {
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message !== MESSAGE.TOGGLE) return false;

      sendResponse(toggle());
      return false;
    });

    browser.runtime.sendMessage(MESSAGE.VISITED);
    toggle();
  },
});

const toggle = () => {
  const classes = document.documentElement.classList;
  return classes.toggle(EXTENSION_ID);
};

export default defineContentScript({
  registration: "runtime",

  main() {
    browser.runtime.onMessage.addListener((message) => {
      if (message !== CONSTANTS.MESSAGE) return;
      return document.documentElement.classList.toggle(CONSTANTS.CLASS);
    });
  },
});

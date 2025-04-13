export default defineContentScript({
  registration: "runtime",

  main() {
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (MESSAGE.TOGGLE !== message) return;

      sendResponse(toggle());
    });

    browser.runtime.sendMessage(MESSAGE.VISITED);
    toggle();
  },
});

const toggle = () => document.documentElement.classList.toggle("invertus");

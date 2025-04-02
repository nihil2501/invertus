export default defineContentScript({
  registration: "runtime",

  main() {
    browser.runtime.onMessage.addListener(({ type, payload: activated }) => {
      if (type !== CONSTANTS.MESSAGES.TOGGLE) return;
      console.debug("message", { activated });
      return toggle(activated) ? "yes" : "no";
    });

    console.debug("load", { activated: true });
    toggle(true);

    // This script can be loaded in response to an explicit user intent to
    // activate the extension; when they manually invoke the extension's action.
    //
    // In such cases, we handle the ramifications of that intent at the call
    // site that activates the extension.
    //
    // This script can also load without the user explicitly expressing intent
    // to activate the extension; at some point in the past they asked for the
    // extension to be active persistently for some host, and have now navigated
    // to that host.
    //
    // In these cases, we don't have an expression of intent to handle, but
    // we do still want to notice the event; to let us keep our list of most
    // relevant hosts up to date.
    //
    // In the explicit intent case, there is other code that notices the event
    // too, which makes this message redundant, but in a way that is harmless.
    browser.runtime.sendMessage(CONSTANTS.MESSAGES.VISITED);
  },
});

const toggle = (activated?: boolean) => {
  const result = document.documentElement.classList.toggle(
    CONSTANTS.CLASS,
    activated,
  );

  console.debug("toggle", {
    classes: document.documentElement.classList,
    result,
  });

  return result;
};

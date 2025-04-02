import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: "src",
  manifest: {
    permissions: ["scripting", "activeTab", "storage"],
    optional_host_permissions: ["<all_urls>"],
    action: {},
    commands: {
      _execute_action: {
        description: "Invert this webpage's colors.",
        suggested_key: {
          default: "Ctrl+I",
          mac: "MacCtrl+I",
        },
      },
    },
  },
  webExt: {
    startUrls: ["developer.chrome.com", "developer.chrome.com"],
    chromiumArgs: [
      "--auto-open-devtools-for-tabs",
      "--user-data-dir=./.wxt/chrome-data",
      "--hide-crash-restore-bubble",
    ],
  },
});

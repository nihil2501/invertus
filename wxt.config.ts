import { defineConfig } from "wxt";

export default defineConfig({
  extensionApi: "chrome",
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
});

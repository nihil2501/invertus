import { defineConfig } from "wxt";

export default defineConfig({
  extensionApi: "chrome",
  srcDir: "src",
  manifest: {
    permissions: ["scripting", "activeTab", "tabs", "webNavigation", "storage"],
    host_permissions: ["*://*/*"],
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
  hooks: {
    "build:manifestGenerated": (_wxt, manifest) => {
      manifest.content_scripts ??= [];
      manifest.content_scripts.push({
        css: ["content-scripts/style.css"],
        matches: ["*://*/*"],
      });
    },
  },
});

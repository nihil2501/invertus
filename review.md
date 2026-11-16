# Invertus review

Reviewed at commit `eb58252` on 2026-11-15. Scope: everything under `src/`, `wxt.config.ts`, and the tooling config.

How it was checked:

- Both targets were built (`wxt build`, `wxt build -b firefox`) and the output manifests and bundles inspected.
- The store bug (item 2) was reproduced in Node.
- Everything else is from reading the code and browser documentation. Nothing was run in a browser.

The overall design is sound: `activeTab` gives a zero-permission toggle, the stylesheet is gated behind a class, the hostname list is a capped most-recent-first list in sync storage, and the options page previews permission changes before asking for them.

## Intended, not a bug

Toggling a remembered site off does not stick on its own. The toggle removes the hostname from the store, but the registration and permission stay until the button on the options page is pressed. The next page load on that site re-inverts it and sends `VISITED`, which puts the hostname back (`src/entrypoints/content.ts:11-12`, `src/entrypoints/background.ts:38`).

This is by design. It is recorded here so a later review does not flag it again.

## Chrome behaviour bugs

### 1. Remembered pages flash un-inverted on every load

`registerContentScripts` in `src/utils/install.ts:45-56` sets no `runAt`, so both entries use the default `document_idle`. The class that activates the stylesheet is added only after the page has painted, so each load shows the original colours first.

Fix: add `runAt: "document_start"` to both entries. `content.ts` only touches `document.documentElement`, which exists by then.

### 2. The store corrupts hostnames that share a prefix

`src/utils/store.ts:27-28` removes a hostname by stripping the substring `,host` wherever it appears, including at the start of a longer hostname.

Reproduced:

```text
before             ,a.org,example.com.au,example.com,z.net
remove example.com ,a.org.au,z.net

before             ,x.com,t.co,t.com
refresh t.co       ,t.co,x.comm
```

Two entries are damaged each time: the longer hostname loses its head, and its tail is glued onto the entry before it.

Fix: compare whole entries. This keeps the leading-delimiter format:

```ts
let valuesRaw = (await getRaw())
  .split(VALUE_DELIMITER)
  .filter((v) => v !== "" && v !== value)
  .map((v) => `${VALUE_DELIMITER}${v}`)
  .join("");
```

### 3. Declining the permission prompt wipes every remembered site

`reconcile` in `src/utils/install.ts:38-43` removes all granted origins and unregisters all scripts first, then calls `permissions.request` and ignores its result. If the prompt is declined, nothing is granted any more, the scripts are registered for origins they cannot run on, and the options page still shows "Executed!" with the hostnames under "Added".

Fix: request the new origins first and check the boolean result. Only remove dropped origins and re-register once the request has succeeded, and show a failure message otherwise.

### 4. Extension updates silently break remembering

Browsers clear dynamically registered content scripts when an extension updates, but keep its granted permissions. There is no `runtime.onInstalled` handler, so after an update:

- Remembered sites stop inverting on load.
- The options page preview shows nothing to add or remove, because it compares the store against permissions rather than registrations. Pressing the button does repair it, since `register` always re-registers.

Open tabs have a second problem after an update. Their old content script can no longer receive messages, but the page still has the `invertus` class. The first click fails to reach it, injects a fresh script, and that script's `toggle()` turns the page off while its `VISITED` message records the hostname as on.

Fix: re-register from the granted origins in `runtime.onInstalled` when the reason is `update`. Have the content script report the state its first `toggle()` actually produced, so the background stores what happened.

### 5. Videos play as negatives

`src/entrypoints/style.content.css:2-4` inverts the whole page and re-inverts only `img` and SVG `image`. `video`, `canvas` and CSS background images stay inverted. The comment in the file already accepts this trade-off for images; for video it is almost always wrong.

Fix: add at least `video` to the re-invert selector.

## Firefox

`build:firefox` produces a Manifest V2 extension that cannot work. From the built output:

- **Background script:** it calls `browser.action.onClicked`, which does not exist in V2. That is the first statement in the background, so it throws before any listener registers.
- **Permissions:** `optional_host_permissions` is dropped from the built manifest and nothing replaces it, so no host can be requested.
- **Shortcut:** `_execute_action` is not renamed to `_execute_browser_action`, so the toggle shortcut is not bound.

Building Firefox as Manifest V3 would address those three. One problem remains under V3:

- **Remember button:** Firefox only allows `permissions.request` synchronously inside a user-action handler. `Store.get()` and three calls inside `reconcile` are awaited before it, so the request is rejected.

## Smaller issues

- **Shortcuts on Windows and Linux:** `Ctrl+Shift+I` is the DevTools shortcut in both browsers and `Ctrl+I` is Page Info in Firefox, so the defaults in `wxt.config.ts` collide there. The macOS defaults use the Control key and are fine. Not tested.
- **Store writes:** every page load on a remembered site writes to sync storage, even when the hostname is already first. Sync storage has per-minute and per-hour write limits. Skipping the write when nothing changed avoids it.
- **Store races:** `update` in `store.ts` is an unserialised read-modify-write. Two updates close together, such as several remembered tabs restoring at once, can lose one.
- **Body background:** the white `body` fallback in `style.content.css:9-11` behaves differently on the two paths. Click-injected pages use the user origin (`install.ts:14`), where it loses to any site rule and is a true fallback. Remembered pages get it at author origin, where its specificity beats a plain `body` rule and can override the site's own colour. Wrapping the selector as `:where(html.invertus) body` would make it a fallback on both. This is from reading the cascade rules, not tested.
- **Origin parsing:** `getHostname` in `install.ts:67` assumes every granted origin looks like `*://host/*`. An origin granted through the browser's own site-access settings has a different form and shows up as garbage in the preview.
- **Options page:** the `remember` shortcut opens a new tab every time; `runtime.openOptionsPage()` would reuse one. A `register` that throws leaves the preview on screen with no error.
- **Registrations:** the stylesheet and the script are registered as two entries with the same `matches`. One entry with both `css` and `js` would do.
- **Tooling:** pnpm 12 ignores `onlyBuiltDependencies` in `package.json`, so every `pnpm` script first prints an install error about ignored build scripts. The script itself still runs.
- **Leftovers:** the `console.debug` in `Store.get`, `public/wxt.svg` (shipped in the build), and `src/assets/typescript.svg`.
- **Tests:** there are none. The store's string handling is the obvious first candidate.

## Missing

Nothing shows whether a page is inverted, or whether its site is remembered or only pending. A per-tab badge set with `browser.action.setBadgeText` from the background, on each toggle and `VISITED`, would cover it.

## Suggested order

1. Items 1 and 2: a few lines each, and both affect everyday use.
2. Item 3: the only one that destroys state.
3. Item 5, then item 4.
4. Firefox, if it matters.

## Sources

- [MDN: RegisteredContentScript](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/scripting/RegisteredContentScript) (scripts cleared on update)
- [MDN: User actions](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/User_actions) (user-action status lost after a promise)
- [Bugzilla 1892655](https://bugzilla.mozilla.org/show_bug.cgi?id=1892655) (`permissions.request` after `await`)

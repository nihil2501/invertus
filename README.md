# Brainstorming
- `activeTab`
  - Enabling
    - `scripting.registerContentScripts` w/ `<all_urls>`
    - `activeTab`
    - `host_permissions`
  - Indicator
    - `declarativeContent.onPageChanged`? ((un)register in bulk)

<!-- - Datastructure storing most relevant inverted sites -->

```
chrome.scripting.registerContentScripts
```

```js
browser.permissions.onAdded
browser.permissions.onRemoved

browser.commands.onCommand
browser.action.onClicked

browser.webNavigation.onCommitted
browser.storage.onChanged
```

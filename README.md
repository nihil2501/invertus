- `hostnameEnabled`
- Presence of `.invertus`?

- Want to treat in `storage.sync` as source-of-truth on `host_permissions`
- But `host_permissions` can be modified elsewise, so we could listen and reconcile into `storage.sync`
- But is there an infinite loop in that logic?

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

* error visibility -- await whole call stack? `lastError`?
* sensitive data (urls) in unencrypted sync storage? warn about security?
* storage size limit -- surface to user? 512 for persisted inverted is plenty
* storage size limitations -- lru? metadata entry that holds a heap? chunked db?
* storage throughput limitations -- debounce?
* could we await stuff from debounce? enqueue multiple clicks somewhere? when would we ever need to worry about achieving inconsistent state? does it ever truly matter? they can always manually correct one day.
* can experiment -- fill it up and see about error visibility
* also see what usage looks like irl for me
* storage `AccessLevel`??
* revoking permissions leaves siblings inconsistent--probably not fixable since no permission
* 2 edge cases kinda, retract permissions leaves some tabs stranded / unable to be bulk updated
  * re-grant permissions from action when tab was persisted will actually toggle-off. "rare" behavior wrt set of all possible scenarios.
  * should just reload page (but i don't really see a nice spot in the code for the idea)
  * or rather just update with true. again don't see where to put the code for the idea.
  * ^ probably just leave it alone. just can't matter that much probably. so we're saying the one case to consider more than anything is 1st promotion.
  * remodel: associating more deeply; promoting behavior, permissions per behavior
* something for evaluating persisteds? probably just LRU thing is nicest :)
* no type checking in parcel by default? maybe want a ci setup that does that (and run tests) https://parceljs.org/languages/typescript/#type-checking

* TEST - playwright? puppeteer? https://playwright.dev/docs/chrome-extensions https://pptr.dev/guides/chrome-extensions
* DEPLOY - gh action -> package & upload to store? e.g. https://circleci.com/blog/continuously-deploy-a-chrome-extension/
* ICONS
* maybe just offer a way to clear storage (obscure keystroke). doing lru means we have to constantly notice their browsing, which seems too much. funny thing about this is it might explode complexity about modes stuff. not sure

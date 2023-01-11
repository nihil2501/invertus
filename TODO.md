* consider icons and different sizes and action icon as distinct from others
* error visibility -- await whole call stack? `lastError`?
* sensitive data (urls) in unencrypted sync storage?
* storage size limit -- surface to user? 512 for persisted inverted is plenty
* storage size limitations -- lru? metadata entry that holds a heap? chunked db?
* storage throughput limitations -- debounce?
* can experiment -- fill it up and see about error visibility
* also see what usage looks like irl for me
* storage `AccessLevel`
* lots of debugging
* option place to go simple -> full
* optionally persist in full mode
* revoking permissions leaves siblings inconsistent--probably not fixable since no permission
* decide among all combinations on ideal behavior of persist action
* 2 edge cases kinda, retract permissions leaves some tabs stranded / unable to be bulk updated
  * re-grant permissions from action when tab was persisted will actually toggle-off. "rare" behavior wrt set of all possible scenarios.
  * should just reload page (but i don't really see a nice spot in the code for the idea)
  * or rather just update with true. again don't see where to put the code for the idea.
  * remodel incoming: associating more deeply; promoting behavior, permissions per behavior
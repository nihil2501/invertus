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
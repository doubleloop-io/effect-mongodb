---
"effect-mongodb": patch
---

Fix errors on `DocumentCollection`:

- `insertOne` data-first overload when only passing collection and doc
- `insertMany` return type is always `InsertManyResult`
- `rename` now returns a new `DocumentCollection` (like `Collection.rename`)
- `dropIndex` now returns void (like `Collection.dropIndex`)

---
"effect-mongodb": minor
---

Make `FindCursor` and `DocumentFindCursor` lazy and reusable

A cursor is now an immutable description of the query (collection, filter and options). The MongoDB driver cursor is
created every time a terminal function (`toArray`, `toArrayEither`, `toStream`, `toStreamEither`) runs, so the same
cursor can be executed multiple times and each run reads fresh data from the database. Builder functions (`filter`,
`project`, `sort`, `limit`) always return a new cursor without touching the original one.

The `cursor` field, which exposed the driver cursor, has been replaced by `collection`, `filter` and `options`.

---
"effect-mongodb": minor
"@effect-mongodb/services": minor
---

Support Effect v4 (`effect@^4.0.0-beta.103`). Effect v3 is no longer supported.

The module layout is unchanged, but the types follow v4:

- schemas are `Schema.Codec<A, I, R, R>` instead of `Schema.Schema<A, I, R>`. The
  single `R` type parameter on `Collection`, `FindCursor` and `AggregationCursor`
  is kept, and feeds both the decoding and encoding service slots.
- decoding failures are `SchemaError` instead of `ParseError`.
- `FindCursor.toArrayEither` and `FindCursor.toStreamEither` keep their names but
  yield `Result` instead of `Either`.
- `DbService.Tag` and `MongoClientService.Tag` are built with `Context.Service`,
  and `DbService.Service` / `MongoClientService.Service` read the shape off the
  key rather than through `Context.Tag.Service`.

Note that `Schema.Date` changed meaning in Effect v4: it no longer decodes ISO
strings. Collections that persist dates as strings need `Schema.DateFromString`.

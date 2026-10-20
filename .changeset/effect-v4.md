---
"effect-mongodb": minor
"@effect-mongodb/services": minor
---

Migrate to Effect v4.

From this version, this library supports only Effect v4. For Effect v3, use version 0.7.x (which will receive bug fixes
when necessary).

Read the breaking changes of Effect v4 that also affect this library in
the [Effect migration guide](https://github.com/Effect-TS/effect/blob/4cddd3c41e71fc4990d37c42b1bcf2ce3780b41d/MIGRATION.md).

**Breaking changes in `effect-mongodb`**

- The peer dependency `effect` is `^4.0.5`.
- `Schema.Codec<A, I, RD, RE>` replaces `Schema.Schema<A, I, R>` in `Db.collection`, `DocumentCollection.typed`,
  `DocumentFindCursor.typed`, `Collection.aggregate` and `FindCursor.project`. `RD` and `RE` are the requirements to
  decode and to encode.
- `Collection<A, I, RD, RE>` replaces `Collection<A, I, R>`.
- `FindCursor<A, I, RD, RE>` replaces `FindCursor<A, I, R>`.
- `AggregationCursor<A, I, RD, RE>` replaces `AggregationCursor<A, I, R>`.
- The requirements of operations that only decode documents are `RD`. The requirements of operations that only encode
  documents are `RE`. The requirements of all other operations are `RD | RE`.
- `Schema.SchemaError` replaces `ParseResult.ParseError` in the error channel of `Collection`, `FindCursor` and
  `AggregationCursor` operations.
- `FindCursor.toArrayResult` replaces `FindCursor.toArrayEither`. It returns `Result` values instead of `Either` values.
- `FindCursor.toStreamResult` replaces `FindCursor.toStreamEither`. It returns `Result` values instead of `Either`
  values.
- The span names, the `db.operation.name` span attribute and the `MongoError` messages of `toArrayResult` and
  `toStreamResult` use the new names. For example, `mongodb.FindCursor.toArrayResult` replaces
  `mongodb.FindCursor.toArrayEither`.

**Breaking changes in `@effect-mongodb/services`**

- `DbService.Service` replaces the `DbService.Tag` value and type.
- `DbService.Shape<T>` replaces the `DbService.Service<T>` type helper.
- `MongoClientService.Service` replaces the `MongoClientService.Tag` value and type.
- `MongoClientService.Shape<T>` replaces the `MongoClientService.Service<T>` type helper.
- The name `Service` has a new meaning in both modules (inherited from Effect). Change `Service<T>` to `Shape<T>` before
  you change `Tag` to `Service`.
- Layers are memoized across `Effect.provide` calls (inherited from Effect). If you provide the same `DbInstance` or
  `MongoClientService` layer instance more than once, you get a single `MongoClient`. Use `Layer.fresh` or
  `Effect.provide(layer, { local: true })` to build a new client every time.

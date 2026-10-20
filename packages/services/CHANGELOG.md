# @effect-mongodb/services

## 0.8.0

### Minor Changes

- [`4432755`](https://github.com/doubleloop-io/effect-mongodb/commit/4432755cf28a234fa3b3ddba6ad2ccf6372b39a0) Thanks [@devmatteini](https://github.com/devmatteini), [@gabeins](https://github.com/gabeins)! - Migrate to Effect v4.

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

### Patch Changes

- Updated dependencies [[`4432755`](https://github.com/doubleloop-io/effect-mongodb/commit/4432755cf28a234fa3b3ddba6ad2ccf6372b39a0)]:
  - effect-mongodb@0.8.0

## 0.7.0

### Minor Changes

- [`196e4e7`](https://github.com/doubleloop-io/effect-mongodb/commit/196e4e7caf347ea52c0ec4886480b8867f7358d0) Thanks @devmatteini! - All effect-mongodb ecosystem packages now share a single version number and are released together. Previously, packages
  were versioned independently (e.g. effect-mongodb@0.6.0, @effect-mongodb/services@0.2.5), making compatibility between
  packages difficult to track. Now, if you use effect-mongodb@0.7.0, the matching services package is
  @effect-mongodb/services@0.7.0.

### Patch Changes

- Updated dependencies [[`196e4e7`](https://github.com/doubleloop-io/effect-mongodb/commit/196e4e7caf347ea52c0ec4886480b8867f7358d0)]:
  - effect-mongodb@0.7.0

## 0.2.5

### Patch Changes

- Updated dependencies [[`4c098d5`](https://github.com/doubleloop-io/effect-mongodb/commit/4c098d5114aaee314dcaec98670a27d6ea71cdc9)]:
  - effect-mongodb@0.6.0

## 0.2.4

### Patch Changes

- Updated dependencies [[`f23f662`](https://github.com/doubleloop-io/effect-mongodb/commit/f23f662366b196b5f4307036a648ab2c816320e8)]:
  - effect-mongodb@0.5.0

## 0.2.3

### Patch Changes

- Updated dependencies [[`fb7d3ef`](https://github.com/doubleloop-io/effect-mongodb/commit/fb7d3efc51d0f6ae392e85b970c09643cf03a70f), [`3f672cc`](https://github.com/doubleloop-io/effect-mongodb/commit/3f672cc33798bc7fd433250cfc4cab5fc2c71305)]:
  - effect-mongodb@0.4.0

## 0.2.2

### Patch Changes

- Updated dependencies [[`facda4f`](https://github.com/doubleloop-io/effect-mongodb/commit/facda4f91f42546dfc8180942ed812b0aec79e0d)]:
  - effect-mongodb@0.3.2

## 0.2.1

### Patch Changes

- [`191c6c6`](https://github.com/doubleloop-io/effect-mongodb/commit/191c6c695c52b2e62f09ef8ba25a208223e258b1) Thanks [@VenomAV](https://github.com/VenomAV)! - Bump patch to work around changeset issue in the previous release

- Updated dependencies [[`191c6c6`](https://github.com/doubleloop-io/effect-mongodb/commit/191c6c695c52b2e62f09ef8ba25a208223e258b1)]:
  - effect-mongodb@0.3.1

## 0.2.0

### Minor Changes

- [`988e46e`](https://github.com/doubleloop-io/effect-mongodb/commit/988e46e6604fee6ebc0c99d5246d0596ce19be66) Thanks [@VenomAV](https://github.com/VenomAV)! - Add helper type to extract service type from tag

### Patch Changes

- Updated dependencies [[`4c9d190`](https://github.com/doubleloop-io/effect-mongodb/commit/4c9d190b1fedcb31c15bbceecbabfa019f234354)]:
  - effect-mongodb@0.3.0

## 0.1.1

### Patch Changes

- [`be876d2`](https://github.com/doubleloop-io/effect-mongodb/commit/be876d2f90a93afbc19b99138f7f0aec3abcda82) Thanks [@devmatteini](https://github.com/devmatteini)! - First public release of `@effect-mongodb/services`.

## 0.1.0

### Minor Changes

- [`7f6168f`](https://github.com/doubleloop-io/effect-mongodb/commit/7f6168fc7fa83815e51f670294bd3aeb30c235ce) Thanks [@devmatteini](https://github.com/devmatteini)! - First release of `@effect-mongodb/services`.
  Check out the README documentation for more information.

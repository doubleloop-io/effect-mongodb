# effect-mongodb

## 0.1.2

### Patch Changes

- [`5de41db`](https://github.com/doubleloop-io/effect-mongodb/commit/5de41dbbacb1fcfd4c38cc3e9c24a992741d94b6) Thanks [@devmatteini](https://github.com/devmatteini)! - Fix errors on `DocumentCollection`:

  - `insertOne` data-first overload when only passing collection and doc
  - `insertMany` return type is always `InsertManyResult`
  - `rename` now returns a new `DocumentCollection` (like `Collection.rename`)
  - `dropIndex` now returns void (like `Collection.dropIndex`)

## 0.1.1

### Patch Changes

- [`e167c6f`](https://github.com/doubleloop-io/effect-mongodb/commit/e167c6fe94cda5b9ee04f17496e4dd303a06769d) Thanks [@devmatteini](https://github.com/devmatteini)! - fix: set base tsconfig types to node and remove DOM from lib

- [`468805d`](https://github.com/doubleloop-io/effect-mongodb/commit/468805d21bc921d7690060e95e4dd447aeca149b) Thanks [@devmatteini](https://github.com/devmatteini)! - Add close to MongoClient

- [`a0c6e2e`](https://github.com/doubleloop-io/effect-mongodb/commit/a0c6e2e37bb72e96e999c416602ef34b5264e2a9) Thanks [@devmatteini](https://github.com/devmatteini)! - Improve the composability of functions by returning mutable arrays and accepting readonly arrays as input parameters.

- [`122d816`](https://github.com/doubleloop-io/effect-mongodb/commit/122d816a53c6ea41b254e8ea76d7a8d17a44ce8f) Thanks [@devmatteini](https://github.com/devmatteini)! - Add connectScoped to MongoClient

## 0.1.0

### Minor Changes

- [`e52f494`](https://github.com/doubleloop-io/effect-mongodb/commit/e52f4944ccae2dea261138781460b3d40567eb53) Thanks [@devmatteini](https://github.com/devmatteini)! - upgrade mongodb version to 6.9.0 to fully support mongodb server 8

## 0.0.5

### Patch Changes

- [`4287f85`](https://github.com/doubleloop-io/effect-mongodb/commit/4287f85efbd7aa91e96d0a382622b4cc46bbe748) Thanks [@devmatteini](https://github.com/devmatteini)! - Remove services related types from Db and MongoClient that are moved to the new package `@effect-mongodb/services`

- [`00874e9`](https://github.com/doubleloop-io/effect-mongodb/commit/00874e936a7e54925c848749a54df536171587ac) Thanks [@VenomAV](https://github.com/VenomAV)! - Add estimetedDocumentCount and countDocuments in Collection and DocumentCollection

## 0.0.4

### Patch Changes

- [`a8530e7`](https://github.com/doubleloop-io/effect-mongodb/commit/a8530e703a9b065f660f31db5cf9ea9dca12bd69) Thanks [@devmatteini](https://github.com/devmatteini)! - Add dropIndex function in Collection and DocumentCollection

- [`6cc9c61`](https://github.com/doubleloop-io/effect-mongodb/commit/6cc9c6108cab2d4c8ed2555fb603df5791f75f1c) Thanks [@devmatteini](https://github.com/devmatteini)! - Add createIndex function in Collection and DocumentCollection

- [`16c906a`](https://github.com/doubleloop-io/effect-mongodb/commit/16c906af4ef5afc5b62522c73c9f571176ee5048) Thanks [@devmatteini](https://github.com/devmatteini)! - Add findOneAndReplace function in Collection and DocumentCollection

- [`6f0a8d4`](https://github.com/doubleloop-io/effect-mongodb/commit/6f0a8d4404a74238fbc901fae5a212c1c7c6b2bc) Thanks [@devmatteini](https://github.com/devmatteini)! - Use Filter type in FindCursor and DocumentFindCursor filter function.
  Add optional filter parameter to find functions in Collection and DocumentCollection

- [`d50d85d`](https://github.com/doubleloop-io/effect-mongodb/commit/d50d85db297b5d6e8e4b7db2f151c64bf9ac3c9e) Thanks [@devmatteini](https://github.com/devmatteini)! - Add drop function in Collection and DocumentCollection

## 0.0.3

### Patch Changes

- [`04a7439`](https://github.com/doubleloop-io/effect-mongodb/commit/04a74397723f0f4ae68af8defba49dff8f31fc31) Thanks [@devmatteini](https://github.com/devmatteini)! - - Db.listCollections with ListCollectionsCursor
  - Db.dropCollection
  - DocumentCollection/Collection.deleteOne
  - DocumentCollection/Collection.deleteMany
  - DocumentCollection/Collection.updateMant
  - DocumentCollection/Collection.replaceOne
  - DocumentCollection/Collection.rename
  - DocumentCollection/Collection.createIndexes
  - DocumentCollection/Collection.aggregate with DocumentAggregationCursor and AggregationCursor

## 0.0.2

### Patch Changes

- [`9f05864`](https://github.com/doubleloop-io/effect-mongodb/commit/9f05864b7119728b0a27f144732b08d437f53c95) Thanks [@VenomAV](https://github.com/VenomAV)! - Setup for first release

  - Add some documentation for contributing and releasing
  - Basic functionalities in `effect-mongodb`

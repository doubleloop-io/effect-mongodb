# effect-mongodb

A [MongoDB](https://github.com/mongodb/node-mongodb-native) toolkit for [Effect](https://github.com/Effect-TS/effect/).

## Install

```shell
pnpm install effect-mongodb effect mongodb
```

Note that `effect`, and `mongodb` are requested as peer dependencies.

## Usage

TODO

## Design decisions

Here is a list of design decisions made and principles followed while developing his package:
1. **Effect first**: the package is designed to be used with Effect. It is not a general-purpose MongoDB client.
2. **Coherent API signature**: the same signatures of the underlying MongoDB driver are used as much as possible, with
   few exceptions:
   1. `Option` is used instead of `null` or `undefined` values.
   2. Some operation options, which have an impact on the shape of API response, may be replaced with stricter functions
      (e.g. `projection` in `find` operation).
3. **Schema-based vs Document-based**: the package provides two sets of functions.

   The first set is based on MongoDB's `Document` type, therefore, without any runtime validation on the shape of the
   document, and signatures mostly identical to those of the original APIs.
   All modules belonging to this set are prefixed with `Document`, e.g. `DocumentCollection` or `DocumentFindCursor`.

   The second set is based on Schema, therefore, provides runtime validation.
   Its functions may have slightly different signatures than the original APIs, since they enforce stricter types than
   the first set.
   All modules belonging to this set don't have any prefix, e.g. `Collection` or `FindCursor`.
   While developing the package, this set of functions is the one we put more effort into.
4. **Error handling**: we introduced a new error type `MongoError`, derived from 
   [`TaggedError`](https://effect.website/docs/data-types/data/#taggederror), to wrap the original MongoDB errors.
   The current implementation is basic, but it will be extended to provide more detailed information and a finer error
   handling.

## Development

Export `EFFECT_MONGODB_DEBUG` environment variable to see debug logs in tests.

To inspect MongoDB test instance:

1. Copy the connection string from the console
2. Open Mongo Compass
3. Paste the URI
4. Click Advanced Connection Options
5. Enable `Direct Connection`
6. Click `Connect`

Useful links to explore mongodb package:

- https://mongodb.github.io/node-mongodb-native/Next/classes/Collection.html (with links to source code)
- https://www.mongodb.com/docs/v7.0/reference/method/js-collection/
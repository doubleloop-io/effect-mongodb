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

### Cursors

All cursor modules provide, at least, two functions:
- `toArray`, which returns an `Effect` that resolves to an array of documents.
  This kind of function loads all the documents from the cursor and returns them as an array.
- `toStream`, which returns a [`Stream`](https://effect.website/docs/stream/introduction/) of documents.
  Instead, this kind of function leverages the async iterable nature of the underlying MongoDB driver's cursor, and
  allows to process the documents one by one, without loading them all in memory.

For document-based modules, these functions can only fail with a `MongoError`, while for schema-based modules, they can
fail also with a `ParseError`. For this reason, the schema-based modules provide two additional functions:
`toArrayEither` and `toStreamEither`. These functions return, respectively, an array and a stream of `Either`s, allowing
the code to process all the documents, even if some of them are invalid.
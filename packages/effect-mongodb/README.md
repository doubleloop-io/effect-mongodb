# effect-mongodb

![NPM Version](https://img.shields.io/npm/v/effect-mongodb?link=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Feffect-mongodb)
![minzipped size](https://badgen.net/bundlephobia/minzip/effect-mongodb)
![dependency count](https://badgen.net/bundlephobia/dependency-count/effect-mongodb)
![tree shaking support](https://badgen.net/bundlephobia/tree-shaking/effect-mongodb)

A [MongoDB](https://github.com/mongodb/node-mongodb-native) toolkit for [Effect](https://github.com/Effect-TS/effect/).

## Install

```shell
pnpm install effect-mongodb effect mongodb
```

Note that `effect`, and `mongodb` are requested as peer dependencies.

## Usage

Here is a simple example of how to use this package:

```typescript
import { Effect, Schema } from "effect"
import { Collection, Db, FindCursor, MongoClient } from "effect-mongodb"

const Person = Schema.Struct({
   name: Schema.String,
   age: Schema.Number,
   birthday: Schema.Date
})

const program = Effect.gen(function*() {
   const client = yield* MongoClient.connectScoped("mongodb://localhost:27017")
   const db = MongoClient.db(client, "source-db")
   const sourceCollection = Db.collection(db, "source", Person)
   const destinationCollection = Db.collection(db, "destination", Person)

   const items = yield* Collection.find(sourceCollection).pipe(FindCursor.toArray)

   yield* Collection.insertMany(destinationCollection, items)
})

await program.pipe(Effect.scoped, Effect.runPromise)
```

Find more examples in the [examples](./examples) folder.

## Design decisions

Here is a list of design decisions made and principles followed while developing his package:
1. **Effect first**: the package is designed to be used with Effect. It is not a general-purpose MongoDB client.
2. **Coherent API signature**: the same signatures of the underlying MongoDB driver are used as much as possible, with
   few exceptions:
   1. `Option` is used instead of `null` or `undefined` values.
   2. Some operation options, which have an impact on the shape of API response, may be replaced with stricter functions
      (e.g. `projection` in `find` operation).
3. **Document-based API**: these API are based on MongoDB's `Document` type, therefore, without any runtime validation
   on the shape of the document. 
   
   Signatures are mostly identical to those of the original APIs.
   
   All modules belonging to this set are prefixed with `Document`, e.g. `DocumentCollection` or `DocumentFindCursor`.
   
   These API are mainly useful for incremental adoption in existing codebases, and to allow quick prototyping when validation is redundant. 
4. **Schema-based API**: these API are based on Schema, therefore, provides runtime validation.
   
   Functions may have slightly different signatures than the original APIs, since they enforce stricter types than
   the Document-based API.
   
   All modules belonging to this set don't have any prefix, e.g. `Collection` or `FindCursor`.
   
   While developing the package, this set of functions is the one we put more effort into.
5. **Error handling**: we introduced a new error type `MongoError`, derived from 
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

## Known limitations

### Filters for Schema-based operations

Using `Filter` in schema-based operations (e.g. `find`, `deleteOne`, etc.) is not as straightforward as in
document-based operations.
Given a `Schema<A, I, R>`, `A` is the runtime/decoded type of the documents, while `I` is the persisted/encoded type of
the same documents.
Therefore, to filter documents in MongoDB, the client must provide a filter of type `Filter<I>`, where `Filter` is the
type provided by the MongoDB driver.

A better approach, given the design of the Schema-based operations, would be to provide filters as `Filter<A>`, but
we didn't yet find a straightforward way to map `Filter<A>` to `Filter<I>`.
For this reason, we decided to keep the original MongoDB filter type.
In the future, this may (hopefully) change.

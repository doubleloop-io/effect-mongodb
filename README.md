# effect-mongodb

[![CI status](https://github.com/doubleloop-io/effect-mongodb/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/doubleloop-io/effect-mongodb/actions/workflows/ci.yml)
![effect-mongodb npm version](https://img.shields.io/npm/v/effect-mongodb?label=effect-mongodb%20npm&link=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Feffect-mongodb)

A [MongoDB](https://github.com/mongodb/node-mongodb-native) toolkit for [Effect](https://github.com/Effect-TS/effect/).

```typescript
import * as Collection from "effect-mongodb/Collection"
import * as Db from "effect-mongodb/Db"
import * as FindCursor from "effect-mongodb/FindCursor"
import * as MongoClient from "effect-mongodb/MongoClient"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

const Person = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
  birthday: Schema.Date
})

const program = Effect.gen(function* () {
  const client = yield* MongoClient.connectScoped("mongodb://localhost:27017")
  const db = MongoClient.db(client, "source-db")
  const sourceCollection = Db.collection(db, "source", Person)
  const destinationCollection = Db.collection(db, "destination", Person)

  const items = yield* Collection.find(sourceCollection).pipe(FindCursor.toArray)

  yield* Collection.insertMany(destinationCollection, items)
})

await program.pipe(Effect.scoped, Effect.runPromise)
```

## Documentation

[effect-mongodb](packages/effect-mongodb/README.md) is the **core package** that provides effectful APIs to work with
MongoDB.

## MongoDB driver compatibility

We adhere to the [MongoDB driver compatibility](https://www.mongodb.com/docs/drivers/node/current/compatibility/)
guidelines, so minor releases might break compatibility with older MongoDB servers.

For example, upgrading the Node.js driver from 6.8 to 6.10 will make it incompatible with MongoDB server 3.6.

## Roadmap

- [ ] [@effect-mongodb/services](packages/services/README.md) package to provide Effect services/layers to use with
  `effect-mongodb`

## Contributing

Take a look at the [CONTRIBUTING.md](CONTRIBUTING.md) guidelines.

### Found a Bug?

If you find a bug in the source code, you can help us
by [submitting an issue](https://github.com/doubleloop-io/effect-mongodb/issues/new) to our GitHub Repository. Even
better, you can submit a Pull Request with a fix.

### Missing a Feature?

You can request a new feature
by [submitting a discussion](https://github.com/doubleloop-io/effect-mongodb/discussions/new/choose) to
our GitHub Repository.
If you would like to implement a new feature, please consider the size of the change and reach out to
better coordinate our efforts and prevent duplication of work.

## License

`effect-mongodb` is made available under the terms of the MIT License.

See the [LICENSE](LICENSE) file for license details.

# @effect-mongodb/services

![NPM Version](https://img.shields.io/npm/v/@effect-mongodb/services?link=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2F@effect-mongodb/services)
![minzipped size](https://badgen.net/bundlephobia/minzip/@effect-mongodb/services)
![dependency count](https://badgen.net/bundlephobia/dependency-count/@effect-mongodb/services)
![tree shaking support](https://badgen.net/bundlephobia/tree-shaking/@effect-mongodb/services)

[Effect](https://github.com/Effect-TS/effect/) services for [effect-mongodb](../effect-mongodb/README.md).

## Install

```shell
pnpm install @effect-mongodb/services effect-mongodb effect mongodb
```

Note that `effect-mongodb`, `effect`, and `mongodb` are requested as peer dependencies.

## Usage

Here is a simple example of how to use this package:

```typescript
import { DbInstance, DbService } from "@effect-mongodb/services"
import { Effect, Schema } from "effect"
import { Collection, Db, FindCursor } from "effect-mongodb"

const Person = Schema.Struct({ name: Schema.String, age: Schema.Number, birthday: Schema.Date })

// 1. Create your database service tag
const Database = DbService.Tag("Database")

const program = Effect.gen(function* () {
  // 2. Use your database service
  const db = yield* Database
  const sourceCollection = Db.collection(db, "source", Person)
  const destinationCollection = Db.collection(db, "destination", Person)

  const items = yield* Collection.find(sourceCollection).pipe(FindCursor.toArray)
  yield* Collection.insertMany(destinationCollection, items)
})

// 3. Create a layer for your service, using DbInstance higher-level API
const DatabaseLive = DbInstance.layer(
  Database,
  { database: { name: "mydb" }, client: { url: "mongodb://localhost:27017" } }
)

await program.pipe(
  // 4. Provide the layer to your program
  Effect.provide(DatabaseLive),
  Effect.runPromise
)
```

Find more examples in the [examples](./examples) folder.

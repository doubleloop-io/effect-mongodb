import * as Db from "effect-mongodb/Db"
import * as F from "effect/Function"
import * as Schema from "effect/Schema"

declare const database: Db.Db

const User = Schema.Struct({
  id: Schema.NumberFromString
})

// -------------------------------------------------------------------------------------
// documentCollection
// -------------------------------------------------------------------------------------

// $ExpectType DocumentCollection
Db.documentCollection(database, "users")

// $ExpectType DocumentCollection
F.pipe(database, Db.documentCollection("users"))

// -------------------------------------------------------------------------------------
// collection
// -------------------------------------------------------------------------------------

// $ExpectType Collection<{ readonly id: number; }, { readonly id: string; }, never>
Db.collection(database, "users", User)

// $ExpectType Collection<{ readonly id: number; }, { readonly id: string; }, never>
F.pipe(database, Db.collection("users", User))

// -------------------------------------------------------------------------------------
// listCollections
// -------------------------------------------------------------------------------------

// $ExpectType ListCollectionsCursor<DefaultCollectionInfo>
Db.listCollections(database)

// TODO: this currently returns `(db: Db) => ListCollectionsCursor<DefaultCollectionInfo>`, why?
// //$ExpectType ListCollectionsCursor<DefaultCollectionInfo>
// F.pipe(database, Db.listCollections)

// $ExpectType ListCollectionsCursor<DefaultCollectionInfo>
Db.listCollections(database, { foo: "bar" })

// $ExpectType ListCollectionsCursor<DefaultCollectionInfo>
F.pipe(database, Db.listCollections({ foo: "bar" }))

// $ExpectType NameOnlyListCollectionsCursor
Db.listCollections(database, { foo: "bar" }, { nameOnly: true })

// $ExpectType NameOnlyListCollectionsCursor
F.pipe(database, Db.listCollections({ foo: "bar" }, { nameOnly: true }))

// $ExpectType FullListCollectionsCursor
Db.listCollections(database, { foo: "bar" }, { nameOnly: false })

// $ExpectType FullListCollectionsCursor
F.pipe(database, Db.listCollections({ foo: "bar" }, { nameOnly: false }))

// -------------------------------------------------------------------------------------
// dropCollection
// -------------------------------------------------------------------------------------

// $ExpectType Effect<boolean, MongoError, never>
Db.dropCollection(database, "users")

// $ExpectType Effect<boolean, MongoError, never>
F.pipe(database, Db.dropCollection("users"))

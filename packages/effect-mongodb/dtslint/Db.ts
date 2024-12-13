import * as DBX from "effect-mongodb/Db"
import * as F from "effect/Function"
import * as Schema from "effect/Schema"
import type { Db } from "mongodb"

declare const database: Db

const User = Schema.Struct({
  id: Schema.NumberFromString
})

// -------------------------------------------------------------------------------------
// documentCollection
// -------------------------------------------------------------------------------------

// $ExpectType DocumentCollection
DBX.documentCollection(database, "users")

// $ExpectType DocumentCollection
F.pipe(database, DBX.documentCollection("users"))

// // -------------------------------------------------------------------------------------
// // collection
// // -------------------------------------------------------------------------------------
//
// // $ExpectType Collection<{ readonly id: number; }, { readonly id: string; }, never>
// DBX.collection(database, "users", User)
//
// // $ExpectType Collection<{ readonly id: number; }, { readonly id: string; }, never>
// F.pipe(database, DBX.collection("users", User))
//
// // -------------------------------------------------------------------------------------
// // listCollections
// // -------------------------------------------------------------------------------------
//
// // $ExpectType ListCollectionsCursor<DefaultCollectionInfo>
// DBX.listCollections(database)
//
// // TODO: this currently returns `(db: Db) => ListCollectionsCursor<DefaultCollectionInfo>`, why?
// // //$ExpectType ListCollectionsCursor<DefaultCollectionInfo>
// // F.pipe(database, DBX.listCollections)
//
// // $ExpectType ListCollectionsCursor<DefaultCollectionInfo>
// DBX.listCollections(database, { foo: "bar" })
//
// // $ExpectType ListCollectionsCursor<DefaultCollectionInfo>
// F.pipe(database, DBX.listCollections({ foo: "bar" }))
//
// // $ExpectType NameOnlyListCollectionsCursor
// DBX.listCollections(database, { foo: "bar" }, { nameOnly: true })
//
// // $ExpectType NameOnlyListCollectionsCursor
// F.pipe(database, DBX.listCollections({ foo: "bar" }, { nameOnly: true }))
//
// // $ExpectType FullListCollectionsCursor
// DBX.listCollections(database, { foo: "bar" }, { nameOnly: false })
//
// // $ExpectType FullListCollectionsCursor
// F.pipe(database, DBX.listCollections({ foo: "bar" }, { nameOnly: false }))
//
// // -------------------------------------------------------------------------------------
// // dropCollection
// // -------------------------------------------------------------------------------------
//
// // $ExpectType Effect<boolean, MongoError, never>
// DBX.dropCollection(database, "users")
//
// // $ExpectType Effect<boolean, MongoError, never>
// F.pipe(database, DBX.dropCollection("users"))

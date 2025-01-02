import * as MongoClient from "effect-mongodb/MongoClient"
import * as F from "effect/Function"

declare const client: MongoClient.MongoClient

// -------------------------------------------------------------------------------------
// connect
// -------------------------------------------------------------------------------------

// $ExpectType Effect<MongoClient, MongoError, never>
MongoClient.connect("mongodb://localhost:27017")

// -------------------------------------------------------------------------------------
// close
// -------------------------------------------------------------------------------------

// $ExpectType Effect<void, MongoError, never>
MongoClient.close(client)

// $ExpectType Effect<void, MongoError, never>
F.pipe(client, MongoClient.close)

// $ExpectType Effect<void, MongoError, never>
MongoClient.close(client, true)

// $ExpectType Effect<void, MongoError, never>
F.pipe(client, MongoClient.close(true))

// -------------------------------------------------------------------------------------
// db
// -------------------------------------------------------------------------------------

// $ExpectType Db
MongoClient.db(client, "my-db")

// $ExpectType Db
F.pipe(client, MongoClient.db("my-db"))

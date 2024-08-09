/**
 * @since 0.0.1
 */
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import type { Db, DbOptions, MongoClientOptions } from "mongodb"
import { MongoClient as MongoClient_ } from "mongodb"
import * as MongoError from "./MongoError.js"

export type MongoClient = MongoClient_

export const connect = (url: string, options?: MongoClientOptions) =>
  Effect.promise(() => MongoClient_.connect(url, options)).pipe(
    Effect.catchAll(MongoError.mongoErrorDie<MongoClient_>("connect error"))
  )

export const db: {
  (dbName?: string, options?: DbOptions): (client: MongoClient) => Effect.Effect<Db>
  (client: MongoClient, dbName?: string, options?: DbOptions): Effect.Effect<Db>
} = F.dual(
  3,
  (client: MongoClient, dbName?: string, options?: DbOptions) => Effect.sync(() => client.db(dbName, options))
)

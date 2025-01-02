/**
 * @since 0.0.1
 */
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import type { Db, DbOptions, MongoClientOptions } from "mongodb"
import { MongoClient as MongoClient_ } from "mongodb"
import * as MongoError from "./MongoError.js"

export type MongoClient = MongoClient_

export const connect = (
  url: string,
  options?: MongoClientOptions
): Effect.Effect<MongoClient, MongoError.MongoError> =>
  Effect.promise(() => MongoClient_.connect(url, options)).pipe(
    Effect.catchAll(MongoError.mongoErrorDie<MongoClient_>("connect error"))
  )

export const close: {
  (force?: boolean): (client: MongoClient) => Effect.Effect<void, MongoError.MongoError>
  (client: MongoClient, force?: boolean): Effect.Effect<void, MongoError.MongoError>
} = F.dual(
  (args) => isMongoClient(args[0]),
  (client: MongoClient, force?: boolean): Effect.Effect<void, MongoError.MongoError> =>
    Effect.promise(() => client.close(force)).pipe(
      Effect.catchAll(MongoError.mongoErrorDie<void>("close error"))
    )
)

export const db: {
  (dbName?: string, options?: DbOptions): (client: MongoClient) => Db
  (client: MongoClient, dbName?: string, options?: DbOptions): Db
} = F.dual(
  (args) => isMongoClient(args[0]),
  (client: MongoClient, dbName?: string, options?: DbOptions): Db => client.db(dbName, options)
)

const isMongoClient = (x: unknown) => x instanceof MongoClient_

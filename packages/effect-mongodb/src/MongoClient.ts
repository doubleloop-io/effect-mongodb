/**
 * @since 0.0.1
 */
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import type * as Scope from "effect/Scope"
import type { DbOptions, MongoClientOptions } from "mongodb"
import { MongoClient as MongoClient_ } from "mongodb"
import * as Db from "./Db.js"
import { mongoErrorOrDie } from "./internal/mongo-error.js"
import * as MongoError from "./MongoError.js"

export class MongoClient extends Data.TaggedClass("MongoClient")<{ client: MongoClient_ }> {}

export const connect = (
  url: string,
  options?: MongoClientOptions
): Effect.Effect<MongoClient, MongoError.MongoError> =>
  Effect.promise(() => MongoClient_.connect(url, options)).pipe(
    Effect.map((client) => new MongoClient({ client })),
    Effect.catchAllDefect(mongoErrorOrDie(errorSource([new URL(url).host], "connect")))
  )

export const close: {
  (force?: boolean): (client: MongoClient) => Effect.Effect<void, MongoError.MongoError>
  (client: MongoClient, force?: boolean): Effect.Effect<void, MongoError.MongoError>
} = F.dual(
  (args) => isMongoClient(args[0]),
  ({ client }: MongoClient, force?: boolean): Effect.Effect<void, MongoError.MongoError> =>
    Effect.promise(() => client.close(force)).pipe(
      Effect.catchAllDefect(mongoErrorOrDie(errorSource(client.options.hosts.map((x) => x.host ?? "NO_HOST"), "close")))
    )
)

export type MongoClientScopedOptions = MongoClientOptions & { forceClose?: boolean }

export const connectScoped = (
  url: string,
  options?: MongoClientScopedOptions
): Effect.Effect<MongoClient, MongoError.MongoError, Scope.Scope> =>
  Effect.acquireRelease(
    connect(url, options),
    (client) => close(client, options?.forceClose).pipe(Effect.orDie)
  )

export const db: {
  (dbName?: string, options?: DbOptions): (client: MongoClient) => Db.Db
  (client: MongoClient, dbName?: string, options?: DbOptions): Db.Db
} = F.dual(
  (args) => isMongoClient(args[0]),
  ({ client }: MongoClient, dbName?: string, options?: DbOptions): Db.Db =>
    new Db.Db({ db: client.db(dbName, options) })
)

const isMongoClient = (x: unknown) => x instanceof MongoClient

const errorSource = (hosts: Array<string>, functionName: string) =>
  new MongoError.ClientErrorSource({ module: "MongoClient", functionName, hosts })

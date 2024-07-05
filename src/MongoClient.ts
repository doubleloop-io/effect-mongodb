import * as Context from "effect/Context"

/**
 * @since 0.0.1
 */
export type MongoClient = {
  databaseName: string
  databaseName1: string
}
export const MongoClient = Context.GenericTag<MongoClient>("@doubleloop-io/effect-mongodb/MongoClient")

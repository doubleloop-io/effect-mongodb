/*

type MongoClientService<T> = {
  client: Effect.Effect<MongoClient, MongoError>
} & Brand<T>

const FooClient = MongoClient.Tag("FooClient")

const { clientEffect } = yield* _(FooClient)
const client = yield* _(clientEffect)
const db = yield* _(MongoClient.db(client, "source"))
const sourceCollection = yield* _(Db.collection(db, "records"))
....

Layer.effect(
  FooClient,
  Effect.gen(function() {
    const client = yield *(MongoClient.connect("mongodb://localhost:27017"))
    return FooClient.of({ client })
  })
)

type DbService<T> = {
  db: Effect.Effect<Db, MongoError>
} & Brand<T>

const FooDb = Db.Tag("FooDb")

const { dbFactory } = yield* _(FooDb)
const db = yield* _(dbFactory)
const sourceCollection = yield* _(Db.collection(db, "records"))
....

**** Db.ts ****
const ServiceLive = (dbTag, clientTag, dbName: Effect<string>) => Layer.effect(
  dbTag,
  Effect.gen(function() {
    const { clientEffect } = yield* _(clientTag)
    const dbEffect = F.pipe(
      Effect.all([clientEffect, dbName]),
      Effect.map(([client, dbName]) => MongoClient.db(client, dbName)),
      Effect.cached
    )

    return dbTag.of({ db: dbEffect })
  })
)


**** MongoClient.ts ****
const MongoClientLiveFromConfig

*/

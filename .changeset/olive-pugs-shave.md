---
"effect-mongodb": minor
---

Trace every MongoDB operation with its own span

Each operation that talks to MongoDB (client, database, collection and cursor functions) is now wrapped in a `client`
span named `mongodb.<Module>.<function>`, carrying the OpenTelemetry database attributes `db.system.name`,
`db.operation.name`, `db.namespace`, `db.collection.name` and, for client operations, `server.address` and
`server.port`.

`MongoError` messages now report the module name without the `Impl` suffix, e.g. `Error in Collection.findOne` instead
of `Error in CollectionImpl.findOne`.

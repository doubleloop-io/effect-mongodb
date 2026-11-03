---
"effect-mongodb": patch
---

Add `server.address` and `server.port` to `Db`, `Collection` and cursor spans

`Db`, `DocumentCollection`, `Collection` and every cursor now carry the client hosts, so their spans expose the same
`server.address`/`server.port` attributes as the `MongoClient` spans. With an SRV connection string `server.address` is
the SRV host and `server.port` is omitted. With several seed hosts the server attributes are omitted.

`DbErrorSource` and `CollectionErrorSource` gain `hosts` and `srvHost`; `ClientErrorSource` gains `srvHost`.

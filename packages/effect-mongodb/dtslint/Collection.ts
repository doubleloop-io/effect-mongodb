import * as Collection from "effect-mongodb/Collection"
import * as DocumentCollection from "effect-mongodb/DocumentCollection"
import * as FindCursor from "effect-mongodb/FindCursor"
import * as F from "effect/Function"
import * as Schema from "effect/Schema"

const MyType = Schema.Struct({
  birthday: Schema.Date
})

declare const documentCollection: DocumentCollection.DocumentCollection
const collection = DocumentCollection.typed(documentCollection, MyType)

// $ExpectType Effect<{ readonly birthday: Date; }[], MongoError | ParseError, never>
FindCursor.toArray(Collection.find(collection, { birthday: "2024-11-28" }))

// $ExpectType Effect<{ readonly birthday: Date; }[], MongoError | ParseError, never>
F.pipe(collection, Collection.find({ birthday: "2024-11-28" }), FindCursor.toArray)

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | ParseError, never>
Collection.findOne(collection, { birthday: "2024-11-28" })

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | ParseError, never>
F.pipe(collection, Collection.findOne({ birthday: "2024-11-28" }))

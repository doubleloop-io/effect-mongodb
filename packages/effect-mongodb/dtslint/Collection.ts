import * as Collection from "effect-mongodb/Collection"
import * as DocumentCollection from "effect-mongodb/DocumentCollection"
import * as FindCursor from "effect-mongodb/FindCursor"
import * as F from "effect/Function"
import * as Schema from "effect/Schema"

const MyType = Schema.Struct({
  birthday: Schema.Date
})
type MyType = typeof MyType.Type
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type MyTypeEncoded = typeof MyType.Encoded

declare const myType: MyType

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

// $ExpectType Effect<InsertOneResult<Document>, MongoError | ParseError, never>
Collection.insertOne(collection, myType)

// $ExpectType Effect<InsertOneResult<Document>, MongoError | ParseError, never>
F.pipe(collection, Collection.insertOne(myType))

// $ExpectType Effect<InsertManyResult<Document>, MongoError | ParseError, never>
Collection.insertMany(collection, [myType])

// $ExpectType Effect<InsertManyResult<Document>, MongoError | ParseError, never>
F.pipe(collection, Collection.insertMany([myType]))

// $ExpectType Effect<DeleteResult, MongoError, never>
Collection.deleteOne(collection, { birthday: "2024-11-28" })

// $ExpectType Effect<DeleteResult, MongoError, never>
F.pipe(collection, Collection.deleteOne({ birthday: "2024-11-28" }))

// $ExpectType Effect<DeleteResult, MongoError, never>
Collection.deleteMany(collection, { birthday: "2024-11-28" })

// $ExpectType Effect<DeleteResult, MongoError, never>
F.pipe(collection, Collection.deleteMany({ birthday: "2024-11-28" }))

// $ExpectType Effect<UpdateResult<Document>, MongoError, never>
Collection.updateMany(collection, { birthday: "2024-11-28" }, { $set: { birthday: "2024-11-29" } })

// $ExpectType Effect<UpdateResult<Document>, MongoError, never>
F.pipe(collection, Collection.updateMany({ birthday: "2024-11-28" }, { $set: { birthday: "2024-11-29" } }))

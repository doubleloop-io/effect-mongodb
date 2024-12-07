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

// -------------------------------------------------------------------------------------
// find
// -------------------------------------------------------------------------------------

// $ExpectType Effect<{ readonly birthday: Date; }[], MongoError | ParseError, never>
FindCursor.toArray(Collection.find(collection, { birthday: "2024-11-28" }))

// $ExpectType Effect<{ readonly birthday: Date; }[], MongoError | ParseError, never>
F.pipe(collection, Collection.find({ birthday: "2024-11-28" }), FindCursor.toArray)

// -------------------------------------------------------------------------------------
// findOne
// -------------------------------------------------------------------------------------

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | ParseError, never>
Collection.findOne(collection, { birthday: "2024-11-28" })

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | ParseError, never>
F.pipe(collection, Collection.findOne({ birthday: "2024-11-28" }))

// -------------------------------------------------------------------------------------
// insertOne
// -------------------------------------------------------------------------------------

// $ExpectType Effect<InsertOneResult<Document>, MongoError | ParseError, never>
Collection.insertOne(collection, myType)

// $ExpectType Effect<InsertOneResult<Document>, MongoError | ParseError, never>
F.pipe(collection, Collection.insertOne(myType))

// -------------------------------------------------------------------------------------
// insertMany
// -------------------------------------------------------------------------------------

// $ExpectType Effect<InsertManyResult<Document>, MongoError | ParseError, never>
Collection.insertMany(collection, [myType])

// $ExpectType Effect<InsertManyResult<Document>, MongoError | ParseError, never>
F.pipe(collection, Collection.insertMany([myType]))

// -------------------------------------------------------------------------------------
// deleteOne
// -------------------------------------------------------------------------------------

// $ExpectType Effect<DeleteResult, MongoError, never>
Collection.deleteOne(collection, { birthday: "2024-11-28" })

// $ExpectType Effect<DeleteResult, MongoError, never>
F.pipe(collection, Collection.deleteOne({ birthday: "2024-11-28" }))

// -------------------------------------------------------------------------------------
// deleteMany
// -------------------------------------------------------------------------------------

// $ExpectType Effect<DeleteResult, MongoError, never>
Collection.deleteMany(collection, { birthday: "2024-11-28" })

// $ExpectType Effect<DeleteResult, MongoError, never>
F.pipe(collection, Collection.deleteMany({ birthday: "2024-11-28" }))

// -------------------------------------------------------------------------------------
// updateMany
// -------------------------------------------------------------------------------------

// $ExpectType Effect<UpdateResult<Document>, MongoError, never>
Collection.updateMany(collection, { birthday: "2024-11-28" }, { $set: { birthday: "2024-11-29" } })

// $ExpectType Effect<UpdateResult<Document>, MongoError, never>
F.pipe(collection, Collection.updateMany({ birthday: "2024-11-28" }, { $set: { birthday: "2024-11-29" } }))

// -------------------------------------------------------------------------------------
// replaceOne
// -------------------------------------------------------------------------------------

// $ExpectType Effect<Document | UpdateResult<Document>, MongoError | ParseError, never>
Collection.replaceOne(collection, { birthday: "2024-11-28" }, myType)

// $ExpectType Effect<Document | UpdateResult<Document>, MongoError | ParseError, never>
F.pipe(collection, Collection.replaceOne({ birthday: "2024-11-28" }, myType))

// -------------------------------------------------------------------------------------
// findOneAndReplace
// -------------------------------------------------------------------------------------

// $ExpectType Effect<ModifyResult<{ readonly birthday: Date; }>, MongoError | ParseError, never>
Collection.findOneAndReplace(collection, { birthday: "2024-11-28" }, myType, { includeResultMetadata: true })

// $ExpectType Effect<ModifyResult<{ readonly birthday: Date; }>, MongoError | ParseError, never>
F.pipe(collection, Collection.findOneAndReplace({ birthday: "2024-11-28" }, myType, { includeResultMetadata: true }))

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | ParseError, never>
Collection.findOneAndReplace(collection, { birthday: "2024-11-28" }, myType, { includeResultMetadata: false })

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | ParseError, never>
F.pipe(collection, Collection.findOneAndReplace({ birthday: "2024-11-28" }, myType, { includeResultMetadata: false }))

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | ParseError, never>
Collection.findOneAndReplace(collection, { birthday: "2024-11-28" }, myType, { comment: "any" })

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | ParseError, never>
F.pipe(collection, Collection.findOneAndReplace({ birthday: "2024-11-28" }, myType, { comment: "any" }))

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | ParseError, never>
Collection.findOneAndReplace(collection, { birthday: "2024-11-28" }, myType)

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | ParseError, never>
F.pipe(collection, Collection.findOneAndReplace({ birthday: "2024-11-28" }, myType))

// -------------------------------------------------------------------------------------
// rename
// -------------------------------------------------------------------------------------

// $ExpectType Effect<Collection<{ readonly birthday: Date; }, { readonly birthday: string; }, never>, MongoError, never>
Collection.rename(collection, "new-collection")

// $ExpectType Effect<Collection<{ readonly birthday: Date; }, { readonly birthday: string; }, never>, MongoError, never>
F.pipe(collection, Collection.rename("new-collection"))

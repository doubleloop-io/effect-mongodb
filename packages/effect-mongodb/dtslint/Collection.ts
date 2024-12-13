import * as Collection from "effect-mongodb/Collection"
import * as DocumentCollection from "effect-mongodb/DocumentCollection"
import * as FindCursor from "effect-mongodb/FindCursor"
import * as F from "effect/Function"
import * as Schema from "effect/Schema"

// TODO: try to use class Schema to improve test assertions
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

// $ExpectType Effect<Collection<Struct<{ birthday: typeof Date$; }>>, MongoError, never>
Collection.rename(collection, "new-collection")

// $ExpectType Effect<Collection<Struct<{ birthday: typeof Date$; }>>, MongoError, never>
F.pipe(collection, Collection.rename("new-collection"))

// -------------------------------------------------------------------------------------
// drop
// -------------------------------------------------------------------------------------

// $ExpectType Effect<boolean, MongoError, never>
Collection.drop(collection)

// $ExpectType Effect<boolean, MongoError, never>
F.pipe(collection, Collection.drop())

// -------------------------------------------------------------------------------------
// createIndexes
// -------------------------------------------------------------------------------------

// $ExpectType Effect<string[], MongoError, never>
Collection.createIndexes(collection, [{ key: { birthday: 1 } }])

// $ExpectType Effect<string[], MongoError, never>
F.pipe(collection, Collection.createIndexes([{ key: { birthday: 1 } }]))

// -------------------------------------------------------------------------------------
// createIndex
// -------------------------------------------------------------------------------------

// $ExpectType Effect<string, MongoError, never>
Collection.createIndex(collection, { birthday: 1 })

// $ExpectType Effect<string, MongoError, never>
F.pipe(collection, Collection.createIndex({ birthday: 1 }))

// -------------------------------------------------------------------------------------
// dropIndex
// -------------------------------------------------------------------------------------

// $ExpectType Effect<void, MongoError, never>
Collection.dropIndex(collection, "birthday_1")

// $ExpectType Effect<void, MongoError, never>
F.pipe(collection, Collection.dropIndex("birthday_1"))

// -------------------------------------------------------------------------------------
// aggregate
// -------------------------------------------------------------------------------------

const MyAggregatedType = Schema.Struct({
  _id: Schema.Date,
  birthdays: Schema.Number
})
const groupByBirthday = [{ $group: { _id: "$birthday", birthdays: { $sum: 1 } } }]

// $ExpectType AggregationCursor<{ readonly _id: Date; readonly birthdays: number; }, { readonly _id: string; readonly birthdays: number; }, never>
Collection.aggregate(collection, groupByBirthday, MyAggregatedType)

// $ExpectType AggregationCursor<{ readonly _id: Date; readonly birthdays: number; }, { readonly _id: string; readonly birthdays: number; }, never>
F.pipe(collection, Collection.aggregate(groupByBirthday, MyAggregatedType))

// -------------------------------------------------------------------------------------
// estimatedDocumentCount
// -------------------------------------------------------------------------------------

// $ExpectType Effect<number, MongoError, never>
Collection.estimatedDocumentCount(collection)

// $ExpectType Effect<number, MongoError, never>
F.pipe(collection, Collection.estimatedDocumentCount())

// -------------------------------------------------------------------------------------
// countDocuments
// -------------------------------------------------------------------------------------

// $ExpectType Effect<number, MongoError, never>
Collection.countDocuments(collection, { birthday: "2024-11-28" })

// $ExpectType Effect<number, MongoError, never>
F.pipe(collection, Collection.countDocuments({ birthday: "2024-11-28" }))

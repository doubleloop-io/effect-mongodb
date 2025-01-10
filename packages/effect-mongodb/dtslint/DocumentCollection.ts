import * as DocumentCollection from "effect-mongodb/DocumentCollection"
import * as DocumentFindCursor from "effect-mongodb/DocumentFindCursor"
import * as F from "effect/Function"
import * as Schema from "effect/Schema"
import type { Document } from "mongodb"

const MyType = Schema.Struct({
  birthday: Schema.Date
})
type MyType = typeof MyType.Type

declare const anyDocument: Document

declare const collection: DocumentCollection.DocumentCollection

// -------------------------------------------------------------------------------------
// find
// -------------------------------------------------------------------------------------

// $ExpectType Effect<Document[], MongoError, never>
DocumentFindCursor.toArray(DocumentCollection.find(collection, { birthday: "2024-11-28" }))

// $ExpectType Effect<Document[], MongoError, never>
F.pipe(collection, DocumentCollection.find({ birthday: "2024-11-28" }), DocumentFindCursor.toArray)

// -------------------------------------------------------------------------------------
// findOne
// -------------------------------------------------------------------------------------

// $ExpectType Effect<Option<Document>, MongoError, never>
DocumentCollection.findOne(collection, { birthday: "2024-11-28" })

// $ExpectType Effect<Option<Document>, MongoError, never>
F.pipe(collection, DocumentCollection.findOne({ birthday: "2024-11-28" }))

// -------------------------------------------------------------------------------------
// insertOne
// -------------------------------------------------------------------------------------

// $ExpectType Effect<InsertOneResult<Document>, MongoError, never>
DocumentCollection.insertOne(collection, anyDocument)

// $ExpectType Effect<InsertOneResult<Document>, MongoError, never>
DocumentCollection.insertOne(collection, anyDocument, { comment: "any" })

// $ExpectType Effect<InsertOneResult<Document>, MongoError, never>
F.pipe(collection, DocumentCollection.insertOne(anyDocument))

// -------------------------------------------------------------------------------------
// insertMany
// -------------------------------------------------------------------------------------

// $ExpectType Effect<InsertManyResult<Document>, MongoError, never>
DocumentCollection.insertMany(collection, [anyDocument])

// $ExpectType Effect<InsertManyResult<Document>, MongoError, never>
F.pipe(collection, DocumentCollection.insertMany([anyDocument]))

// -------------------------------------------------------------------------------------
// deleteOne
// -------------------------------------------------------------------------------------

// $ExpectType Effect<DeleteResult, MongoError, never>
DocumentCollection.deleteOne(collection, { birthday: "2024-11-28" })

// $ExpectType Effect<DeleteResult, MongoError, never>
F.pipe(collection, DocumentCollection.deleteOne({ birthday: "2024-11-28" }))

// -------------------------------------------------------------------------------------
// deleteMany
// -------------------------------------------------------------------------------------

// $ExpectType Effect<DeleteResult, MongoError, never>
DocumentCollection.deleteMany(collection, { birthday: "2024-11-28" })

// $ExpectType Effect<DeleteResult, MongoError, never>
F.pipe(collection, DocumentCollection.deleteMany({ birthday: "2024-11-28" }))

// -------------------------------------------------------------------------------------
// updateMany
// -------------------------------------------------------------------------------------

// $ExpectType Effect<UpdateResult<Document>, MongoError, never>
DocumentCollection.updateMany(collection, { birthday: "2024-11-28" }, { $set: { birthday: "2024-11-29" } })

// $ExpectType Effect<UpdateResult<Document>, MongoError, never>
F.pipe(collection, DocumentCollection.updateMany({ birthday: "2024-11-28" }, { $set: { birthday: "2024-11-29" } }))

// -------------------------------------------------------------------------------------
// replaceOne
// -------------------------------------------------------------------------------------

// $ExpectType Effect<Document | UpdateResult<Document>, MongoError, never>
DocumentCollection.replaceOne(collection, { birthday: "2024-11-28" }, anyDocument)

// $ExpectType Effect<Document | UpdateResult<Document>, MongoError, never>
F.pipe(collection, DocumentCollection.replaceOne({ birthday: "2024-11-28" }, anyDocument))

// -------------------------------------------------------------------------------------
// findOneAndReplace
// -------------------------------------------------------------------------------------

// $ExpectType Effect<ModifyResult<Document>, MongoError, never>
DocumentCollection.findOneAndReplace(collection, { birthday: "2024-11-28" }, anyDocument, {
  includeResultMetadata: true
})

// $ExpectType Effect<ModifyResult<Document>, MongoError, never>
F.pipe(
  collection,
  DocumentCollection.findOneAndReplace({ birthday: "2024-11-28" }, anyDocument, { includeResultMetadata: true })
)

// $ExpectType Effect<Option<Document>, MongoError, never>
DocumentCollection.findOneAndReplace(collection, { birthday: "2024-11-28" }, anyDocument, {
  includeResultMetadata: false
})

// $ExpectType Effect<Option<Document>, MongoError, never>
F.pipe(
  collection,
  DocumentCollection.findOneAndReplace({ birthday: "2024-11-28" }, anyDocument, { includeResultMetadata: false })
)

// $ExpectType Effect<Option<Document>, MongoError, never>
DocumentCollection.findOneAndReplace(collection, { birthday: "2024-11-28" }, anyDocument, { comment: "any" })

// $ExpectType Effect<Option<Document>, MongoError, never>
F.pipe(collection, DocumentCollection.findOneAndReplace({ birthday: "2024-11-28" }, anyDocument, { comment: "any" }))

// $ExpectType Effect<Option<Document>, MongoError, never>
DocumentCollection.findOneAndReplace(collection, { birthday: "2024-11-28" }, anyDocument)

// $ExpectType Effect<Option<Document>, MongoError, never>
F.pipe(collection, DocumentCollection.findOneAndReplace({ birthday: "2024-11-28" }, anyDocument))

// -------------------------------------------------------------------------------------
// rename
// -------------------------------------------------------------------------------------

// $ExpectType Effect<DocumentCollection, MongoError, never>
DocumentCollection.rename(collection, "new-collection")

// $ExpectType Effect<DocumentCollection, MongoError, never>
F.pipe(collection, DocumentCollection.rename("new-collection"))

// -------------------------------------------------------------------------------------
// drop
// -------------------------------------------------------------------------------------

// $ExpectType Effect<boolean, MongoError, never>
DocumentCollection.drop(collection)

// $ExpectType Effect<boolean, MongoError, never>
F.pipe(collection, DocumentCollection.drop())

// -------------------------------------------------------------------------------------
// createIndexes
// -------------------------------------------------------------------------------------

// $ExpectType Effect<string[], MongoError, never>
DocumentCollection.createIndexes(collection, [{ key: { birthday: 1 } }])

// $ExpectType Effect<string[], MongoError, never>
F.pipe(collection, DocumentCollection.createIndexes([{ key: { birthday: 1 } }]))

// -------------------------------------------------------------------------------------
// createIndex
// -------------------------------------------------------------------------------------

// $ExpectType Effect<string, MongoError, never>
DocumentCollection.createIndex(collection, { birthday: 1 })

// $ExpectType Effect<string, MongoError, never>
F.pipe(collection, DocumentCollection.createIndex({ birthday: 1 }))

// -------------------------------------------------------------------------------------
// dropIndex
// -------------------------------------------------------------------------------------

// $ExpectType Effect<Document, MongoError, never>
DocumentCollection.dropIndex(collection, "birthday_1")

// $ExpectType Effect<Document, MongoError, never>
F.pipe(collection, DocumentCollection.dropIndex("birthday_1"))

// -------------------------------------------------------------------------------------
// aggregate
// -------------------------------------------------------------------------------------

const groupByBirthday = [{ $group: { _id: "$birthday", birthdays: { $sum: 1 } } }]

// $ExpectType DocumentAggregationCursor
DocumentCollection.aggregate(collection, groupByBirthday)

// $ExpectType DocumentAggregationCursor
F.pipe(collection, DocumentCollection.aggregate(groupByBirthday))

// -------------------------------------------------------------------------------------
// estimatedDocumentCount
// -------------------------------------------------------------------------------------

// $ExpectType Effect<number, MongoError, never>
DocumentCollection.estimatedDocumentCount(collection)

// $ExpectType Effect<number, MongoError, never>
F.pipe(collection, DocumentCollection.estimatedDocumentCount())

// -------------------------------------------------------------------------------------
// countDocuments
// -------------------------------------------------------------------------------------

// $ExpectType Effect<number, MongoError, never>
DocumentCollection.countDocuments(collection, { birthday: "2024-11-28" })

// $ExpectType Effect<number, MongoError, never>
F.pipe(collection, DocumentCollection.countDocuments({ birthday: "2024-11-28" }))

// -------------------------------------------------------------------------------------
// typed
// -----------------------------------------------------------------

// $ExpectType Collection<{ readonly birthday: Date; }, { readonly birthday: string; }, never>
DocumentCollection.typed(collection, MyType)

// $ExpectType Collection<{ readonly birthday: Date; }, { readonly birthday: string; }, never>
F.pipe(collection, DocumentCollection.typed(MyType))

// @ts-expect-error
DocumentCollection.typed(collection, Schema.Date)

// TODO the following test should work, i.e. array are not acceptable as a collection type
// // @ts-expect-error
// DocumentCollection.typed(collection, Schema.Array(MyType))

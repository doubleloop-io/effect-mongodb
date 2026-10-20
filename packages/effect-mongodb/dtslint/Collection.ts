import * as Collection from "effect-mongodb/Collection"
import * as DocumentCollection from "effect-mongodb/DocumentCollection"
import * as FindCursor from "effect-mongodb/FindCursor"
import * as F from "effect/Function"
import * as Schema from "effect/Schema"

const MyType = Schema.Struct({
  birthday: Schema.DateFromString
})
type MyType = typeof MyType.Type

declare const myType: MyType

declare const documentCollection: DocumentCollection.DocumentCollection
const collection = DocumentCollection.typed(documentCollection, MyType)

// -------------------------------------------------------------------------------------
// find
// -------------------------------------------------------------------------------------

// $ExpectType Effect<{ readonly birthday: Date; }[], MongoError | SchemaError, never>
FindCursor.toArray(Collection.find(collection, { birthday: "2024-11-28" }))

// $ExpectType Effect<{ readonly birthday: Date; }[], MongoError | SchemaError, never>
F.pipe(collection, Collection.find({ birthday: "2024-11-28" }), FindCursor.toArray)

// -------------------------------------------------------------------------------------
// findOne
// -------------------------------------------------------------------------------------

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | SchemaError, never>
Collection.findOne(collection, { birthday: "2024-11-28" })

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | SchemaError, never>
F.pipe(collection, Collection.findOne({ birthday: "2024-11-28" }))

// -------------------------------------------------------------------------------------
// insertOne
// -------------------------------------------------------------------------------------

// $ExpectType Effect<InsertOneResult<{ readonly birthday: string; }>, MongoError | SchemaError, never>
Collection.insertOne(collection, myType)

// $ExpectType Effect<InsertOneResult<{ readonly birthday: string; }>, MongoError | SchemaError, never>
F.pipe(collection, Collection.insertOne(myType))

// -------------------------------------------------------------------------------------
// insertMany
// -------------------------------------------------------------------------------------

// $ExpectType Effect<InsertManyResult<{ readonly birthday: string; }>, MongoError | SchemaError, never>
Collection.insertMany(collection, [myType])

// $ExpectType Effect<InsertManyResult<{ readonly birthday: string; }>, MongoError | SchemaError, never>
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
// updateOne
// -------------------------------------------------------------------------------------

// $ExpectType Effect<UpdateResult<{ readonly birthday: string; }>, MongoError, never>
Collection.updateOne(collection, { birthday: "2024-11-28" }, { $set: { birthday: "2024-11-29" } })

// $ExpectType Effect<UpdateResult<{ readonly birthday: string; }>, MongoError, never>
F.pipe(collection, Collection.updateOne({ birthday: "2024-11-28" }, { $set: { birthday: "2024-11-29" } }))

// -------------------------------------------------------------------------------------
// updateMany
// -------------------------------------------------------------------------------------

// $ExpectType Effect<UpdateResult<{ readonly birthday: string; }>, MongoError, never>
Collection.updateMany(collection, { birthday: "2024-11-28" }, { $set: { birthday: "2024-11-29" } })

// $ExpectType Effect<UpdateResult<{ readonly birthday: string; }>, MongoError, never>
F.pipe(collection, Collection.updateMany({ birthday: "2024-11-28" }, { $set: { birthday: "2024-11-29" } }))

// -------------------------------------------------------------------------------------
// replaceOne
// -------------------------------------------------------------------------------------

// $ExpectType Effect<Document | UpdateResult<{ readonly birthday: string; }>, MongoError | SchemaError, never>
Collection.replaceOne(collection, { birthday: "2024-11-28" }, myType)

// $ExpectType Effect<Document | UpdateResult<{ readonly birthday: string; }>, MongoError | SchemaError, never>
F.pipe(collection, Collection.replaceOne({ birthday: "2024-11-28" }, myType))

// -------------------------------------------------------------------------------------
// findOneAndReplace
// -------------------------------------------------------------------------------------

// $ExpectType Effect<ModifyResult<{ readonly birthday: Date; }>, MongoError | SchemaError, never>
Collection.findOneAndReplace(collection, { birthday: "2024-11-28" }, myType, { includeResultMetadata: true })

// $ExpectType Effect<ModifyResult<{ readonly birthday: Date; }>, MongoError | SchemaError, never>
F.pipe(collection, Collection.findOneAndReplace({ birthday: "2024-11-28" }, myType, { includeResultMetadata: true }))

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | SchemaError, never>
Collection.findOneAndReplace(collection, { birthday: "2024-11-28" }, myType, { includeResultMetadata: false })

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | SchemaError, never>
F.pipe(collection, Collection.findOneAndReplace({ birthday: "2024-11-28" }, myType, { includeResultMetadata: false }))

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | SchemaError, never>
Collection.findOneAndReplace(collection, { birthday: "2024-11-28" }, myType, { comment: "any" })

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | SchemaError, never>
F.pipe(collection, Collection.findOneAndReplace({ birthday: "2024-11-28" }, myType, { comment: "any" }))

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | SchemaError, never>
Collection.findOneAndReplace(collection, { birthday: "2024-11-28" }, myType)

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | SchemaError, never>
F.pipe(collection, Collection.findOneAndReplace({ birthday: "2024-11-28" }, myType))

// -------------------------------------------------------------------------------------
// findOneAndUpdate
// -------------------------------------------------------------------------------------

// $ExpectType Effect<ModifyResult<{ readonly birthday: Date; }>, MongoError | SchemaError, never>
Collection.findOneAndUpdate(
  collection,
  { birthday: "2024-11-28" },
  { $set: { birthday: "2024-11-29" } },
  { includeResultMetadata: true }
)

// $ExpectType Effect<ModifyResult<{ readonly birthday: Date; }>, MongoError | SchemaError, never>
F.pipe(
  collection,
  Collection.findOneAndUpdate({ birthday: "2024-11-28" }, { $set: { birthday: "2024-11-29" } }, {
    includeResultMetadata: true
  })
)

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | SchemaError, never>
Collection.findOneAndUpdate(
  collection,
  { birthday: "2024-11-28" },
  { $set: { birthday: "2024-11-29" } },
  { includeResultMetadata: false }
)

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | SchemaError, never>
F.pipe(
  collection,
  Collection.findOneAndUpdate({ birthday: "2024-11-28" }, { $set: { birthday: "2024-11-29" } }, {
    includeResultMetadata: false
  })
)

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | SchemaError, never>
Collection.findOneAndUpdate(
  collection,
  { birthday: "2024-11-28" },
  { $set: { birthday: "2024-11-29" } },
  { comment: "any" }
)

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | SchemaError, never>
F.pipe(
  collection,
  Collection.findOneAndUpdate({ birthday: "2024-11-28" }, { $set: { birthday: "2024-11-29" } }, { comment: "any" })
)

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | SchemaError, never>
Collection.findOneAndUpdate(collection, { birthday: "2024-11-28" }, { $set: { birthday: "2024-11-29" } })

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | SchemaError, never>
F.pipe(collection, Collection.findOneAndUpdate({ birthday: "2024-11-28" }, { $set: { birthday: "2024-11-29" } }))

// -------------------------------------------------------------------------------------
// rename
// -------------------------------------------------------------------------------------

// $ExpectType Effect<Collection<{ readonly birthday: Date; }, { readonly birthday: string; }, never, never>, MongoError, never>
Collection.rename(collection, "new-collection")

// $ExpectType Effect<Collection<{ readonly birthday: Date; }, { readonly birthday: string; }, never, never>, MongoError, never>
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

// $ExpectType Effect<Document, MongoError, never>
Collection.dropIndex(collection, "birthday_1")

// $ExpectType Effect<Document, MongoError, never>
F.pipe(collection, Collection.dropIndex("birthday_1"))

// -------------------------------------------------------------------------------------
// dropIndexes
// -------------------------------------------------------------------------------------

// $ExpectType Effect<boolean, MongoError, never>
Collection.dropIndexes(collection)

// $ExpectType Effect<boolean, MongoError, never>
F.pipe(collection, Collection.dropIndexes())

// -------------------------------------------------------------------------------------
// aggregate
// -------------------------------------------------------------------------------------

const MyAggregatedType = Schema.Struct({
  _id: Schema.DateFromString,
  birthdays: Schema.Number
})
const groupByBirthday = [{ $group: { _id: "$birthday", birthdays: { $sum: 1 } } }]

// $ExpectType AggregationCursor<{ readonly _id: Date; readonly birthdays: number; }, { readonly _id: string; readonly birthdays: number; }, never, never>
Collection.aggregate(collection, MyAggregatedType, groupByBirthday)

// $ExpectType AggregationCursor<{ readonly _id: Date; readonly birthdays: number; }, { readonly _id: string; readonly birthdays: number; }, never, never>
F.pipe(collection, Collection.aggregate(MyAggregatedType, groupByBirthday))

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

// -------------------------------------------------------------------------------------
// bulkWrite
// -------------------------------------------------------------------------------------

// $ExpectType Effect<BulkWriteResult, MongoError | SchemaError, never>
Collection.bulkWrite(collection, [
  { insertOne: { document: myType } },
  { replaceOne: { filter: { birthday: "2024-11-28" }, replacement: myType } },
  { deleteOne: { filter: { birthday: "2024-11-28" } } },
  { updateOne: { filter: { birthday: "2024-11-28" }, update: { $set: { birthday: "2024-11-29" } } } },
  { deleteMany: { filter: { birthday: "2024-11-28" } } },
  { updateMany: { filter: { birthday: "2024-11-28" }, update: { $set: { birthday: "2024-11-29" } } } }
])

// $ExpectType Effect<BulkWriteResult, MongoError | SchemaError, never>
F.pipe(
  collection,
  Collection.bulkWrite([
    { insertOne: { document: myType } },
    { replaceOne: { filter: { birthday: "2024-11-28" }, replacement: myType } },
    { deleteOne: { filter: { birthday: "2024-11-28" } } },
    { updateOne: { filter: { birthday: "2024-11-28" }, update: { $set: { birthday: "2024-11-29" } } } },
    { deleteMany: { filter: { birthday: "2024-11-28" } } },
    { updateMany: { filter: { birthday: "2024-11-28" }, update: { $set: { birthday: "2024-11-29" } } } }
  ])
)

// -------------------------------------------------------------------------------------
// decoding and encoding services
// -------------------------------------------------------------------------------------

interface Dec {
  readonly Dec: unique symbol
}
interface Enc {
  readonly Enc: unique symbol
}
declare const MyTypeWithServices: Schema.Codec<MyType, typeof MyType.Encoded, Dec, Enc>

// $ExpectType Collection<{ readonly birthday: Date; }, { readonly birthday: string; }, Dec, Enc>
DocumentCollection.typed(documentCollection, MyTypeWithServices)

const collectionWithServices = DocumentCollection.typed(documentCollection, MyTypeWithServices)

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | SchemaError, Dec>
Collection.findOne(collectionWithServices, { birthday: "2024-11-28" })

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | SchemaError, Dec>
F.pipe(collectionWithServices, Collection.findOne({ birthday: "2024-11-28" }))

// $ExpectType Effect<InsertOneResult<{ readonly birthday: string; }>, MongoError | SchemaError, Enc>
Collection.insertOne(collectionWithServices, myType)

// $ExpectType Effect<InsertOneResult<{ readonly birthday: string; }>, MongoError | SchemaError, Enc>
F.pipe(collectionWithServices, Collection.insertOne(myType))

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | SchemaError, Dec | Enc>
Collection.findOneAndReplace(collectionWithServices, { birthday: "2024-11-28" }, myType)

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | SchemaError, Dec | Enc>
F.pipe(collectionWithServices, Collection.findOneAndReplace({ birthday: "2024-11-28" }, myType))

// $ExpectType Effect<Option<{ readonly birthday: Date; }>, MongoError | SchemaError, Dec>
F.pipe(
  collectionWithServices,
  Collection.findOneAndUpdate({ birthday: "2024-11-28" }, { $set: { birthday: "2024-11-29" } })
)

// $ExpectType Effect<DeleteResult, MongoError, Dec | Enc>
Collection.deleteOne(collectionWithServices, { birthday: "2024-11-28" })

// $ExpectType Effect<DeleteResult, MongoError, Dec | Enc>
F.pipe(collectionWithServices, Collection.deleteOne({ birthday: "2024-11-28" }))

// $ExpectType Effect<{ readonly birthday: Date; }[], MongoError | SchemaError, Dec>
FindCursor.toArray(Collection.find(collectionWithServices, { birthday: "2024-11-28" }))

// $ExpectType Effect<{ readonly birthday: Date; }[], MongoError | SchemaError, Dec>
F.pipe(collectionWithServices, Collection.find({ birthday: "2024-11-28" }), FindCursor.toArray)

// $ExpectType Effect<InsertManyResult<{ readonly birthday: string; }>, MongoError | SchemaError, Enc>
Collection.insertMany(collectionWithServices, [myType])

// $ExpectType Effect<InsertManyResult<{ readonly birthday: string; }>, MongoError | SchemaError, Enc>
F.pipe(collectionWithServices, Collection.insertMany([myType]))

// $ExpectType Effect<Document | UpdateResult<{ readonly birthday: string; }>, MongoError | SchemaError, Enc>
Collection.replaceOne(collectionWithServices, { birthday: "2024-11-28" }, myType)

// $ExpectType Effect<Document | UpdateResult<{ readonly birthday: string; }>, MongoError | SchemaError, Enc>
F.pipe(collectionWithServices, Collection.replaceOne({ birthday: "2024-11-28" }, myType))

// $ExpectType Effect<BulkWriteResult, MongoError | SchemaError, Enc>
Collection.bulkWrite(collectionWithServices, [{ insertOne: { document: myType } }])

// $ExpectType Effect<BulkWriteResult, MongoError | SchemaError, Enc>
F.pipe(collectionWithServices, Collection.bulkWrite([{ insertOne: { document: myType } }]))

// $ExpectType AggregationCursor<{ readonly birthday: Date; }, { readonly birthday: string; }, Dec, Enc>
Collection.aggregate(collection, MyTypeWithServices, [{ $match: { birthday: "2024-11-28" } }])

// $ExpectType AggregationCursor<{ readonly birthday: Date; }, { readonly birthday: string; }, Dec, Enc>
F.pipe(collection, Collection.aggregate(MyTypeWithServices, [{ $match: { birthday: "2024-11-28" } }]))

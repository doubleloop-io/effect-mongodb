import * as DocumentCollection from "effect-mongodb/DocumentCollection"
import * as Schema from "effect/Schema"

const MyType = Schema.Struct({
  birthday: Schema.Date
})

declare const documentCollection: DocumentCollection.DocumentCollection

// $ExpectType Collection<{ readonly birthday: Date; }, { readonly birthday: string; }, never>
DocumentCollection.typed(documentCollection, MyType)

// @ts-expect-error
DocumentCollection.typed(documentCollection, Schema.Date)

// TODO the following test should work, i.e. array are not acceptable as a collection type
// // @ts-expect-error
// DocumentCollection.typed(documentCollection, Schema.Array(MyType))

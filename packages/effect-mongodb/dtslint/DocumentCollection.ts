import * as DocumentCollection from "effect-mongodb/DocumentCollection"
import * as Schema from "effect/Schema"

const MyType = Schema.Struct({
  birthday: Schema.Date
})

declare const documentCollection: DocumentCollection.DocumentCollection

// $ExpectType Collection<Struct<{ birthday: typeof Date$; }>>
DocumentCollection.typed(documentCollection, MyType)

// @ts-expect-error
DocumentCollection.typed(documentCollection, Schema.Date)

// @ts-expect-error
DocumentCollection.typed(documentCollection, Schema.Array(MyType))

class MyClass extends Schema.Class<MyClass>("MyClass")({
  name: Schema.String
}) {}
// TODO the following test should work, i.e. we should accept classes as well
// @ts-expect-error
DocumentCollection.typed(documentCollection, MyClass)

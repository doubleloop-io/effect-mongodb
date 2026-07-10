# Schema-derived type helpers for filters, sort, projection and aggregations

- **Status**: analysis / design proposal
- **Date**: 2026-07-10
- **Scope**: `packages/effect-mongodb`

## 1. Goal

Today the collection `Schema` is used only at the two "borders" of the package:
encode on writes, decode on reads. Everything in between — filters, updates,
sort, projection, aggregation pipelines — is expressed on the **encoded** type
(`I`), raw and unassisted by the schema.

The goal is to derive, from the collection schema, helpers that let the user
express queries entirely in the **decoded** type (`A`), with the encoding
happening internally. The end state is that the current operations (which
accept encoded types) are **replaced** by operations that accept only decoded
types, so the consumer of the library never has to think about the encoded
representation. Migration happens through a phase of parallel, suffixed
operations (see §6).

## 2. Current state: how `A` and `I` flow through the operations

`Collection<A, I, R>` carries a `Schema.Schema<A, I, R>`
([`Collection.ts:51-73`](../../packages/effect-mongodb/src/Collection.ts)).
The split today:

| Operation | Input side | Output side |
|---|---|---|
| `insertOne` / `insertMany` | `A`, encoded via `Schema.encode` (`collection.encode`) | driver result over `I` |
| `replaceOne` / `findOneAndReplace` | filter: raw `Filter<I>` · replacement: `A` encoded | decoded to `A` |
| `find` / `findOne` / `countDocuments` | filter: raw `Filter<I>` | decoded to `A` (`Schema.decodeUnknown`) |
| `deleteOne` / `deleteMany` | filter: raw `Filter<I>` | — |
| `updateOne` / `updateMany` / `findOneAndUpdate` | filter: raw `Filter<I>` · update: raw `UpdateFilter<I>` | decoded to `A` (findOneAndUpdate) |
| `bulkWrite` | insert/replace docs: `A` encoded · filters/updates: raw `I` | — |
| `aggregate` | pipeline: `ReadonlyArray<Document>` (untyped) | decoded via a **user-supplied** output schema |
| `FindCursor.filter` | raw `Filter<I>` | — |
| `FindCursor.project` | projection: `Document` (untyped) + user-supplied output schema | decoded via new schema |
| `FindCursor.sort` | `Sort \| string` (untyped) | — |

`Filter<I>` ([`internal/filter.ts`](../../packages/effect-mongodb/src/internal/filter.ts))
is the mongodb driver's filter type over `WithId<I>` (with `$where` narrowed to
`string`). So the dtslint tests correctly show filters written with encoded
values: `{ birthday: "2024-11-28" }` for a `Schema.Date` field.

**The gap**: no query-side operation uses the schema to build or encode its
arguments. The user must know the encoded representation of every field and
hand-write it, with no validation.

## 3. Proposal: a derived filter schema

### 3.1 Shape

A new public module (working name `MongoFilter`) exposing:

```ts
MongoFilter.make<A, I, R>(schema): Schema.Schema<FilterDecoded<A>, Filter<I>, R>
```

The derived value is itself a `Schema`, so:

- encoding a filter is a plain `Schema.encode` (validated, `ParseError` on failure);
- it composes with the existing API today with **zero changes**: the encoded
  output is a `Filter<I>`, which every current operation already accepts;
- it reuses the whole `effect/Schema` machinery (annotations, error reporting,
  `Schema.suspend` for recursion) instead of a bespoke builder.

```ts
const User = Schema.Struct({
  name: Schema.String,
  birthday: Schema.Date,          // Date <-> string
  scores: Schema.Array(Schema.Int)
})

const UserFilter = MongoFilter.make(User)

const filter = yield* Schema.encode(UserFilter)({
  birthday: { $gt: new Date("2020-01-01") },  // Date, not string
  name: "Andrea",                              // shorthand equality
  $or: [{ scores: { $size: 3 } }, { scores: { $all: [10, 20] } }]
})
// -> { birthday: { $gt: "2020-01-01T00:00:00.000Z" }, name: "Andrea", $or: [...] }

Collection.find(users, filter) // unchanged API
```

### 3.2 Type-level design

```ts
type FieldCondition<T, TEncoded> =
  | T                                       // shorthand equality
  | {
      $eq?: T
      $ne?: T
      $gt?: T
      $gte?: T
      $lt?: T
      $lte?: T
      $in?: ReadonlyArray<T>
      $nin?: ReadonlyArray<T>
      $exists?: boolean
      $not?: FieldConditionObject<T, TEncoded>
      // only when TEncoded extends string:
      $regex?: RegExp | string
      // only when T extends ReadonlyArray<E>:
      $all?: ReadonlyArray<E>
      $elemMatch?: FieldCondition<E, EEncoded>
      $size?: number
    }

type FilterDecoded<A, I> =
  & { [K in keyof A]?: FieldCondition<A[K], I[K]> }
  & {
      $and?: ReadonlyArray<FilterDecoded<A, I>>
      $or?: ReadonlyArray<FilterDecoded<A, I>>
      $nor?: ReadonlyArray<FilterDecoded<A, I>>
      $raw?: Filter<I>          // escape hatch, see §3.5
      _id?: Condition<ObjectId> // only when A has no _id, see §3.6
    }
```

The `$regex` gate is a conditional type on the **encoded** field type: a regex
runs on what is stored in Mongo, so it only makes sense when `I[K] extends
string` — regardless of the decoded type.

### 3.3 Operator coverage (v1) and encoding semantics

| Operator | Value type | Encoding |
|---|---|---|
| shorthand, `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte` | decoded field value `A[K]` | field codec |
| `$in`, `$nin` | `ReadonlyArray<A[K]>` | field codec, element-wise |
| `$exists` | `boolean` | passthrough |
| `$size` | `number` | passthrough |
| `$all` | array of decoded **element** values | element codec |
| `$elemMatch` | condition on the decoded element | recursive, element codec |
| `$not` | operator object (no shorthand, per mongo) | recursive |
| `$regex` | `RegExp \| string`, only if encoded field is `string` | passthrough |
| root `$and` / `$or` / `$nor` | array of decoded filters | recursive (`Schema.suspend`) |

Deliberately out of v1: `$type`, `$mod`, `$text`, geo and bitwise operators,
`$where`, `$expr`. All reachable through the escape hatch.

**Semantic caveat — range operators on non-order-preserving encodings.**
`$gt`/`$lt` compare the *encoded* values on the server. `Schema.Date`
(ISO-8601 string) is lexicographically order-preserving, so range queries are
correct. A field like `NumberFromString` is **not** (`"9" > "10"` as strings).
The helper cannot detect this in general; the analysis recommendation is to
document it clearly and, later, consider an annotation
(e.g. `MongoFilter.orderPreserving(false)`) that removes the range operators
from that field's condition type.

### 3.4 Deriving the schema: AST walking

`make` accepts schemas that expose `fields` (i.e. `Schema.Struct`,
`Schema.Class` / `TaggedClass`) or whose AST is a `TypeLiteral`. Anything else
(top-level opaque `Schema.transform`, unions, suspends) is rejected with a
clear defect: there is no reliable way to extract per-field codecs from an
opaque transformation.

For each field:

1. resolve the field schema (unwrapping `PropertySignature`; for
   `Schema.optional` fields the condition uses the underlying value schema —
   presence is queried via `$exists`);
2. honor `Schema.fromKey` renames: the user writes the **decoded** key, the
   encoded filter carries the **encoded** key. Building the derived filter as a
   `Schema.Struct` that reuses the same `fromKey` gives this for free;
3. build the field condition schema as
   `Union(fieldSchema, Struct({ $eq: optional(fieldSchema), ... }))`,
   adding array operators when the field AST is a `TupleType`/array and
   `$regex` when the encoded AST is a string;
4. assemble the root `Struct` with all fields optional plus the recursive
   `$and`/`$or`/`$nor` (via `Schema.suspend`) and `_id`/`$raw`.

Field-level opaque transforms are **fine** — the field codec is the field
schema itself; only a top-level opaque transform is unsupported. This is a
consequence of the "top-level fields only" decision (§3.7).

The final schema is asserted to `Schema.Schema<FilterDecoded<A, I>, Filter<I>, R>`:
the structurally-computed encoded type and the driver's `Filter<I>` are
compatible but not identical, and chasing exact structural equality against
the driver types is not worth it.

An alternative implementation strategy — a single
`Schema.transformOrFail(Unknown, Unknown)` that walks the filter value at
runtime with extracted field codecs — is less code but loses per-operator
validation and precise error paths. Recommendation: full Schema composition
(the approach above); fall back to `transformOrFail` only for spots where
composition gets unwieldy.

### 3.5 Escape hatch: `$raw`

A reserved root key `$raw: Filter<I>` carries any filter fragment the typed
surface does not cover. It cannot be sent to Mongo as-is (unknown `$` keys are
rejected), so encoding splices it: the fragment is removed and merged with the
rest via `$and`:

```ts
{ name: "Andrea", $raw: { "address.city": "Roma" } }
// -> { $and: [{ name: "Andrea" }, { "address.city": "Roma" }] }
```

This keeps one filter object as the unit of composition instead of forcing
users to hand-merge encoded fragments after `Schema.encode`.

### 3.6 `_id` handling

Parity with the current behavior: `Filter<I>` is built over `WithId<I>`, so
`_id: ObjectId` is always filterable. The derived schema does the same: when
the collection schema does not declare `_id`, the filter exposes an optional
`_id` accepting `Condition<ObjectId>` as passthrough (no encoding). When the
schema *does* declare `_id`, that field is treated like any other (encoded via
its codec).

### 3.7 Nested paths: top-level only (v1)

Mongo's dot-notation (`"address.city": "Roma"`) is intentionally **not** typed
in v1:

- template-literal path types (à la the driver's `Join<NestedPaths<...>>`) are
  expensive, produce unreadable errors, and break down across unions and
  transformations;
- resolving a dotted path to a sub-codec through the AST hits a hard wall as
  soon as any segment is an opaque transform;
- top-level fields cover the large majority of real filters.

Nested paths go through `$raw`. Typed dot-notation (depth-limited) is a
possible future increment once the flat version is consolidated.

### 3.8 Known ambiguity: shorthand on object-valued fields

As in Mongo itself, a shorthand `field: value` where the decoded value is an
object is ambiguous with the operator-object form. The union in §3.2 resolves
it structurally (an object with only `$`-prefixed known keys parses as
operators), which matches Mongo's own semantics. Worth a documentation note;
not worth special API surface.

## 4. Typed sort

Sort keys must be the **encoded** field names (that is what lives in Mongo).
A small helper derives the mapping from the schema, letting the user write
decoded names:

```ts
// SortDecoded<A> = { [K in keyof A]?: 1 | -1 | "asc" | "desc" }
FindCursor.sortT(cursor, { birthday: -1 })   // fromKey renames applied internally
```

No encoding of values is involved — only key checking and renaming — so this
is cheap and non-effectful. Same caveat as §3.3 applies: sorting happens on
encoded representations, so non-order-preserving encodings sort "wrong" by
decoded standards.

## 5. Pick-projection with derived output schema

Projections have two natures:

1. **pure field selection** — the output schema is mechanically derivable:
   `Schema.pick` on the collection schema. This is the v1 helper:

   ```ts
   // FindCursor<{id, values}, ...> -> FindCursor<{id}, ...>
   FindCursor.pick(cursor, "id")
   // internally: cursor.project({ id: 1, _id: 0 }) + schema = Schema.pick(schema, "id")
   ```

   Notes: projection keys sent to Mongo are the *encoded* names (fromKey);
   `_id: 0` is added when `_id` is not among the picked keys, otherwise Mongo
   includes it implicitly.

2. **computed fields** (`$size`, `$max`, expressions) — the output schema is
   not derivable without a typed expression language (this is the aggregation
   `$project` problem, §7). These keep the current API: explicit output schema
   supplied by the user (`FindCursor.project(newSchema, value)`).

## 6. Migration strategy: parallel operations, then replacement

The target is that all operations accept **only decoded types**. Transition
plan:

**Phase 1 — parallel suffixed operations.** For every operation taking a
filter, add a `T`-suffixed variant (e.g. `Collection.findT`) that accepts
`FilterDecoded<A, I>` and encodes internally through the derived filter schema.
Existing operations are untouched.

| Current | New (phase 1) | Error channel change |
|---|---|---|
| `find`, `findOne`, `countDocuments` | `findT`, `findOneT`, `countDocumentsT` | `countDocumentsT` gains `ParseError` |
| `deleteOne`, `deleteMany` | `deleteOneT`, `deleteManyT` | gain `ParseError` |
| `updateOne`, `updateMany` | `updateOneT`, `updateManyT` (filter param only; update stays raw `UpdateFilter<I>` for now) | gain `ParseError` |
| `replaceOne`, `findOneAndReplace`, `findOneAndUpdate` | suffixed variants | already have `ParseError` |
| `bulkWrite` | `bulkWriteT` (filters in delete/update/replace models) | already has `ParseError` |
| `FindCursor.filter` / `.sort` | `.filterT` / `.sortT` | `filterT` must become effectful (or defer encoding to cursor execution — see below) |

`ParseError` appearing on operations that today only fail with `MongoError` is
an unavoidable consequence of encoding at the border, and it is honest: a
filter that does not conform to the schema *is* a defect worth surfacing.

Implementation note — the derived filter codec should be built **once per
collection**, not per call: add a lazily-initialized field on `CollectionImpl`
(next to the existing `encode`), e.g. `encodeFilter`.

Cursor note — `FindCursor.filterT` composed mid-pipe would turn a pure builder
into an effect. Cleaner alternative: store the *decoded* filter on the cursor
and perform encoding when the cursor is executed (`toArray`/`toStream` already
have `ParseError` in their channel). This keeps the builder API pure.

**Phase 2 — flip.** Once the `T` variants are validated in real usage: remove
the old operations, rename `findT` → `find`, etc. Single deliberate breaking
change, acceptable pre-1.0. The `Filter<I>`-based types remain available
internally for `$raw`.

**Updates** (`$set`, `$inc`, …) are out of the initial scope but follow the
same blueprint later: `UpdateDecoded<A>` with `$set` values encoded per-field —
the AST walking built for filters is directly reusable.

## 7. Aggregations

### 7.1 Immediately available: typed `$match`

The derived filter schema already covers the most common aggregation need:

```ts
const match = yield* Schema.encode(UserFilter)({ birthday: { $gt: cutoff } })
Collection.aggregate(users, OutputSchema, [{ $match: match }, ...rest])
```

A convenience `MongoFilter.match(schema)(decodedFilter)` producing the
`{ $match: ... }` stage is trivial once the filter schema exists. `$sort`
inside pipelines can reuse the sort helper (§4) the same way.

### 7.2 Future: a typed pipeline builder

The ambitious end state is a builder that threads the schema through the
pipeline, so each stage knows its input shape and computes its output schema —
replacing today's "hand me the output schema and trust me" API. Honest
assessment per stage:

| Stage | Feasibility | Notes |
|---|---|---|
| `$match` | **easy** | schema unchanged; reuse filter schema |
| `$sort`, `$limit`, `$skip`, `$count` | **easy** | schema unchanged (or trivially known) |
| `$unwind` | **feasible** | array field → element type; sub-schema extractable from the AST for schema-declared array fields |
| `$project` (selection only) | **feasible** | `Schema.pick`, same as §5 |
| `$group` with field-ref accumulators | **feasible, costly** | `_id: "$field"` and `$sum`/`$avg`/`$min`/`$max`/`$push`/`$addToSet` over `"$field"` refs can be typed with template-literal lookup of `"$field"` into the schema; output schema constructible. Arbitrary expressions cannot. |
| `$project` / `$addFields` with expressions | **hard** | requires typing Mongo's expression language; unbounded surface. Pragmatic fallback: computed stages take an explicit output schema (exactly like today's `aggregate`/`project`), resetting the thread. |
| `$lookup` | **feasible with explicit input** | takes the other collection's schema as a parameter; output adds an array field |
| everything else | escape hatch | raw stage + explicit schema reset: `Stage.raw(document, newSchema)` |

Sketch of the target API:

```ts
Pipeline.make(User).pipe(
  Pipeline.match({ source: "B" }),                    // filter: decoded, schema threaded
  Pipeline.unwind("scores"),                          // schema: scores: number
  Pipeline.group("$source", { total: Pipeline.sum("$scores") }),
  Pipeline.raw({ $facet: ... }, FacetOutput)          // escape hatch, schema reset
)
// carries Schema<Out, OutEncoded> -> Collection.aggregateT(collection, pipeline)
```

Risks: TypeScript inference depth/performance on long pipelines, error message
quality, and a large test matrix. Recommendation: do **not** attempt this
until filters + sort + pick-projection are consolidated; then grow it
stage-by-stage starting from `$match`/`$sort`/`$unwind`/selection-`$project`,
keeping the explicit-schema reset as the universal fallback. Every stage the
builder does not model is still expressible — exactly as today.

## 8. Design decisions (resolved)

| Decision | Choice | Rationale |
|---|---|---|
| Filter values | decoded (`A`), encoded via schema | the whole point: user never touches `I` |
| Helper form | derived `Schema<FilterDecoded<A>, Filter<I>>` | reuses Schema machinery; zero changes needed to existing API |
| Operators v1 | core comparison + logical + `$exists` + array ops + `$regex` (string-encoded only) + `$raw` | covers real usage; everything else has an escape hatch |
| Nested paths | top-level only, `$raw` for the rest | type cost and AST limits not worth it in v1 |
| `_id` | optional passthrough when absent from schema | parity with current `WithId<I>` behavior |
| Sort/projection | typed sort keys + pick-projection with derived output schema | computed projections keep explicit schema |
| Integration | parallel `T`-suffixed ops → remove old → rename | end state: decoded-only API, one deliberate breaking change |
| `make` input | schemas exposing `fields` (Struct/Class) only | per-field codecs are not extractable from opaque transforms |
| Codec caching | derived filter codec cached on `CollectionImpl` | one derivation per collection, not per call |
| Optional fields | condition on underlying value schema; presence via `$exists` | matches Mongo semantics |
| Range ops on non-order-preserving encodings | allowed, documented caveat | not detectable in general; future annotation possible |

## 9. Suggested next steps

1. `internal/filter-schema.ts` + public `MongoFilter` module: `make`, `$raw`
   splicing, dtslint coverage mirroring `dtslint/Collection.ts`.
2. `FindCursor.sortT` + `FindCursor.pick`.
3. `T`-suffixed operations on `Collection` (and `DocumentCollection` where it
   applies), with `encodeFilter` cached on the impl.
4. `MongoFilter.match` convenience for aggregations.
5. Real-world validation, then phase-2 rename.
6. (later) typed update filters; (much later) pipeline builder per §7.2.

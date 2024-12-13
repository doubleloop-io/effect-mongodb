import type * as Schema from "effect/Schema"
import type { Simplify } from "effect/Schema"

export type DocumentSchema<Fields extends Schema.Struct.Fields> = Schema.Struct<Fields>
// | Schema.Class<any, Fields, any, any, any, any, any>

export type Type<TSchema extends DocumentSchema<any>> = TSchema extends Schema.Struct<infer Fields>
  ? Schema.Struct.Type<Fields>
  // : TSchema extends Schema.Class<infer Self, any, any, any, any, any, any> ? Self
  : never

export type Encoded<TSchema extends DocumentSchema<any>> = TSchema extends Schema.Struct<infer Fields>
  ? Schema.Struct.Encoded<Fields>
  // : TSchema extends Schema.Class<any, any, infer I, any, any, any, any> ? I
  : never

export type Context<TSchema extends DocumentSchema<any>> = TSchema extends Schema.Struct<infer Fields>
  ? Schema.Struct.Context<Fields>
  // : TSchema extends Schema.Class<any, any, any, infer R, any, any, any> ? R
  : never

export type Any = DocumentSchema<any>

export type BasicSchema<TSchema extends Any> = Schema.Schema<
  Simplify<Type<TSchema>>,
  Simplify<Encoded<TSchema>>,
  Context<TSchema>
>

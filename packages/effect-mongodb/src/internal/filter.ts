import type { Condition, RootFilterOperators as MongoRootFilterOperators, WithId } from "mongodb"

export type RootFilterOperators<TSchema> = Omit<MongoRootFilterOperators<TSchema>, "$where"> & { $where?: string }

export type Filter<TSchema> =
  & {
    [P in keyof WithId<TSchema>]?: Condition<WithId<TSchema>[P]>
  }
  & RootFilterOperators<WithId<TSchema>>

import type { Filter as MongoFilter } from "mongodb"

export type Filter<T> = Omit<MongoFilter<T>, "$where"> & { $where?: string }

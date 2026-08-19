import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import * as Stream from "effect/Stream"
import type { ErrorSource, MongoError } from "../MongoError.js"
import { mongoErrorOrDie } from "./mongo-error.js"
import { withSpan, withSpanStream } from "./tracing.js"

export const mongoOperation =
  (source: ErrorSource) => <A, E, R>(self: Effect.Effect<A, E, R>): Effect.Effect<A, E | MongoError, R> =>
    F.pipe(
      self,
      Effect.catchAllDefect(mongoErrorOrDie(source)),
      withSpan(source)
    )

export const mongoStreamOperation =
  (source: ErrorSource) => <A, E, R>(self: Stream.Stream<A, E, R>): Stream.Stream<A, MongoError, R> =>
    F.pipe(
      self,
      Stream.catchAll(mongoErrorOrDie(source)),
      withSpanStream(source)
    )

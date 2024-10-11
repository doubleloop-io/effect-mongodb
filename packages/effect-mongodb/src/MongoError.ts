/**
 * @since 0.0.1
 */
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import * as Match from "effect/Match"
import * as Stream from "effect/Stream"
import { MongoError as MongoError_ } from "mongodb"

export class MongoError extends Data.TaggedError("MongoError")<{
  message: string
  innerError: MongoError_
}> {}

export const mongoErrorDie: {
  <A>(message: string): (error: unknown) => Effect.Effect<A, MongoError>
  <A>(error: unknown, message: string): Effect.Effect<A, MongoError>
} = F.dual(2, <A>(error: unknown, message: string): Effect.Effect<A, MongoError> =>
  F.pipe(
    Match.value(error),
    Match.when(Match.instanceOf(MongoError_), (innerError) => Effect.fail(new MongoError({ message, innerError }))),
    Match.orElse((cause) =>
      Effect.die(
        new Error(message, {
          cause
        })
      )
    )
  ))

export const mongoErrorStream: {
  <A>(message: string): (error: unknown) => Stream.Stream<A, MongoError>
  <A>(error: unknown, message: string): Stream.Stream<A, MongoError>
} = F.dual(2, <A>(error: unknown, message: string): Stream.Stream<A, MongoError> =>
  F.pipe(
    Match.value(error),
    Match.when(Match.instanceOf(MongoError_), (innerError) => Stream.fail(new MongoError({ message, innerError }))),
    Match.orElse((cause) => Stream.die(new Error(message, { cause })))
  ))

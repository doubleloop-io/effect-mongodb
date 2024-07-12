import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import * as Match from "effect/Match"
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

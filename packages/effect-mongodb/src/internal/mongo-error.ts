import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import * as Match from "effect/Match"
import * as Stream from "effect/Stream"
import { MongoError as MongoError_ } from "mongodb"
import type { ErrorSource } from "../MongoError.js"
import { MongoError } from "../MongoError.js"

export const mongoErrorOrDie =
  (source: ErrorSource, message?: string) => (error: unknown): Effect.Effect<never, MongoError> =>
    F.pipe(
      Match.value(error),
      Match.when(
        Match.instanceOf(MongoError_),
        (cause) => Effect.fail(makeMongoError(source, message, cause))
      ),
      Match.orElse((cause) => Effect.die(makeError(source, message, cause)))
    )

export const mongoErrorOrDieStream =
  (source: ErrorSource, message?: string) => (error: unknown): Stream.Stream<never, MongoError> =>
    F.pipe(
      Match.value(error),
      Match.when(
        Match.instanceOf(MongoError_),
        (cause) => Stream.fail(makeMongoError(source, message, cause))
      ),
      Match.orElse((cause) => Stream.die(makeError(source, message, cause)))
    )

const makeMongoError = (source: ErrorSource, message: string | undefined, cause: MongoError_) =>
  new MongoError({ message: messageFrom(source, message), cause, source })

const makeError = (source: ErrorSource, message: string | undefined, cause: unknown) =>
  new Error(messageFrom(source, message), { cause })

const messageFrom = (source: ErrorSource, message?: string) =>
  message ? `${messageFromSource(source)} - ${message}` : messageFromSource(source)

const messageFromSource = (source: ErrorSource) =>
  F.pipe(
    Match.value(source),
    Match.tag("DbErrorSource", ({ db, functionName, module }) => `Error in ${module}.${functionName} - ${db}`),
    Match.tag("CollectionErrorSource", ({ collection, db, functionName, module }) =>
      `Error in ${module}.${functionName} - ${db}.${collection}`),
    Match.exhaustive
  )

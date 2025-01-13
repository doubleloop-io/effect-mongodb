import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import * as Match from "effect/Match"
import { MongoError as MongoError_ } from "mongodb"
import type { ErrorSource } from "../MongoError.js"
import { MongoError } from "../MongoError.js"

export const mongoErrorOrDie =
  (source: ErrorSource, message?: string) => (error: unknown): Effect.Effect<never, MongoError> =>
    F.pipe(
      Match.value(error),
      Match.when(Match.instanceOf(MongoError_), F.flow(makeMongoError(source, message), Effect.fail)),
      Match.orElse(F.flow(makeError(source, message), Effect.die))
    )

const makeMongoError = (source: ErrorSource, message: string | undefined) => (cause: MongoError_) =>
  new MongoError({ message: messageFrom(source, message), cause, source })

const makeError = (source: ErrorSource, message: string | undefined) => (cause: unknown) =>
  new Error(messageFrom(source, message), { cause })

const messageFrom = (source: ErrorSource, message?: string) =>
  message ? `${messageFromSource(source)} - ${message}` : messageFromSource(source)

const messageFromSource = (source: ErrorSource) =>
  F.pipe(
    Match.value(source),
    Match.tag("ClientErrorSource", (s) => `${baseMessage(s)} - hosts ${s.hosts.join(", ")}`),
    Match.tag("DbErrorSource", (s) => `${baseMessage(s)} - ${s.db}`),
    Match.tag("CollectionErrorSource", (s) => `${baseMessage(s)} - ${s.db}.${s.collection}`),
    Match.exhaustive
  )

const baseMessage = (s: { module: string; functionName: string }) => `Error in ${s.module}.${s.functionName}`

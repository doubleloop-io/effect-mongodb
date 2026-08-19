import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import * as Match from "effect/Match"
import * as Stream from "effect/Stream"
import type * as Tracer from "effect/Tracer"
import type { ErrorSource } from "../MongoError.js"

export const withSpan = (source: ErrorSource) => <A, E, R>(self: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
  Effect.withSpan(self, spanName(source), spanOptions(source))

export const withSpanStream =
  (source: ErrorSource) => <A, E, R>(self: Stream.Stream<A, E, R>): Stream.Stream<A, E, R> =>
    Stream.withSpan(self, spanName(source), spanOptions(source))

const spanName = (source: ErrorSource) => `mongodb.${source.module}.${source.functionName}`

const spanOptions = (source: ErrorSource): Tracer.SpanOptions => ({
  kind: "client",
  captureStackTrace: false,
  attributes: {
    "db.system.name": "mongodb",
    "db.operation.name": source.functionName,
    ...sourceAttributes(source)
  }
})

const sourceAttributes = (source: ErrorSource): Record<string, unknown> =>
  F.pipe(
    Match.value(source),
    Match.tag("ClientErrorSource", (s) => serverAttributes(s.hosts)),
    Match.tag("DbErrorSource", (s) => ({ "db.namespace": s.db })),
    Match.tag("CollectionErrorSource", (s) => ({ "db.namespace": s.db, "db.collection.name": s.collection })),
    Match.exhaustive
  )

const serverAttributes = (hosts: Array<string>): Record<string, unknown> => {
  if (hosts.length !== 1) return {}
  const [address, port] = splitHost(hosts[0])
  return port === undefined ? { "server.address": address } : { "server.address": address, "server.port": port }
}

const splitHost = (host: string): [address: string, port: number | undefined] => {
  const separator = host.lastIndexOf(":")
  if (separator === -1) return [host, undefined]
  const port = Number(host.slice(separator + 1))
  return Number.isInteger(port) ? [host.slice(0, separator), port] : [host, undefined]
}

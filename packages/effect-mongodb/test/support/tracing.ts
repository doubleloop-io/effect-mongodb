import type * as Context from "effect/Context"
import type * as Exit from "effect/Exit"
import * as Layer from "effect/Layer"
import type * as O from "effect/Option"
import * as Tracer from "effect/Tracer"
import { expect } from "vitest"

export type SpanCollector = {
  spans: Array<Tracer.Span>
  layer: Layer.Layer<never>
}

export const spanCollector = (): SpanCollector => {
  const spans: Array<Tracer.Span> = []
  let nextId = 0
  const tracer = Tracer.make({
    span: (name, parent, context, links, startTime, kind) => {
      const span = new CollectedSpan(name, parent, context, links, startTime, kind, `span-${nextId++}`)
      spans.push(span)
      return span
    },
    context: (f) => f()
  })
  return { spans, layer: Layer.setTracer(tracer) }
}

export const spanByName = (collector: SpanCollector, name: string): Tracer.Span => {
  const span = collector.spans.find((x) => x.name === name)
  expect(span, `span '${name}' not found in [${collector.spans.map((x) => x.name).join(", ")}]`).toBeDefined()
  return span!
}

export const attributesOf = (span: Tracer.Span) => Object.fromEntries(span.attributes)

class CollectedSpan implements Tracer.Span {
  readonly _tag = "Span"
  readonly attributes = new Map<string, unknown>()
  readonly traceId = "trace"
  readonly sampled = true
  status: Tracer.SpanStatus

  constructor(
    readonly name: string,
    readonly parent: O.Option<Tracer.AnySpan>,
    readonly context: Context.Context<never>,
    readonly links: ReadonlyArray<Tracer.SpanLink>,
    startTime: bigint,
    readonly kind: Tracer.SpanKind,
    readonly spanId: string
  ) {
    this.status = { _tag: "Started", startTime }
  }

  end(endTime: bigint, exit: Exit.Exit<unknown, unknown>) {
    this.status = { _tag: "Ended", startTime: this.status.startTime, endTime, exit }
  }

  attribute(key: string, value: unknown) {
    this.attributes.set(key, value)
  }

  event() {}
}

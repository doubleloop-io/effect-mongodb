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
    span: (options) => {
      const span = new CollectedSpan(options, `span-${nextId++}`)
      spans.push(span)
      return span
    }
  })
  return { spans, layer: Layer.succeed(Tracer.Tracer, tracer) }
}

export const spanByName = (collector: SpanCollector, name: string): Tracer.Span => {
  const span = collector.spans.find((x) => x.name === name)
  expect(span, `span '${name}' not found in [${collector.spans.map((x) => x.name).join(", ")}]`).toBeDefined()
  return span!
}

export const attributesOf = (span: Tracer.Span) => Object.fromEntries(span.attributes)

type SpanOptions = Parameters<Tracer.Tracer["span"]>[0]

class CollectedSpan implements Tracer.Span {
  readonly _tag = "Span"
  readonly attributes = new Map<string, unknown>()
  readonly traceId = "trace"
  readonly name: string
  readonly parent: O.Option<Tracer.AnySpan>
  readonly annotations: Context.Context<never>
  readonly links: Array<Tracer.SpanLink>
  readonly sampled: boolean
  readonly kind: Tracer.SpanKind
  status: Tracer.SpanStatus

  constructor(options: SpanOptions, readonly spanId: string) {
    this.name = options.name
    this.parent = options.parent
    this.annotations = options.annotations
    this.links = [...options.links]
    this.sampled = options.sampled
    this.kind = options.kind
    this.status = { _tag: "Started", startTime: options.startTime }
  }

  end(endTime: bigint, exit: Exit.Exit<unknown, unknown>) {
    this.status = { _tag: "Ended", startTime: this.status.startTime, endTime, exit }
  }

  attribute(key: string, value: unknown) {
    this.attributes.set(key, value)
  }

  event() {}

  addLinks(links: ReadonlyArray<Tracer.SpanLink>) {
    for (const link of links) this.links.push(link)
  }
}

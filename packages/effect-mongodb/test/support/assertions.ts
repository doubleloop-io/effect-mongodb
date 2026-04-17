import { expect } from "vitest"

type ClassType<T> = new(...args: Array<any>) => T

export function assertInstanceOf<T>(value: unknown, ctor: ClassType<T>): asserts value is T {
  expect(value).toBeInstanceOf(ctor)
}

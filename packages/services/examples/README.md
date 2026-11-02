# @effect-mongodb/services Examples

## Running examples

This directory contains some examples of `@effect-mongodb/services` package.

In root directory of this repository you can find a `docker-compose.yml` that sets up a local MongoDB instance.

```shell
pnpm run infra
```

Then you can run the examples with:

```shell
cd packages/services
pnpm tsx examples/<example>.ts
```

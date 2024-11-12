# effect-mongodb

A [MongoDB](https://github.com/mongodb/node-mongodb-native) toolkit for [Effect](https://github.com/Effect-TS/effect/).

## Install

```shell
pnpm install effect-mongodb effect mongodb
```

Note that `effect`, and `mongodb` are requested as peer dependencies.

## Usage

TODO

## Development

Export `EFFECT_MONGODB_DEBUG` environment variable to see debug logs in tests.

To inspect MongoDB test instance:

1. Copy the connection string from the console
2. Open Mongo Compass
3. Paste the URI
4. Click Advanced Connection Options
5. Enable `Direct Connection`
6. Click `Connect`

Useful links to explore mongodb package:

- https://mongodb.github.io/node-mongodb-native/Next/classes/Collection.html (with links to source code)
- https://www.mongodb.com/docs/v7.0/reference/method/js-collection/
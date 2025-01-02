# effect-mongodb

A [MongoDB](https://github.com/mongodb/node-mongodb-native) toolkit for [Effect](https://github.com/Effect-TS/effect/).

[effect-mongodb](packages/effect-mongodb/README.md) is the core package that provides effectful APIs to work
with MongoDB.

## MongoDB driver compatibility

We adhere to the [MongoDB driver compatibility](https://www.mongodb.com/docs/drivers/node/current/compatibility/)
guidelines, so minor releases might break compatibility with older MongoDB servers.

For example, upgrading the Node.js driver from 6.8 to 6.10 will make it incompatible with MongoDB server 3.6.

## Roadmap

- [ ] [@effect-mongodb/services](packages/services/README.md) package to provide Effect services/layers to use with
  `effect-mongodb`

## Contributing

Take a look at the [CONTRIBUTING.md](CONTRIBUTING.md) guidelines.

### Found a Bug?

If you find a bug in the source code, you can help us
by [submitting an issue](https://github.com/doubleloop-io/effect-mongodb/issues/new) to our GitHub Repository. Even
better, you can submit a Pull Request with a fix.

### Missing a Feature?

You can request a new feature
by [submitting a discussion](https://github.com/doubleloop-io/effect-mongodb/discussions/new/choose) to
our GitHub Repository.
If you would like to implement a new feature, please consider the size of the change and reach out to
better coordinate our efforts and prevent duplication of work.

## License

`effect-mongodb` is made available under the terms of the MIT License.

See the [LICENSE](LICENSE) file for license details.

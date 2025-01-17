# Contributing

Welcome, we really appreciate if you're considering to contribute to effect-mongodb!

- [Initial setup](#initial-setup)
- [Making changes](#making-changes)
- [Tests](#tests)

## Initial setup

Install the following tools to set up your environment:

- [Node.js](https://nodejs.org/en) 20 or newer
- [pnpm](https://pnpm.io/) 9.4.0 or newer
- [Docker](https://www.docker.com/) for running tests using `@testcontainers/mongodb`

Then, you can fork the repository and install the dependencies:

1. Fork this repository on GitHub
2. Clone your forked repo:
   ```shell
   git clone https://github.com/<username>/effect-mongodb && cd effect-mongodb
   ```
3. Install dependencies:
   ```shell
   pnpm install
   ```
4. Optionally, verify that everything is working correctly:
   ```shell
   pnpm check
   pnpm test
   ```

## Making changes

Create a new branch for your changes

```shell
git checkout -b my-branch
```

Make the changes you propose to the codebase. If your changes impact functionality, please **add corresponding tests**
to validate your updates.

### Validate your changes

Run the following commands to ensure your changes do not introduce any issues:

- `pnpm codegen` (optional): Re-generate the package entrypoints in case you have changed the structure of a package or
  introduced a new module.
- `pnpm check`: Confirm that the code compiles without errors.
- `pnpm test`: Execute all unit tests to ensure your changes haven't broken existing functionality.
- `pnpm circular`: Check for any circular dependencies in imports.
- `pnpm lint`: Ensure the code adheres to our coding standards.
    - If you encounter style issues, use `pnpm lint-fix` to automatically correct some of these.
- `pnpm dtslint`: Run type-level tests.

### Document your changes

Before committing your changes, document them with a changeset. This process helps in tracking modifications and
effectively communicating them to the project team and users:

```bash
pnpm changeset
```

During the changeset creation process, you will be prompted to select the appropriate level for your changes:

- **patch**: Opt for this if you are making small fixes or minor changes that do not affect the library's overall
  functionality.
- **minor**: Choose this for new features that enhance functionality but do not disrupt existing features.
- **major**: Select this for any changes that result in backward-incompatible modifications to the library.

### Commit your changes

Once you have documented your changes, commit them to the repository:

```bash
git commit -am "Add some feature"
```

#### Linking to issues

If your commit addresses an open issue, reference the issue number directly in your commit message. This helps to link
your contribution clearly to specific tasks or bug reports.

For example:

```bash
# Reference issue #123
git commit -am "Add some feature (#123)"

# Close the issue #123
git commit -am "Add some feature (close #123)"
```

### Push to your fork

Push the changes to your GitHub fork:

```bash
git push origin my-branch
```

### Create a pull request

Open a pull request against the main branch on the original repository.

Please be patient! We will do our best to review your pull request as soon as possible.

## Tests

We use [@testcontainers/mongodb](https://node.testcontainers.org/modules/mongodb/) to run MongoDB in a Docker container
during tests.

### Write a test

In the `test` directory of a package, like [packages/effect-mongodb/test](packages/effect-mongodb/test), create a
new file `<test suite name>.test.ts`.

Use the `describeMongo` function to automatically setup your test suite with a MongoDB connection.

```typescript
import * as Db from "effect-mongodb/Db"
import * as DocumentCollection from "effect-mongodb/DocumentCollection"
import * as Effect from "effect/Effect"
import * as O from "effect/Option"
import { ObjectId } from "mongodb"
import { expect, test } from "vitest"
import { describeMongo } from "./support/describe-mongo.js"

describeMongo("My tests", (ctx) => {
  test("find one", async () => {
    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      const collection = Db.documentCollection(db, "find-one")

      yield* DocumentCollection.insertMany(collection, [{ name: "john" }, { name: "alfred" }])

      return yield* DocumentCollection.findOne(collection, { name: "john" })
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual(O.some({ _id: expect.any(ObjectId), name: "john" }))
  })
})
```

### Inspect MongoDB test instance

1. Export `EFFECT_MONGODB_DEBUG=true` environment variable
2. Run the tests (by default in watch mode) and you will see the connection string in the console output
   ```
   [EFFECT_MONGODB_DEBUG] MongoDB connection string with direct connection: 'mongodb://localhost:32775'
   ```
3. Copy the connection string `mongodb://localhost:32775`
4. Open [MongoDB Compass](https://www.mongodb.com/products/tools/compass)
5. Click **Add new connection**
6. Paste the copied connection string in the URI field
7. Click Advanced Connection Options
8. Enable **Direct Connection**
9. Click **Save & Connect**

# Contributing

Welcome, we really appreciate if you're considering to contribute to effect-mongodb!

## Setting Up Your Environment

1. Fork this repo
2. Clone your forked repo
   ```shell
   git clone https://github.com/<username>/effect-mongodb && cd effect-mongodb
   ```
3. Create a new branch
    ```shell
    git checkout -b my-branch
    ```
4. Install dependencies
   ```shell
   pnpm install
   ```

## Making Changes

### Implement Your Changes

Make the changes you propose to the codebase. If your changes impact functionality, please **add corresponding tests**
to validate your updates.

### Validate Your Changes

Run the following commands to ensure your changes do not introduce any issues:

- `pnpm codegen` (optional): Re-generate the package entrypoints in case you have changed the structure of a package or
  introduced a new module.
- `pnpm check`: Confirm that the code compiles without errors.
- `pnpm test`: Execute all unit tests to ensure your changes haven't broken existing functionality.
- `pnpm circular`: Check for any circular dependencies in imports.
- `pnpm lint`: Ensure the code adheres to our coding standards.
    - If you encounter style issues, use `pnpm lint-fix` to automatically correct some of these.
- `pnpm dtslint`: Run type-level tests.

### Document Your Changes

**Changeset Documentation**

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

## Finalizing Your Contribution

### Commit Your Changes

Once you have documented your changes with a changeset, it’s time to commit them to the repository. Use a clear and
descriptive commit message, which could be the same message you used in your changeset:

```bash
git commit -am 'Add some feature'
```

#### Linking to Issues

If your commit addresses an open issue, reference the issue number directly in your commit message. This helps to link
your contribution clearly to specific tasks or bug reports. Additionally, if your commit resolves the issue, you can
indicate this by adding a phrase like `", closes #<issue-number>"`. For example:

```bash
git commit -am 'Add some feature, closes #123'
```

This practice not only helps in tracking the progress of issues but also automatically closes the issue when the commit
is merged, streamlining project management.

### Push to Your Fork

Push the changes up to your GitHub fork:

```bash
git push origin my-branch
```

### Create a Pull Request

Open a pull request against the main branch on the original repository.

Please be patient! We will do our best to review your pull request as soon as possible.

## Release a new version (for maintainers)

Merge the PRs automatically created on GitHub with the name "Version Packages".
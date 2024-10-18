# effect-mongodb

TODO

## Contributing

### Document Your Changes

**Changeset Documentation**

Before committing your changes, document them with a changeset. This process helps in tracking modifications and effectively communicating them to the project team and users:

```bash
pnpm changeset
```

During the changeset creation process, you will be prompted to select the appropriate level for your changes:

- **patch**: Opt for this if you are making small fixes or minor changes that do not affect the library's overall functionality.
- **minor**: Choose this for new features that enhance functionality but do not disrupt existing features.
- **major**: Select this for any changes that result in backward-incompatible modifications to the library.

## Release a new version

On your local machine run the following command:

```bash
pnpm changeset-version
git add .
git commit -m "release new version"
git push --follow-tags
```

Before pushing, take your time to review the changeset and make sure everything is correct. The CI will take care of
publishing the new version to npm.

### Pre-releases

To start releasing pre-release versions, run the following command on your local machine:

```bash
yarn changeset pre enter next
yarn changeset version
git add .
git commit -m "Enter prerelease mode and release new beta version"
git push --follow-tags
```

To stop releasing pre-release versions, run the following command on your local machine:

```bash
yarn changeset pre exit
yarn changeset version
git add .
git commit -m "Exit prerelease mode and release new version"
git push --follow-tags
```
# effect-mongodb

TODO

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
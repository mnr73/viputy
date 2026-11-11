# Releasing to npm

Publishing needs your npm login, which only you have. Everything before it is already done and checked.

## Once: log in

```bash
npm login            # opens the browser; use the account that owns @mnr73
npm whoami           # must print your username (a 401 means the login is missing or expired)
```

If you use two-factor auth, `npm publish` will ask for the one-time code. Alternatively create a **granular access token** (npmjs.com -> Access Tokens -> Generate New Token -> Granular, permission "Read and write" on package `@mnr73/viputy`, enable "Bypass 2FA" only if you want it unattended) and put it in `~/.npmrc` as `//registry.npmjs.org/:_authToken=...`. Never commit it.

## Publish

```bash
cd ~/prj/mnr/viputy
git status                       # must be clean, on main, at the commit tagged v1.0.0
npm publish --dry-run            # optional rehearsal: lists the 54 files, nothing is sent
npm publish                      # runs typecheck + tests + build first (prepublishOnly), then publishes
```

`package.json` already has `"publishConfig": { "access": "public" }`, so no flag is needed for the scoped name. The version `1.0.0` goes out with the `latest` tag.

## Check it worked

```bash
npm view @mnr73/viputy version dist-tags      # version: 1.0.0, latest: 1.0.0
```

Then in a scratch app: `npm i @mnr73/viputy`, import a component and `@mnr73/viputy/style.css`.

## Things to know

- `latest` moves from `0.3.32-beta` to `1.0.0`. Projects on `^0.3.x` do NOT upgrade by themselves (caret ranges do not cross a major), so erp-front, site-front and zhoon_front keep working until you change their range.
- A published version can never be replaced. If something is wrong, publish `1.0.1`. Within 72 hours you may `npm unpublish @mnr73/viputy@1.0.0`, but only if nothing depends on it yet; prefer a patch.
- The old line stays installable: `npm i @mnr73/viputy@0.3.32-beta`. The code is on the `legacy/0.x` branch and the `v0.3.32` tag.
- A pre-release first, if you want to try it on a real project before `latest`: change the version to `1.0.0-rc.0` and run `npm publish --tag next`. Consumers then opt in with `npm i @mnr73/viputy@next`.

## Next releases

```bash
npm version patch        # or minor / major: bumps package.json + lock, commits, tags vX.Y.Z
git push origin main --follow-tags
npm publish
```

## GitHub Pages (docs)

Repo Settings -> Pages -> Source: **GitHub Actions**. The workflow `.github/workflows/pages.yml` then builds and publishes the docs on every push to `main` that touches `docs/` or `src/`. Site: https://mnr73.github.io/viputy/ . If the repo is renamed, change `DOCS_BASE` in that workflow.

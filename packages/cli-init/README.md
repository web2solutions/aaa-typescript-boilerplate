# @jumentix/cli-init

Bootstrap CLI package for JumentiX project scaffolding.

## Commands

- `jumentix-init`
- `aaa-bootstrap` (compatibility alias)

## Behavior

- Prompts for service type/profile.
- Clones repository template.
- Generates `.aaa/service-profile.json`.
- Optionally installs dependencies in target project.
- Supports non-interactive automation via CLI flags.

## Non-interactive usage

```bash
node ./packages/cli-init/bin/jumentix-init.js \
  --service-type=rest \
  --project-name=my-service \
  --git-branch=main \
  --install-deps=false
```

## Help

```bash
node ./packages/cli-init/bin/jumentix-init.js --help
```

## Run local package entrypoint

```bash
node ./packages/cli-init/bin/jumentix-init.js
```

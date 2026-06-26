# 001 - Node Runtime Lock (22.x)

## Requirement
Project runtime must be strictly Node.js 22.x.

## Why
Consistent runtime across local development and CI prevents engine mismatches.

## Enforced by
- `package.json` engines
- `.nvmrc`
- `.node-version`
- CI runtime versions (CircleCI/GitHub Actions)

## Status
Done

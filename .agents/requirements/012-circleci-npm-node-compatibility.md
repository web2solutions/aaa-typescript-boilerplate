# 012 - CircleCI NPM/Node Compatibility

## Requirement
CircleCI setup must avoid npm/node engine mismatch failures.

## Why
Upgrading npm to `latest` on older Node patch versions can break CI unexpectedly.

## Acceptance criteria
- CircleCI Node image uses a compatible Node 22.x patch level.
- Pipeline does not force `npm@latest` globally.

## Status
Done

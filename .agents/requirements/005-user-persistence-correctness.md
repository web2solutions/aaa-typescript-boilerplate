# 005 - User Persistence Correctness

## Requirement
User persistence must keep uniqueness and pagination/filter behavior correct.

## Why
Inconsistent persistence behavior causes duplicate data, bad paging, and incorrect API responses.

## Acceptance criteria
- Delete removes username unique index references.
- Username updates enforce duplicate checks.
- `getAll` filters before paginate and reports filtered totals.

## Status
Done

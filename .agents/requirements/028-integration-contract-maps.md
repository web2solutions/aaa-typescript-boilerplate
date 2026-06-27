# 028 - Integration Contract and Error Map Documentation

## Requirement
The project must maintain explicit, versioned documentation for:
- event and message contracts
- error and error-response contracts

## Scope
- `documentation/md/EVENTS-AND-MESSAGES-MAP.md`
- `documentation/md/ERROR-CONTRACTS-AND-RESPONSES.md`
- README glossary index links

## Rules
- Any new event or message contract must update the event/message map documentation.
- Any new error class/code/HTTP response contract must update the error contract map documentation.
- Documentation updates are required in the same change set as contract changes.

## Definition of done
- Both docs are present and linked from README.
- Contract producers/consumers and envelope shape are documented.
- Error code mapping and response shape are documented and consistent with implementation.

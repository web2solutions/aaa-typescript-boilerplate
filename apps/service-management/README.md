# @jumentix/service-management

Workspace app target for Service Management re-homing.

## Current status

- Transitional workspace app with executable scripts mapped to `/servicemangement`.
- Canonical implementation remains in `/servicemangement` until full Wave 5 move.

## Current executable scripts

- `dev` -> root `dev:service-management`
- `test` -> root `test:integration:servicemangement`
- `lint` -> root `lint`

## Planned cutover (Wave 5)

1. Move Service Management app source to `apps/service-management`.
2. Preserve Domain Designer MVP behavior and routes.
3. Keep PM2 startup profile and environment integration intact.
4. Keep integration/smoke checks green after migration.

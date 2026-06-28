# PCI Remediation Plan and Audit Evidence

This document defines the remediation plan in sprint order and maps technical evidence required for audit.

## Sprint plan (P0/P1/P2)

### P0 - Mandatory risk controls

1. Access control and RBAC tenant scope
   - Enforce organization scope for tenant-bound operations.
   - Enforce cross-organization deny paths.
   - Evidence:
     - `src/modules/Users/adapters/in/http/controllers/UserController.ts`
     - `test/unit/modules/Users/interface/controller/controllers.test.ts`

2. Authentication risk controls
   - Login lockout windows and failed-attempt tracking.
   - Token revocation behavior on logout.
   - Evidence:
     - `src/modules/Users/service/AuthService.ts`
     - `test/unit/modules/Users/service/AuthService.branches.test.ts`

3. Internal error exposure policy by environment
   - `dev/staging`: include internal details for debugging.
   - `production`: mask internals.
   - Evidence:
     - `src/shared/utils.ts`
     - `src/interface/HTTP/adapters/*/responses/sendErrorResponse.ts`

4. Transport security baseline
   - CORS allowlist strategy via environment.
   - Security headers middleware enabled where adapter supports it.
   - Evidence:
     - `src/config/security.ts`
     - `src/interface/HTTP/adapters/express/ExpressServer.ts`
     - `src/interface/HTTP/adapters/fastify/FastifyServer.ts`

### P1 - Stability and compatibility hardening

1. Environment-driven auth compatibility
   - Controlled Basic auth enablement.
   - Bearer-first behavior and production credential masking.
   - Evidence:
     - `src/config/.env.dev`
     - `src/config/.env.staging`
     - `src/config/.env.ci`
     - `ci-cd/loadEnvironment.js`

2. JWT contract hardening
   - Issuer/audience support and token-id usage for revocation path.
   - Evidence:
     - `src/infra/jwt/JwtService.ts`
     - auth service unit coverage.

3. Quality-gate proof
   - CI local gate verifies lint, boundary checks, tests, OAS route resolution, build and smoke.
   - Evidence command:
     - `npm run ci:gate`

### P2 - Operational maturity controls (completed)

1. Centralized security audit sink
   - Persist audit events to dedicated adapter with retention policy.
   - Status: implemented with in-memory official adapter and auth/authorization wiring.
   - Evidence:
     - `src/infra/audit/InMemorySecurityAuditRepository.ts`
     - `src/infra/audit/ISecurityAuditRepository.ts`
     - `src/modules/Users/service/AuthService.ts`
     - `test/unit/infra/audit/InMemorySecurityAuditRepository.test.ts`
     - `test/unit/modules/Users/service/AuthService.audit.test.ts`
2. Production security runbooks
   - Key rotation, incident response, and audit export procedure.
   - Status: documented.
   - Evidence:
     - `documentation/md/SECURITY-RUNBOOK-PCI.md`
3. Security smoke checks in CI
   - Explicit job asserting production error masking and CORS deny behavior.
   - Status: implemented via `npm run ci:security-smoke` and included in `npm run ci:gate`.

## Audit evidence checklist

- [x] Lint gate passed.
- [x] Unit tests passed with strict thresholds.
- [x] Architecture and dependency boundary checks passed.
- [x] OpenAPI route resolution check passed.
- [x] Build check passed.
- [x] Integration smoke check passed.
- [x] Security smoke check passed (`ci:security-smoke`).
- [x] Security control code references documented.
- [x] Requirement registered in `.agents`.

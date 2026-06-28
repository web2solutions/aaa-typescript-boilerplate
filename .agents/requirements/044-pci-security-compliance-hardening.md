# Requirement 044 - PCI Security Compliance Hardening

## Context

Access control, authentication flows, and error contracts must align with PCI-oriented hardening practices while preserving developer observability in non-production environments.

## Rules

1. Authentication and authorization controls must be environment-driven and test-covered.
2. Tenant/RBAC scope checks must be enforced at controller boundaries for protected resources.
3. Internal error details:
   - must be visible in `dev` and `staging`
   - must be masked in `production`
4. Token/session risk controls (lockout and revocation) must have deterministic behavior and automated tests.
5. Security controls must be auditable through:
   - code references
   - test evidence
   - CI gate evidence

## Current implementation anchors

- `src/modules/Users/service/AuthService.ts`
- `src/modules/Users/adapters/in/http/controllers/UserController.ts`
- `src/modules/Users/adapters/in/http/controllers/OrganizationController.ts`
- `src/shared/utils.ts`
- `src/config/security.ts`
- `src/infra/audit/InMemorySecurityAuditRepository.ts`
- `test/unit/modules/Users/service/AuthService.branches.test.ts`
- `test/unit/modules/Users/interface/controller/controllers.test.ts`
- `test/unit/config/security.test.ts`
- `test/unit/shared/utils.errorExposure.test.ts`
- `test/unit/infra/audit/InMemorySecurityAuditRepository.test.ts`
- `test/unit/modules/Users/service/AuthService.audit.test.ts`
- `package.json` (`ci:security-smoke` inside `ci:gate`)
- `documentation/md/SECURITY-RUNBOOK-PCI.md`

## Definition of done

- `npm run ci:gate` is green.
- `npm run ci:security-smoke` asserts production masking and CORS deny behavior.
- Security audit sink records authentication and authorization scope decisions.
- Unit tests explicitly cover critical auth/RBAC/error-masking branches.
- Documentation includes sprinted remediation plan and evidence mapping.

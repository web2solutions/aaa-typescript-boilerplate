# Security Runbook (PCI-Oriented)

This runbook defines operational procedures for environments handling authentication, RBAC enforcement, and protected resource access.

## 1) Key Rotation

Scope:
- JWT signing secret (`AAA_JWT_TOKEN_SECRET_KEY`)
- Any API credentials used by outbound adapters

Operational steps:
1. Generate a new secret in the target secret manager.
2. Update environment variables in `staging`.
3. Restart runtime via PM2 (`staging`) and run smoke checks:
   - `npm run ci:security-smoke`
   - endpoint auth sanity checks.
4. Promote to `production` during maintenance window.
5. Invalidate compromised sessions by revocation strategy and controlled logout wave.

Audit evidence:
- Secret manager version history
- Deployment logs / PM2 restart logs
- CI run link proving security smoke green after rotation

## 2) Incident Response

Trigger examples:
- brute-force anomaly
- privilege escalation attempt
- abnormal forbidden/unauthorized spikes

Response flow:
1. Detect and classify severity.
2. Contain:
   - tighten CORS allowlist if needed
   - force token revocation and session reset strategy
   - temporarily disable affected integration adapter
3. Eradicate:
   - patch root cause
   - add regression tests (unit/integration)
4. Recover:
   - controlled rollout to `staging`, then `production`
5. Post-incident:
   - timeline
   - RCA
   - preventive controls backlog item

Audit evidence:
- Incident ticket with timestamps
- commit/PR links with remediation
- CI gate green before re-enable

## 3) Retention and Audit Export

Baseline policy:
- Keep security audit entries for compliance-defined period.
- Export immutable snapshots for audit windows.

Required controls:
1. Security audit sink records auth and scope decisions.
2. Export command/workflow is documented and repeatable.
3. Access to audit logs is restricted to authorized roles.

Audit evidence:
- Export artifact checksum
- Access control policy proof
- Retention policy document/version

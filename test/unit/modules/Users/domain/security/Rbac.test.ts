import {
  EUserRole,
  hasSuperadminRole,
  normalizeRoles,
  resolveRoleScopes,
  shouldRequireOrganization,
  userCanAccessScope
} from '@src/modules/Users/domain/security/Rbac';

describe('rbac policy', () => {
  it('normalizes and checks organization requirements', () => {
    expect.hasAssertions();
    expect(normalizeRoles([EUserRole.admin, EUserRole.admin])).toStrictEqual([EUserRole.admin]);
    expect(shouldRequireOrganization([EUserRole.admin])).toBe(true);
    expect(shouldRequireOrganization([EUserRole.superadmin])).toBe(false);
    expect(hasSuperadminRole([EUserRole.superadmin])).toBe(true);
  });

  it('resolves scopes for normalized roles', () => {
    expect.hasAssertions();
    expect(resolveRoleScopes([EUserRole.admin])).toContain('create_user');
    expect(userCanAccessScope([EUserRole.admin], 'create_user')).toBe(true);
  });

  it('supports legacy direct scope roles for backward compatibility', () => {
    expect.hasAssertions();
    expect(shouldRequireOrganization(['create_user'])).toBe(false);
    expect(userCanAccessScope(['create_user'], 'create_user')).toBe(true);
    expect(userCanAccessScope(['read_user'], 'delete_user')).toBe(false);
  });

  it('covers empty and unknown role branches', () => {
    expect.hasAssertions();
    expect(normalizeRoles()).toStrictEqual([]);
    expect(resolveRoleScopes(['unknown_role'])).toStrictEqual([]);
    expect(hasSuperadminRole()).toBe(false);
    expect(userCanAccessScope([EUserRole.superadmin], 'any_scope')).toBe(true);
  });
});

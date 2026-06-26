// eslint-disable-next-line no-shadow
export enum EUserRole {
  superadmin = 'superadmin',
  admin = 'admin',
  user = 'user'
}

const LEGACY_ROLE_SCOPES = [
  'access_allow',
  'create_account',
  'read_account',
  'update_account',
  'delete_account',
  'create_transaction',
  'delete_transaction',
  'read_transaction',
  'create_user',
  'read_user',
  'update_user',
  'delete_user',
  'create_organization',
  'read_organization',
  'update_organization',
  'delete_organization'
] as const;

export const ROLE_SCOPE_MATRIX: Record<EUserRole, string[]> = {
  [EUserRole.superadmin]: ['*'],
  [EUserRole.admin]: [
    'access_allow',
    'read_user',
    'create_user',
    'update_user',
    'delete_user',
    'read_organization',
    'create_organization',
    'update_organization'
  ],
  [EUserRole.user]: [
    'access_allow',
    'read_user'
  ]
};

const isNormalizedRole = (role: string): role is EUserRole => {
  return Object.values(EUserRole).includes(role as EUserRole);
};

export const normalizeRoles = (roles: string[] = []): string[] => {
  if (roles.length === 0) return [];
  return [...new Set(roles)];
};

export const hasSuperadminRole = (roles: string[] = []): boolean => {
  return normalizeRoles(roles).includes(EUserRole.superadmin);
};

export const shouldRequireOrganization = (roles: string[] = []): boolean => {
  const normalized = normalizeRoles(roles);
  if (normalized.some((role) => isNormalizedRole(role))) {
    return normalized.includes(EUserRole.admin) || normalized.includes(EUserRole.user);
  }
  return false;
};

export const resolveRoleScopes = (roles: string[] = []): string[] => {
  const normalized = normalizeRoles(roles);
  const granted = new Set<string>();
  normalized.forEach((role) => {
    if (isNormalizedRole(role)) {
      ROLE_SCOPE_MATRIX[role].forEach((scope) => granted.add(scope));
      return;
    }
    if ((LEGACY_ROLE_SCOPES as readonly string[]).includes(role)) {
      granted.add(role);
    }
  });
  return [...granted];
};

export const userCanAccessScope = (roles: string[], scope: string): boolean => {
  const scopes = resolveRoleScopes(roles);
  return scopes.includes('*') || scopes.includes(scope);
};

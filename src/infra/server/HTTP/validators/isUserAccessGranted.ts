export default function isUserAccessGranted(
  user: Record<string, any>,
  endPointConfig: Record<string, any>
) {
  const authName = Object.keys(endPointConfig.security[0])[0];
  // if end point has an auth schema
  if (authName) {
    const routePermission: string[] = endPointConfig.security[0][authName];
    // if route has any required permission
    if (routePermission.length > 0) {
      for (const permission of routePermission) {
        if (user.roles.indexOf(permission) === -1) {
          const error = new Error(`Insufficient permission - user must have the ${permission} role`);
          error.name = 'forbidden';
          throw error;
        }
      }
    }
  }
  return true;
}

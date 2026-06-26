export const UserIntegrationEventName = {
  Created: 'users.user.created',
  Updated: 'users.user.updated',
  Deleted: 'users.user.deleted',
  PasswordUpdated: 'users.user.credentialsUpdated'
} as const;

export type UserIntegrationEventNameType = (
  typeof UserIntegrationEventName
)[keyof typeof UserIntegrationEventName];

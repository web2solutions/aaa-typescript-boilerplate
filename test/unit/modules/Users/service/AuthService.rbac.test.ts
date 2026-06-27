import { AuthService } from '@src/modules/Users/service/AuthService';

const makeService = () => new AuthService(
  {} as any,
  {} as any,
  {} as any
);

describe('auth service rbac policy', () => {
  it('allows superadmin and blocks tenant roles without organization', () => {
    expect.hasAssertions();
    const service = makeService();
    const endpoint = {
      security: [{
        bearerAuth: ['create_user']
      }]
    };

    expect(service.throwIfUserHasNoAccessToResource({
      id: 'u1',
      username: 'root',
      firstName: 'root',
      avatar: 'avatar.png',
      roles: ['superadmin']
    } as any, endpoint as any)).toBe(true);

    expect(() => service.throwIfUserHasNoAccessToResource({
      id: 'u2',
      username: 'admin',
      firstName: 'admin',
      avatar: 'avatar.png',
      roles: ['admin']
    } as any, endpoint as any)).toThrow('organization is required');
  });

  it('supports legacy permission scopes directly', () => {
    expect.hasAssertions();
    const service = makeService();
    const endpoint = {
      security: [{
        bearerAuth: ['read_user']
      }]
    };
    expect(service.throwIfUserHasNoAccessToResource({
      id: 'u3',
      username: 'legacy',
      firstName: 'legacy',
      avatar: 'avatar.png',
      roles: ['read_user']
    } as any, endpoint as any)).toBe(true);
  });
});

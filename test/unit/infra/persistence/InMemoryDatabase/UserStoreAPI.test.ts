import { UserStoreAPI } from '@src/infra/persistence/InMemoryDatabase/Stores/UserStoreAPI';
import { IUser } from '@src/modules/Users';

const createUser = (id: string, username: string, firstName: string): IUser => ({
  id,
  createdAt: new Date(),
  updatedAt: new Date(),
  firstName,
  lastName: 'test',
  avatar: 'avatar.png',
  username,
  organization: '',
  password: 'password_hash',
  emails: [] as any[],
  documents: [],
  phones: [],
  roles: ['access_allow']
});

describe('user store api', () => {
  it('should allow recreating username after deleting original user', async () => {
    expect.hasAssertions();
    const marker = `${Date.now()}-${Math.random()}`;
    const firstId = `user-a-${marker}`;
    const secondId = `user-b-${marker}`;
    const username = `recreated-${marker}@xpertminds.dev`;

    await UserStoreAPI.create(firstId, createUser(firstId, username, 'user-a'));
    const deleted = await UserStoreAPI.delete(firstId);
    const recreated = await UserStoreAPI.create(secondId, createUser(secondId, username, 'user-b'));

    expect(deleted).toBeTruthy();
    expect(recreated.username).toBe(username);

    await UserStoreAPI.delete(secondId);
  });

  it('should reject updates that reuse another user username', async () => {
    expect.hasAssertions();
    const marker = `${Date.now()}-${Math.random()}`;
    const userAId = `user-a-${marker}`;
    const userBId = `user-b-${marker}`;
    const userAUsername = `update-a-${marker}@xpertminds.dev`;
    const userBUsername = `update-b-${marker}@xpertminds.dev`;

    await UserStoreAPI.create(userAId, createUser(userAId, userAUsername, 'user-a'));
    await UserStoreAPI.create(userBId, createUser(userBId, userBUsername, 'user-b'));

    await expect(UserStoreAPI.update(userBId, {
      ...createUser(userBId, userAUsername.toUpperCase(), 'user-b')
    })).rejects.toThrow('username already in use');

    await UserStoreAPI.delete(userAId);
    await UserStoreAPI.delete(userBId);
  });

  it('should paginate after filtering and return filtered total', async () => {
    expect.hasAssertions();
    const marker = `${Date.now()}-${Math.random()}`;
    const users = [
      createUser(`user-1-${marker}`, `filter-1-${marker}@xpertminds.dev`, `filter-${marker}`),
      createUser(`user-2-${marker}`, `filter-2-${marker}@xpertminds.dev`, `filter-${marker}`),
      createUser(`user-3-${marker}`, `filter-3-${marker}@xpertminds.dev`, 'not-filtered')
    ];

    await Promise.all(users.map((user) => UserStoreAPI.create(user.id, user)));

    const page1 = await UserStoreAPI.getAll({ firstName: `filter-${marker}` }, { page: 1, size: 1 });
    const page2 = await UserStoreAPI.getAll({ firstName: `filter-${marker}` }, { page: 2, size: 1 });

    expect(page1.total).toBe(2);
    expect(page1.result).toHaveLength(1);
    expect(page2.total).toBe(2);
    expect(page2.result).toHaveLength(1);

    await Promise.all(users.map((user) => UserStoreAPI.delete(user.id)));
  });

  it('should support relation lookup by organization id', async () => {
    expect.hasAssertions();
    const marker = `${Date.now()}-${Math.random()}`;
    const orgId = `org-${marker}`;
    const u1 = { ...createUser(`user-a-${marker}`, `org-a-${marker}@x.dev`, 'orgA'), organization: orgId };
    const u2 = { ...createUser(`user-b-${marker}`, `org-b-${marker}@x.dev`, 'orgB'), organization: orgId };
    await UserStoreAPI.create(u1.id, u1);
    await UserStoreAPI.create(u2.id, u2);
    const byOrg = await UserStoreAPI.getByRelation!('organization', orgId);
    expect(byOrg).toHaveLength(2);
    await UserStoreAPI.delete(u1.id);
    await UserStoreAPI.delete(u2.id);
  });
});

/* eslint-disable jest/max-expects */
import { createDocument } from '@src/modules/Users/features/createDocument';
import { createEmail } from '@src/modules/Users/features/createEmail';
import { createPhone } from '@src/modules/Users/features/createPhone';
import { deleteDocument } from '@src/modules/Users/features/deleteDocument';
import { deleteEmail } from '@src/modules/Users/features/deleteEmail';
import { deletePhone } from '@src/modules/Users/features/deletePhone';
import { updateDocument } from '@src/modules/Users/features/updateDocument';
import { updateEmail } from '@src/modules/Users/features/updateEmail';
import { updatePhone } from '@src/modules/Users/features/updatePhone';

const model = {
  serialize: jest.fn(() => ({ id: 'u1', ok: true }))
};

describe('users feature wrappers', () => {
  it('delegates document operations to repository and serializes result', async () => {
    expect.hasAssertions();
    const repo: any = {
      createDocument: jest.fn(async () => model),
      updateDocument: jest.fn(async () => model),
      deleteDocument: jest.fn(async () => model)
    };
    await expect(createDocument('u1', { data: 'x' } as any, repo)).resolves.toStrictEqual({ id: 'u1', ok: true });
    await expect(updateDocument('u1', 'd1', { data: 'x' } as any, repo)).resolves.toStrictEqual({ id: 'u1', ok: true });
    await expect(deleteDocument('u1', 'd1', repo)).resolves.toStrictEqual({ id: 'u1', ok: true });
    expect(repo.createDocument).toHaveBeenCalledWith('u1', { data: 'x' });
    expect(repo.updateDocument).toHaveBeenCalledWith('u1', 'd1', { data: 'x' });
    expect(repo.deleteDocument).toHaveBeenCalledWith('u1', 'd1');
  });

  it('delegates email operations to repository and serializes result', async () => {
    expect.hasAssertions();
    const repo: any = {
      createEmail: jest.fn(async () => model),
      updateEmail: jest.fn(async () => model),
      deleteEmail: jest.fn(async () => model)
    };
    await expect(createEmail('u1', { email: 'a@b.com' } as any, repo)).resolves.toStrictEqual({ id: 'u1', ok: true });
    await expect(updateEmail('u1', 'e1', { email: 'a@b.com' } as any, repo)).resolves.toStrictEqual({ id: 'u1', ok: true });
    await expect(deleteEmail('u1', 'e1', repo)).resolves.toStrictEqual({ id: 'u1', ok: true });
    expect(repo.createEmail).toHaveBeenCalledWith('u1', { email: 'a@b.com' });
    expect(repo.updateEmail).toHaveBeenCalledWith('u1', 'e1', { email: 'a@b.com' });
    expect(repo.deleteEmail).toHaveBeenCalledWith('u1', 'e1');
  });

  it('delegates phone operations to repository and serializes result', async () => {
    expect.hasAssertions();
    const repo: any = {
      createPhone: jest.fn(async () => model),
      updatePhone: jest.fn(async () => model),
      deletePhone: jest.fn(async () => model)
    };
    await expect(createPhone('u1', { number: '1' } as any, repo)).resolves.toStrictEqual({ id: 'u1', ok: true });
    await expect(updatePhone('u1', 'p1', { number: '2' } as any, repo)).resolves.toStrictEqual({ id: 'u1', ok: true });
    await expect(deletePhone('u1', 'p1', repo)).resolves.toStrictEqual({ id: 'u1', ok: true });
    expect(repo.createPhone).toHaveBeenCalledWith('u1', { number: '1' });
    expect(repo.updatePhone).toHaveBeenCalledWith('u1', 'p1', { number: '2' });
    expect(repo.deletePhone).toHaveBeenCalledWith('u1', 'p1');
  });
});

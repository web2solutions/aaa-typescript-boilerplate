import { IStore } from '@src/infra/ports/persistence/IStore';
import { IUser } from '@src/modules/Users/domain/Entity/IUser';
import { InMemoryRelationalStore } from '@src/infra/persistence/InMemoryDatabase/Stores/InMemoryRelationalStore';

export const UserStoreAPI: IStore<IUser> = new InMemoryRelationalStore<IUser>({
  uniqueIndexes: ['username'],
  caseInsensitiveUniqueIndexes: ['username'],
  relationIndexes: ['organization']
});

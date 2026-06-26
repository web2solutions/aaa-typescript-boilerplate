import { IStore } from '@src/infra/ports/persistence/IStore';
import { IOrganization } from '@src/modules/Users/domain/Entity/IOrganization';
import { InMemoryRelationalStore } from '@src/infra/persistence/InMemoryDatabase/Stores/InMemoryRelationalStore';

export const OrganizationStoreAPI: IStore<IOrganization> = new InMemoryRelationalStore<
IOrganization
>(
  {
    uniqueIndexes: ['name'],
    caseInsensitiveUniqueIndexes: ['name']
  }
);

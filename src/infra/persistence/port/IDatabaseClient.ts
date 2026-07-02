import { IDatabaseClient as IGenericDatabaseClient, IStore } from '@jumentix/persistence-contracts';
import { IUser } from '@src/modules/Users/domain/Entity/IUser';
import { IOrganization } from '@src/modules/Users/domain/Entity/IOrganization';

export interface IDbStores {
    User: IStore<IUser>;
    Organization: IStore<IOrganization>;
    [key: string]: IStore<any>;
}

export interface IDatabaseClient extends IGenericDatabaseClient<IDbStores> {}

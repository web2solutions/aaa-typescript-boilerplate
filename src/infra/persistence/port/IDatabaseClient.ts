import { IStore } from '@src/infra/ports/persistence/IStore';
import { IUser } from '@src/modules/Users/domain/Entity/IUser';
import { IOrganization } from '@src/modules/Users/domain/Entity/IOrganization';

export interface IDbStores {
    User: IStore<IUser>;
    Organization: IStore<IOrganization>;
    [key: string]: IStore<any>;
}

export interface IDatabaseClient {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    stores: IDbStores;
    // [key: string]: IStore<IAuction>;
    // mapped collections
    // Auction: IStore<IAuction>;
}

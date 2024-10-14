import { IStore } from '@src/infra/ports/persistence/IStore';
// import { IAccount } from '@src/domains/Accounts';
// import { ITransaction } from '@src/domains/Transactions';
import { IUser } from '@src/modules/Users';

type StoreDomains = IUser;

export interface IDbStores {
    [key: string]: IStore<StoreDomains>;
}

export interface IDatabaseClient {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    stores: IDbStores;
    // [key: string]: IStore<IAuction>;
    // mapped collections
    // Auction: IStore<IAuction>;
}

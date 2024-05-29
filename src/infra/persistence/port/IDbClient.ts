import { IStore } from '@src/domains/ports/persistence/IStore';
import { IAccount } from '@src/domains/Accounts';
import { ITransaction } from '@src/domains/Transactions';
import { IUser } from '@src/domains/Users';

type StoreDomains = IAccount | ITransaction | IUser;

export interface IDbStores {
    [key: string]: IStore<StoreDomains>;
}

export interface IDbClient {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    stores: IDbStores;
    // [key: string]: IStore<IAuction>;
    // mapped collections
    // Auction: IStore<IAuction>;
}

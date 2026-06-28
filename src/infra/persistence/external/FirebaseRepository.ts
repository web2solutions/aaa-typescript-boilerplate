import { BaseExternalDataRepository, IRepositoryConnectionOptions } from '@src/infra/persistence/external/BaseExternalDataRepository';

export class FirebaseRepository extends BaseExternalDataRepository {
  private app: any | null = null;

  private firestore: any | null = null;

  constructor(options: IRepositoryConnectionOptions) {
    super({
      ...options,
      provider: 'firebase'
    });
  }

  public async connect(): Promise<void> {
    const firebaseAdminModule = await this.loadModule('firebase-admin/app');
    const initializeApp = (
      firebaseAdminModule.initializeApp || firebaseAdminModule.default?.initializeApp
    );
    const cert = firebaseAdminModule.cert || firebaseAdminModule.default?.cert;

    if (!initializeApp) {
      throw new Error('Unable to resolve initializeApp from "firebase-admin/app".');
    }

    const credentialJson = this.getExtraOption<Record<string, unknown> | undefined>(
      'serviceAccount',
      undefined
    );
    const projectId = this.getExtraOption<string | undefined>('projectId', undefined);

    const options: Record<string, unknown> = {};
    if (projectId) {
      options.projectId = projectId;
    }
    if (credentialJson && cert) {
      options.credential = cert(credentialJson as any);
    }

    this.app = initializeApp(options);
    const firestoreModule = await this.loadModule('firebase-admin/firestore');
    const getFirestore = firestoreModule.getFirestore || firestoreModule.default?.getFirestore;
    if (!getFirestore) {
      throw new Error('Unable to resolve getFirestore from "firebase-admin/firestore".');
    }
    this.firestore = getFirestore(this.app);
    this.connected = true;
  }

  public async disconnect(): Promise<void> {
    if (this.app && typeof this.app.delete === 'function') {
      await this.app.delete();
    }
    this.firestore = null;
    this.app = null;
    this.connected = false;
  }

  public getClient(): any | null {
    return this.firestore;
  }
}

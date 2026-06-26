export type Dictionary = Record<string, any>;

export interface IFieldDefinition {
  name: string;
  type: string;
  required: boolean;
  format?: string;
  defaultValue?: string;
  validations: string[];
  behavior?: string;
}

export interface IEntityDefinition {
  id: string;
  name: string;
  domain: string;
  kind: 'entity' | 'valueObject' | 'aggregate' | 'model';
  description?: string;
  fields: IFieldDefinition[];
  behaviors: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IDomainDefinition {
  id: string;
  name: string;
  description?: string;
  boundedContext?: string;
  status: 'draft' | 'active' | 'deprecated';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IWorkspaceCatalog {
  version: number;
  domains: IDomainDefinition[];
  entities: IEntityDefinition[];
}

export interface ISubApplicationContext {
  ask: (question: string) => Promise<string>;
  choose: (title: string, options: string[]) => Promise<number>;
  log: (message: string) => void;
  loadCatalog: () => Promise<IWorkspaceCatalog>;
  saveCatalog: (catalog: IWorkspaceCatalog) => Promise<void>;
}

export interface ISubApplication {
  id: string;
  title: string;
  run: (context: ISubApplicationContext) => Promise<void>;
}

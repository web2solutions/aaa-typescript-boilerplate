import fs from 'fs';
import path from 'path';
import { IWorkspaceCatalog } from '@src/interface/CLI/types';

const CATALOG_DIR = path.resolve(process.cwd(), '.aaa-cli');
const CATALOG_FILE = path.join(CATALOG_DIR, 'workspace-catalog.json');

const defaultCatalog = (): IWorkspaceCatalog => ({
  version: 1,
  domains: [],
  entities: []
});

export const loadCatalog = async (): Promise<IWorkspaceCatalog> => {
  if (!fs.existsSync(CATALOG_FILE)) {
    return defaultCatalog();
  }

  const data = await fs.promises.readFile(CATALOG_FILE, 'utf8');
  const parsed = JSON.parse(data) as IWorkspaceCatalog;
  return {
    version: parsed.version || 1,
    domains: parsed.domains || [],
    entities: parsed.entities || []
  };
};

export const saveCatalog = async (catalog: IWorkspaceCatalog): Promise<void> => {
  if (!fs.existsSync(CATALOG_DIR)) {
    await fs.promises.mkdir(CATALOG_DIR, { recursive: true });
  }
  await fs.promises.writeFile(CATALOG_FILE, JSON.stringify(catalog, null, 2), 'utf8');
};

export const getCatalogFilePath = (): string => CATALOG_FILE;

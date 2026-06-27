import fs from 'fs';
import os from 'os';
import path from 'path';

describe('cli catalog storage', () => {
  const runInTempWorkspace = async (callback: () => Promise<void>): Promise<void> => {
    const previousCwd = process.cwd();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aaa-cli-test-'));

    try {
      process.chdir(tmpDir);
      jest.resetModules();
      await callback();
    } finally {
      process.chdir(previousCwd);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  };

  it('loads default catalog when file does not exist', async () => {
    expect.hasAssertions();
    await runInTempWorkspace(async () => {
      const module = await import('@src/interface/CLI/core/catalogStorage');
      const catalog = await module.loadCatalog();

      expect(catalog).toStrictEqual({
        version: 1,
        domains: [],
        entities: []
      });
    });
  });

  it('saves and reloads catalog contents', async () => {
    expect.hasAssertions();
    await runInTempWorkspace(async () => {
      const module = await import('@src/interface/CLI/core/catalogStorage');

      const payload = {
        version: 1,
        domains: [{
          id: 'd1',
          name: 'Users',
          status: 'active',
          tags: ['core'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: 'user management',
          boundedContext: 'identity'
        }],
        entities: [{
          id: 'e1',
          name: 'User',
          domain: 'Users',
          kind: 'aggregate',
          description: 'user aggregate root',
          fields: [],
          behaviors: ['create', 'update'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }]
      };

      await module.saveCatalog(payload as any);
      const loaded = await module.loadCatalog();

      expect(loaded).toStrictEqual(payload);
      expect(fs.existsSync(module.getCatalogFilePath())).toBe(true);
    });
  });
});

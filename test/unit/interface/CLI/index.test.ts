import { ISubApplication, IWorkspaceCatalog } from '@src/interface/CLI/types';

const loadCatalogMock = jest.fn();
const saveCatalogMock = jest.fn();

jest.mock<typeof import('@src/interface/CLI/core/catalogStorage')>('@src/interface/CLI/core/catalogStorage', () => ({
  getCatalogFilePath: jest.fn(() => '/tmp/workspace-catalog.json'),
  loadCatalog: () => loadCatalogMock(),
  saveCatalog: (catalog: unknown) => saveCatalogMock(catalog)
}));
let runCli: typeof import('@src/interface/CLI/index').runCli;

describe('cli index', () => {
  const baseCatalog: IWorkspaceCatalog = {
    version: 1,
    domains: [],
    entities: []
  };

  const createPrompt = (choices: number[]) => {
    let index = 0;
    return {
      ask: jest.fn().mockResolvedValue(''),
      choose: jest.fn().mockImplementation(async () => {
        const selected = choices[index];
        index += 1;
        return selected;
      }),
      close: jest.fn()
    };
  };

  beforeAll(async () => {
    ({ runCli } = await import('@src/interface/CLI/index'));
  });

  beforeEach(() => {
    loadCatalogMock.mockReset();
    saveCatalogMock.mockReset();
    loadCatalogMock.mockResolvedValue(baseCatalog);
    saveCatalogMock.mockResolvedValue(undefined);
  });

  it('lists registered sub-applications and exits', async () => {
    expect.hasAssertions();
    const prompt = createPrompt([2, 3]);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const subApps: ISubApplication[] = [
      { id: 'a', title: 'A', run: jest.fn().mockResolvedValue(undefined) },
      { id: 'b', title: 'B', run: jest.fn().mockResolvedValue(undefined) }
    ];

    await runCli(prompt as any, subApps);

    expect(prompt.close).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith('\nRegistered sub applications:');
    expect(logSpy).toHaveBeenCalledWith('Bye.');
    logSpy.mockRestore();
  });

  it('runs selected sub-application before exiting', async () => {
    expect.hasAssertions();
    const prompt = createPrompt([0, 1]);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const run = jest.fn().mockImplementation(async ({ ask, loadCatalog, saveCatalog }) => {
      await ask('Sub app ask');
      const catalog = await loadCatalog();
      await saveCatalog(catalog);
    });
    const subApps: ISubApplication[] = [{ id: 'a', title: 'A', run }];

    await runCli(prompt as any, subApps);

    expect(run).toHaveBeenCalledTimes(1);
    expect(prompt.ask).toHaveBeenCalledWith('Sub app ask');
    expect(saveCatalogMock).toHaveBeenCalledTimes(1);
    expect(prompt.close).toHaveBeenCalledTimes(1);
    logSpy.mockRestore();
  });

  it('uses default parameters and exits immediately', async () => {
    expect.hasAssertions();
    const prompt = createPrompt([3]);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await runCli(prompt as any);

    expect(prompt.close).toHaveBeenCalledTimes(1);
    logSpy.mockRestore();
  });
});

/* eslint-disable no-await-in-loop */
/* eslint-disable no-constant-condition */
/* eslint-disable no-continue */
/* eslint-disable jest/require-hook */
import { Prompt } from '@src/interface/CLI/core/prompt';
import { getCatalogFilePath, loadCatalog, saveCatalog } from '@src/interface/CLI/core/catalogStorage';
import { ISubApplication, ISubApplicationContext } from '@src/interface/CLI/types';
import { domainManagerSubApplication } from '@src/interface/CLI/subapps/domainManager';
import { entityModelManagerSubApplication } from '@src/interface/CLI/subapps/entityModelManager';

const subApplications: ISubApplication[] = [
  domainManagerSubApplication,
  entityModelManagerSubApplication
];

const buildContext = (prompt: Prompt): ISubApplicationContext => ({
  ask: (question: string) => prompt.ask(question),
  choose: (title: string, options: string[]) => prompt.choose(title, options),
  log: (message: string) => {
    // eslint-disable-next-line no-console
    console.log(message);
  },
  loadCatalog,
  saveCatalog
});

export const runCli = async (
  prompt = new Prompt(),
  registeredSubApplications: ISubApplication[] = subApplications
): Promise<void> => {
  const context = buildContext(prompt);

  // eslint-disable-next-line no-console
  console.log('\nAAA Development Automation CLI');
  // eslint-disable-next-line no-console
  console.log(`Catalog file: ${getCatalogFilePath()}`);

  try {
    while (true) {
      const option = await context.choose('Main Menu', [
        ...registeredSubApplications.map((item) => item.title),
        'List registered sub applications',
        'Exit'
      ]);

      if (option < registeredSubApplications.length) {
        await registeredSubApplications[option].run(context);
        continue;
      }

      if (option === registeredSubApplications.length) {
        context.log('\nRegistered sub applications:');
        registeredSubApplications.forEach((item, index) => {
          context.log(` ${index + 1}. ${item.title} (${item.id})`);
        });
        continue;
      }

      context.log('Bye.');
      return;
    }
  } finally {
    prompt.close();
  }
};

/* istanbul ignore next */
if (require.main === module) {
  runCli().catch((error: unknown) => {
    // eslint-disable-next-line no-console
    console.error('CLI execution failed:', error);
    process.exitCode = 1;
  });
}

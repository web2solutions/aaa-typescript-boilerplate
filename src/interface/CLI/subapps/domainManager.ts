/* eslint-disable no-await-in-loop */
/* eslint-disable no-constant-condition */
import { randomUUID } from 'node:crypto';
import {
  IDomainDefinition,
  ISubApplication,
  ISubApplicationContext,
  IWorkspaceCatalog
} from '@src/interface/CLI/types';

const printDomain = (context: ISubApplicationContext, item: IDomainDefinition): void => {
  context.log(
    `- ${item.name} [${item.status}] | context=${item.boundedContext || 'n/a'} | tags=${
      item.tags.join(', ') || 'none'
    }`
  );
};

const askDomainData = async (
  context: ISubApplicationContext,
  initial?: Partial<IDomainDefinition>
): Promise<Partial<IDomainDefinition>> => {
  const name = await context.ask(`Domain name (${initial?.name || ''}): `);
  const description = await context.ask(`Description (${initial?.description || ''}): `);
  const boundedContext = await context.ask(`Bounded context (${initial?.boundedContext || ''}): `);
  const statusRaw = await context.ask(`Status draft|active|deprecated (${initial?.status || 'draft'}): `);
  const tagsRaw = await context.ask(`Tags comma-separated (${(initial?.tags || []).join(',')}): `);

  const status = (statusRaw || initial?.status || 'draft') as IDomainDefinition['status'];
  const validStatus = ['draft', 'active', 'deprecated'].includes(status) ? status : 'draft';
  const tags = (tagsRaw || (initial?.tags || []).join(','))
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    name: name || initial?.name,
    description: description || initial?.description || '',
    boundedContext: boundedContext || initial?.boundedContext || '',
    status: validStatus,
    tags
  };
};

const chooseDomainIndex = async (
  context: ISubApplicationContext,
  catalog: IWorkspaceCatalog,
  title: string
): Promise<number> => {
  if (catalog.domains.length === 0) {
    context.log('No domains available.');
    return -1;
  }

  const index = await context.choose(
    title,
    catalog.domains.map((item) => `${item.name} (${item.status})`)
  );
  return index;
};

const listDomains = (context: ISubApplicationContext, catalog: IWorkspaceCatalog): void => {
  if (catalog.domains.length === 0) {
    context.log('No domains registered yet.');
    return;
  }
  context.log(`\nRegistered domains (${catalog.domains.length}):`);
  catalog.domains.forEach((item) => printDomain(context, item));
};

const searchDomains = async (
  context: ISubApplicationContext,
  catalog: IWorkspaceCatalog
): Promise<void> => {
  const term = (await context.ask('Search term: ')).toLowerCase();
  const results = catalog.domains.filter((item) => {
    return (
      item.name.toLowerCase().includes(term)
      || (item.description || '').toLowerCase().includes(term)
      || (item.boundedContext || '').toLowerCase().includes(term)
      || item.tags.some((tag) => tag.toLowerCase().includes(term))
    );
  });

  if (results.length === 0) {
    context.log('No matching domains.');
    return;
  }

  context.log(`Found ${results.length} domain(s):`);
  results.forEach((item) => printDomain(context, item));
};

const createDomain = async (context: ISubApplicationContext): Promise<void> => {
  const catalog = await context.loadCatalog();
  const data = await askDomainData(context);
  if (!data.name) {
    context.log('Domain name is required.');
    return;
  }
  if (catalog.domains.some((item) => item.name.toLowerCase() === data.name!.toLowerCase())) {
    context.log(`Domain "${data.name}" already exists.`);
    return;
  }

  const now = new Date().toISOString();
  catalog.domains.push({
    id: randomUUID(),
    name: data.name,
    description: data.description || '',
    boundedContext: data.boundedContext || '',
    status: (data.status || 'draft') as IDomainDefinition['status'],
    tags: data.tags || [],
    createdAt: now,
    updatedAt: now
  });

  await context.saveCatalog(catalog);
  context.log(`Domain "${data.name}" created.`);
};

const updateDomain = async (context: ISubApplicationContext): Promise<void> => {
  const catalog = await context.loadCatalog();
  const index = await chooseDomainIndex(context, catalog, 'Choose a domain to update');
  if (index < 0) {
    return;
  }
  const target = catalog.domains[index];
  const data = await askDomainData(context, target);
  if (!data.name) {
    context.log('Domain name is required.');
    return;
  }

  catalog.domains[index] = {
    ...target,
    ...data,
    updatedAt: new Date().toISOString()
  } as IDomainDefinition;

  await context.saveCatalog(catalog);
  context.log(`Domain "${catalog.domains[index].name}" updated.`);
};

const deleteDomain = async (context: ISubApplicationContext): Promise<void> => {
  const catalog = await context.loadCatalog();
  const index = await chooseDomainIndex(context, catalog, 'Choose a domain to delete');
  if (index < 0) {
    return;
  }

  const selected = catalog.domains[index];
  const isUsedByEntities = catalog.entities.some((item) => item.domain === selected.name);
  if (isUsedByEntities) {
    context.log([
      `Domain "${selected.name}" has related entities/models.`,
      'Remove or reassign them before deleting the domain.'
    ].join(' '));
    return;
  }

  const confirmation = await context.ask(`Type "${selected.name}" to confirm delete: `);
  if (confirmation !== selected.name) {
    context.log('Delete cancelled.');
    return;
  }

  catalog.domains.splice(index, 1);
  await context.saveCatalog(catalog);
  context.log('Domain removed.');
};

export const domainManagerSubApplication: ISubApplication = {
  id: 'domains-crud',
  title: 'Domains CRUD (list/search/create/update/delete)',
  run: async (context) => {
    while (true) {
      const option = await context.choose('Domain Manager', [
        'List domains',
        'Search domain',
        'Create domain',
        'Update domain',
        'Delete domain',
        'Back'
      ]);

      if (option === 0) {
        listDomains(context, await context.loadCatalog());
      } else if (option === 1) {
        await searchDomains(context, await context.loadCatalog());
      } else if (option === 2) {
        await createDomain(context);
      } else if (option === 3) {
        await updateDomain(context);
      } else if (option === 4) {
        await deleteDomain(context);
      } else {
        return;
      }
    }
  }
};

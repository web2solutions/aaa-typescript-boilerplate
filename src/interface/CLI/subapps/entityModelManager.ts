/* eslint-disable no-await-in-loop */
/* eslint-disable no-constant-condition */
/* eslint-disable no-continue */
import { randomUUID } from 'node:crypto';
import {
  IEntityDefinition,
  IFieldDefinition,
  ISubApplication,
  ISubApplicationContext,
  IWorkspaceCatalog
} from '@src/interface/CLI/types';

const printEntity = (context: ISubApplicationContext, item: IEntityDefinition): void => {
  context.log(
    `- ${item.name} [${item.kind}] domain=${item.domain} fields=${item.fields.length} behaviors=${
      item.behaviors.length
    }`
  );
};

const selectEntityIndex = async (
  context: ISubApplicationContext,
  catalog: IWorkspaceCatalog,
  title: string
): Promise<number> => {
  if (catalog.entities.length === 0) {
    context.log('No entities/models registered yet.');
    return -1;
  }

  return context.choose(
    title,
    catalog.entities.map((item) => `${item.name} (${item.kind}) - ${item.domain}`)
  );
};

const askFieldDefinition = async (
  context: ISubApplicationContext,
  initial?: Partial<IFieldDefinition>
): Promise<IFieldDefinition | null> => {
  const name = await context.ask(`Field name (${initial?.name || ''}): `);
  if (!name && !initial?.name) {
    context.log('Field name is required.');
    return null;
  }

  const type = await context.ask(`Field type (${initial?.type || 'string'}): `);
  let requiredLabel = 'y';
  if (typeof initial?.required === 'boolean') {
    requiredLabel = initial.required ? 'y' : 'n';
  }
  const requiredRaw = await context.ask(`Required? y|n (${requiredLabel}): `);
  const format = await context.ask(`Format (${initial?.format || ''}): `);
  const defaultValue = await context.ask(`Default value (${initial?.defaultValue || ''}): `);
  const validationsRaw = await context.ask(
    `Validations comma-separated (${(initial?.validations || []).join(',')}): `
  );
  const behavior = await context.ask(`Behavior notes (${initial?.behavior || ''}): `);

  const isRequired = (requiredRaw || (initial?.required ? 'y' : 'n')).toLowerCase() !== 'n';
  const validations = (validationsRaw || (initial?.validations || []).join(','))
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    name: name || initial?.name || '',
    type: type || initial?.type || 'string',
    required: isRequired,
    format: format || initial?.format || '',
    defaultValue: defaultValue || initial?.defaultValue || '',
    validations,
    behavior: behavior || initial?.behavior || ''
  };
};

const listEntities = (context: ISubApplicationContext, catalog: IWorkspaceCatalog): void => {
  if (catalog.entities.length === 0) {
    context.log('No entities/models registered.');
    return;
  }
  context.log(`\nRegistered data entities/models (${catalog.entities.length}):`);
  catalog.entities.forEach((item) => printEntity(context, item));
};

const searchEntities = async (
  context: ISubApplicationContext,
  catalog: IWorkspaceCatalog
): Promise<void> => {
  const term = (await context.ask('Search term: ')).toLowerCase();
  const results = catalog.entities.filter((item) => {
    return (
      item.name.toLowerCase().includes(term)
      || item.domain.toLowerCase().includes(term)
      || item.kind.toLowerCase().includes(term)
      || (item.description || '').toLowerCase().includes(term)
      || item.fields.some((field) => field.name.toLowerCase().includes(term))
    );
  });

  if (results.length === 0) {
    context.log('No matching entities/models.');
    return;
  }
  context.log(`Found ${results.length} item(s):`);
  results.forEach((item) => printEntity(context, item));
};

const chooseDomainName = async (
  context: ISubApplicationContext,
  catalog: IWorkspaceCatalog,
  initial?: string
): Promise<string> => {
  if (catalog.domains.length === 0) {
    const fallback = await context.ask(`Domain name (${initial || ''}): `);
    return fallback || initial || '';
  }

  const options = catalog.domains.map((item) => item.name);
  const index = await context.choose('Choose domain', [...options, 'Type custom domain']);
  if (index === options.length) {
    const typed = await context.ask(`Custom domain (${initial || ''}): `);
    return typed || initial || '';
  }
  return options[index];
};

const createEntity = async (context: ISubApplicationContext): Promise<void> => {
  const catalog = await context.loadCatalog();
  const name = await context.ask('Entity/model name: ');
  if (!name) {
    context.log('Name is required.');
    return;
  }

  const kindIndex = await context.choose('Kind', ['entity', 'valueObject', 'aggregate', 'model']);
  const kind = ['entity', 'valueObject', 'aggregate', 'model'][kindIndex] as IEntityDefinition['kind'];
  const domain = await chooseDomainName(context, catalog);
  if (!domain) {
    context.log('Domain is required.');
    return;
  }

  const description = await context.ask('Description: ');
  const now = new Date().toISOString();
  const item: IEntityDefinition = {
    id: randomUUID(),
    name,
    kind,
    domain,
    description,
    fields: [],
    behaviors: [],
    createdAt: now,
    updatedAt: now
  };

  while (true) {
    const addField = await context.ask('Add field now? y|n (y): ');
    if ((addField || 'y').toLowerCase() === 'n') {
      break;
    }
    const field = await askFieldDefinition(context);
    if (field) {
      item.fields.push(field);
    }
  }

  const behaviorsRaw = await context.ask('Behaviors comma-separated (optional): ');
  item.behaviors = behaviorsRaw.split(',').map((entry) => entry.trim()).filter(Boolean);

  catalog.entities.push(item);
  await context.saveCatalog(catalog);
  context.log(`Entity/model "${name}" created.`);
};

const updateEntity = async (context: ISubApplicationContext): Promise<void> => {
  const catalog = await context.loadCatalog();
  const index = await selectEntityIndex(context, catalog, 'Choose entity/model to update');
  if (index < 0) {
    return;
  }

  const target = catalog.entities[index];
  const name = await context.ask(`Name (${target.name}): `);
  const kindIndex = await context.choose('Kind', ['entity', 'valueObject', 'aggregate', 'model']);
  const kind = ['entity', 'valueObject', 'aggregate', 'model'][kindIndex] as IEntityDefinition['kind'];
  const domain = await chooseDomainName(context, catalog, target.domain);
  const description = await context.ask(`Description (${target.description || ''}): `);
  const behaviorsRaw = await context.ask(`Behaviors comma-separated (${target.behaviors.join(',')}): `);

  catalog.entities[index] = {
    ...target,
    name: name || target.name,
    kind,
    domain: domain || target.domain,
    description: description || target.description || '',
    behaviors: (behaviorsRaw || target.behaviors.join(','))
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean),
    updatedAt: new Date().toISOString()
  };

  await context.saveCatalog(catalog);
  context.log(`Entity/model "${catalog.entities[index].name}" updated.`);
};

const deleteEntity = async (context: ISubApplicationContext): Promise<void> => {
  const catalog = await context.loadCatalog();
  const index = await selectEntityIndex(context, catalog, 'Choose entity/model to delete');
  if (index < 0) {
    return;
  }

  const target = catalog.entities[index];
  const confirmation = await context.ask(`Type "${target.name}" to confirm delete: `);
  if (confirmation !== target.name) {
    context.log('Delete cancelled.');
    return;
  }
  catalog.entities.splice(index, 1);
  await context.saveCatalog(catalog);
  context.log('Entity/model removed.');
};

const manageFields = async (context: ISubApplicationContext): Promise<void> => {
  const catalog = await context.loadCatalog();
  const index = await selectEntityIndex(context, catalog, 'Choose entity/model to manage fields');
  if (index < 0) {
    return;
  }
  const target = catalog.entities[index];

  while (true) {
    const option = await context.choose(`Field Manager - ${target.name}`, [
      'List fields',
      'Add field',
      'Update field',
      'Delete field',
      'Back'
    ]);

    if (option === 0) {
      if (target.fields.length === 0) {
        context.log('No fields defined.');
      } else {
        target.fields.forEach((field) => {
          context.log(
            `- ${field.name}: ${field.type}${field.required ? ' (required)' : ''} | validations=${
              field.validations.join(', ') || 'none'
            }`
          );
        });
      }
    } else if (option === 1) {
      const field = await askFieldDefinition(context);
      if (field) {
        if (target.fields.some((item) => item.name.toLowerCase() === field.name.toLowerCase())) {
          context.log(`Field "${field.name}" already exists.`);
        } else {
          target.fields.push(field);
          target.updatedAt = new Date().toISOString();
          await context.saveCatalog(catalog);
          context.log(`Field "${field.name}" added.`);
        }
      }
    } else if (option === 2) {
      if (target.fields.length === 0) {
        context.log('No fields to update.');
        continue;
      }
      const fieldIndex = await context.choose(
        'Choose field to update',
        target.fields.map((item) => `${item.name}: ${item.type}`)
      );
      const field = await askFieldDefinition(context, target.fields[fieldIndex]);
      if (field) {
        target.fields[fieldIndex] = field;
        target.updatedAt = new Date().toISOString();
        await context.saveCatalog(catalog);
        context.log(`Field "${field.name}" updated.`);
      }
    } else if (option === 3) {
      if (target.fields.length === 0) {
        context.log('No fields to delete.');
        continue;
      }
      const fieldIndex = await context.choose(
        'Choose field to delete',
        target.fields.map((item) => `${item.name}: ${item.type}`)
      );
      const removed = target.fields[fieldIndex];
      target.fields.splice(fieldIndex, 1);
      target.updatedAt = new Date().toISOString();
      await context.saveCatalog(catalog);
      context.log(`Field "${removed.name}" deleted.`);
    } else {
      return;
    }
  }
};

export const entityModelManagerSubApplication: ISubApplication = {
  id: 'entities-models-crud',
  title: 'Data Entities and Models CRUD (list/search/create/update/delete/manage fields)',
  run: async (context) => {
    while (true) {
      const option = await context.choose('Data Entity and Model Manager', [
        'List entities/models',
        'Search entities/models',
        'Create entity/model',
        'Update entity/model',
        'Delete entity/model',
        'Manage fields',
        'Back'
      ]);

      if (option === 0) {
        listEntities(context, await context.loadCatalog());
      } else if (option === 1) {
        await searchEntities(context, await context.loadCatalog());
      } else if (option === 2) {
        await createEntity(context);
      } else if (option === 3) {
        await updateEntity(context);
      } else if (option === 4) {
        await deleteEntity(context);
      } else if (option === 5) {
        await manageFields(context);
      } else {
        return;
      }
    }
  }
};

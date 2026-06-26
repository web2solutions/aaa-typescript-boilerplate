export type OpenApiDataType = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';

export interface IOpenApiFieldDefinitionLike {
  name: string;
  type: OpenApiDataType | string;
  format?: string;
  validations?: string[];
}

export interface IOpenApiDataEntityLike {
  name: string;
  fields: IOpenApiFieldDefinitionLike[];
}

export const OPEN_API_31_ALLOWED_TYPES: OpenApiDataType[] = [
  'string',
  'number',
  'integer',
  'boolean',
  'array',
  'object'
];

const COMMON_FORMATS = ['none'];

export const OPEN_API_31_FORMATS_BY_TYPE: Record<OpenApiDataType, string[]> = {
  string: [
    ...COMMON_FORMATS,
    'date-time',
    'date',
    'time',
    'duration',
    'email',
    'hostname',
    'idn-email',
    'idn-hostname',
    'ipv4',
    'ipv6',
    'uri',
    'uri-reference',
    'iri',
    'iri-reference',
    'uri-template',
    'json-pointer',
    'relative-json-pointer',
    'uuid',
    'regex',
    'byte',
    'binary',
    'password'
  ],
  number: [...COMMON_FORMATS, 'float', 'double'],
  integer: [...COMMON_FORMATS, 'int32', 'int64'],
  boolean: [...COMMON_FORMATS],
  array: [...COMMON_FORMATS],
  object: [...COMMON_FORMATS]
};

export const OPEN_API_31_VALIDATIONS_BY_TYPE: Record<OpenApiDataType, string[]> = {
  string: ['minLength', 'maxLength', 'pattern', 'enum'],
  number: ['minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf', 'enum'],
  integer: ['minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf', 'enum'],
  boolean: ['enum'],
  array: ['minItems', 'maxItems', 'uniqueItems'],
  object: ['minProperties', 'maxProperties', 'required']
};

const splitValidation = (entry: string): { key: string; value: string } => {
  const separator = entry.includes('=') ? '=' : ':';
  const [rawKey, ...rest] = entry.split(separator);
  return {
    key: rawKey.trim(),
    value: rest.join(separator).trim()
  };
};

export const isOpenApiDataType = (value: string): value is OpenApiDataType => {
  return OPEN_API_31_ALLOWED_TYPES.includes(value as OpenApiDataType);
};

export const throwIfFieldDefinitionIsNotOpenApi31Compliant = (
  field: IOpenApiFieldDefinitionLike
): void => {
  if (!field.name || field.name.trim() === '') {
    throw new Error('OpenAPI 3.1 field name is required.');
  }

  if (!isOpenApiDataType(field.type)) {
    throw new Error(`OpenAPI 3.1 invalid field type "${field.type}" for "${field.name}".`);
  }

  const allowedFormats = OPEN_API_31_FORMATS_BY_TYPE[field.type];
  const normalizedFormat = field.format && field.format.trim() !== '' ? field.format.trim() : 'none';
  if (!allowedFormats.includes(normalizedFormat)) {
    throw new Error(`OpenAPI 3.1 invalid format "${field.format}" for type "${field.type}".`);
  }

  for (const entry of field.validations || []) {
    const { key } = splitValidation(entry);
    if (!OPEN_API_31_VALIDATIONS_BY_TYPE[field.type].includes(key)) {
      throw new Error(`OpenAPI 3.1 invalid validation "${key}" for type "${field.type}".`);
    }
  }
};

export const throwIfDataEntityIsNotOpenApi31Compliant = (entity: IOpenApiDataEntityLike): void => {
  if (!entity.name || entity.name.trim() === '') {
    throw new Error('OpenAPI 3.1 entity name is required.');
  }

  for (const field of entity.fields || []) {
    throwIfFieldDefinitionIsNotOpenApi31Compliant(field);
  }
};

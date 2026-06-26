export type EntityConstructor<T = any> = new (...args: any[]) => T;
export type BelongsTo<T extends EntityConstructor> = InstanceType<T> | null;
export type HasMany<T extends EntityConstructor> = InstanceType<T>[];
export type RelationKind = 'belongsTo' | 'hasMany';

export interface IModelRelationMetadata {
  property: string;
  kind: RelationKind;
  target: string;
}

const RELATIONS_KEY = Symbol.for('aaa:model:relations');

const appendRelation = (
  target: any,
  property: string,
  kind: RelationKind,
  targetFactory: () => EntityConstructor
): void => {
  const ctor = target.constructor as any;
  const current: IModelRelationMetadata[] = ctor[RELATIONS_KEY] || [];
  const targetCtor = targetFactory();
  const relation: IModelRelationMetadata = {
    property,
    kind,
    target: targetCtor.name
  };
  ctor[RELATIONS_KEY] = [...current, relation];
};

export const belongsTo = (targetFactory: () => EntityConstructor): PropertyDecorator => {
  return (target: object, propertyKey: string | symbol) => {
    appendRelation(target, propertyKey.toString(), 'belongsTo', targetFactory);
  };
};

export const hasMany = (targetFactory: () => EntityConstructor): PropertyDecorator => {
  return (target: object, propertyKey: string | symbol) => {
    appendRelation(target, propertyKey.toString(), 'hasMany', targetFactory);
  };
};

export const getModelRelations = (model: EntityConstructor): IModelRelationMetadata[] => {
  const ctor = model as any;
  return [...(ctor[RELATIONS_KEY] || [])];
};

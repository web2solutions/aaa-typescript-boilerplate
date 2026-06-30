/* eslint-disable max-classes-per-file */
import { belongsTo, hasMany, getModelRelations } from '@src/modules/port/relations';

class ParentEntity {}

class ChildEntity {}

class RelModel {
  @belongsTo(() => ParentEntity)
  public parent!: ParentEntity | null;

  @hasMany(() => ChildEntity)
  public children!: ChildEntity[];
}

describe('model relations decorators', () => {
  it('collects belongsTo and hasMany metadata', () => {
    expect.hasAssertions();
    const relations = getModelRelations(RelModel as any);
    expect(relations).toHaveLength(2);
    expect(relations).toStrictEqual(expect.arrayContaining([
      expect.objectContaining({
        property: 'parent',
        kind: 'belongsTo',
        target: 'ParentEntity'
      }),
      expect.objectContaining({
        property: 'children',
        kind: 'hasMany',
        target: 'ChildEntity'
      })
    ]));
  });

  it('returns empty metadata for model without decorators', () => {
    expect.hasAssertions();
    class PlainModel {}
    expect(getModelRelations(PlainModel as any)).toStrictEqual([]);
  });
});

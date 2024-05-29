/* eslint-disable no-underscore-dangle */
import { UUID } from '../../utils';

export abstract class BaseModel<T> {
  private _createdAt: Date;

  private _updatedAt: Date;

  private _id: string;

  public _excludeOnSerialize: string[] = [];

  constructor(id?: string) {
    this._id = id ? UUID.parse(id).toString() : UUID.create().toString();
    const now = new Date();
    this._createdAt = now;
    this._updatedAt = now;
  }

  public get id(): string {
    return this._id;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public set updatedAt(updatedAt: Date) {
    this._updatedAt = updatedAt;
  }

  public serialize(): T {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self: any = this;
    const protoObj = Object.getOwnPropertyDescriptors(Object.getPrototypeOf(this));
    const protoKeys = Object.keys(protoObj);
    const api: any = {};
    for (const property of protoKeys) {
      // eslint-disable-next-line no-continue
      if (property === 'constructor') continue;
      // eslint-disable-next-line no-continue
      if (property === 'serialize') continue;
      // eslint-disable-next-line no-continue
      if (this._excludeOnSerialize.indexOf(property) > -1) continue;
      api[property] = self[property];
    }

    return Object.freeze({
      id: this.id,
      ...api,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    });
  }
}

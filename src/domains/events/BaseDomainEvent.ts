export abstract class BaseDomainEvent {
  public type: string = this.constructor.name;

  public message: any;

  public dateTime: Date = new Date();

  // constructor() { }
}

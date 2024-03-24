export * from './discussion.interface';
export * from './order.interface';

export enum ReturnStep {
  NotLoaded = 1,
  Returned = 4,
  PartialDelivery = 3,
  PartialLoaded = 2,
  Other = 5
}

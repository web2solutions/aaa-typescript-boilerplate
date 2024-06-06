import { BaseDomainEvent } from '@src/domains/events/BaseDomainEvent';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setFilter = (event: BaseDomainEvent): Record<any, any> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let filter: Record<any, any> = {};
  if (event.queryString?.filter) {
    const decodedFilterString = Buffer.from(event.queryString?.filter, 'base64').toString();
    let decodedFilter;
    try {
      decodedFilter = JSON.parse(decodedFilterString);
    } catch (error) {
      decodedFilter = {};
    }
    filter = { ...decodedFilter };
  }
  return filter;
};

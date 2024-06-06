import { IPagingRequest } from '@src/domains/ports/persistence/IPagingRequest';
import { BaseDomainEvent } from '@src/domains/events/BaseDomainEvent';
import { _DEFAULT_PAGE_SIZE_ } from '@src/infra/config/constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setFilterAndPaging = (
  event: BaseDomainEvent
): Array<Record<any, any> | IPagingRequest> => {
  let filter: Record<string, string|number> = {};
  const paging: IPagingRequest = {
    page: 1,
    size: _DEFAULT_PAGE_SIZE_
  };
  if (event.queryString?.page) {
    if (!Number.isNaN(event.queryString.page)) {
      paging.page = +event.queryString.page;
    }
  }
  if (event.queryString?.size) {
    if (!Number.isNaN(event.queryString.size)) {
      paging.size = +event.queryString.size;
    }
  }
  if (event.queryString?.filter) {
    filter = { ...(JSON.parse(event.queryString.filter)) };
  }
  return [filter, paging];
};

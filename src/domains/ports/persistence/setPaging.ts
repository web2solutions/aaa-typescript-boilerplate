import { IPagingRequest } from '@src/domains/ports/persistence/IPagingRequest';
import { BaseDomainEvent } from '@src/domains/events/BaseDomainEvent';
import { _DEFAULT_PAGE_SIZE_ } from '@src/infra/config/constants';
import { Security } from '@src/infra/security';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setPaging = (event: BaseDomainEvent): IPagingRequest => {
  const paging: IPagingRequest = {
    page: 1,
    size: _DEFAULT_PAGE_SIZE_
  };
  if (event.queryString?.page) {
    if (!Number.isNaN(event.queryString.page)) {
      paging.page = +(Security.xss(event.queryString.page));
    }
  }
  if (event.queryString?.size) {
    if (!Number.isNaN(event.queryString.size)) {
      paging.size = +(Security.xss(event.queryString.size));
    }
  }
  return paging;
};

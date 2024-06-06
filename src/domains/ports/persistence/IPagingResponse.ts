export interface IPagingResponse<T> {
  page: number,
  size: number;
  total: number;
  result: T;
}

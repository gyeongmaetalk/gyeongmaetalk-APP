export interface BaseResponse<T> {
  isSuccess: boolean;
  code: number;
  message: string;
  result: T;
}

export interface PaginationResponse<T> extends BaseResponse<T> {
  page: number;
  totalPages: number;
  totalElements: number;
  isFirst: boolean;
  isLast: boolean;
}

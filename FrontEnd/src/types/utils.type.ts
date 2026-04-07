export interface ErrorResponseApi<Data> {
  message: string
  data?: Data
}

export interface SuccessResponseApi<Data> {
  operationType: string
  message: string
  code: string
  data: Data
  size: number
  totalElements: number
  totalPages: number
  page: number
  pageSize: number
  timestamp: string
}
//cú pháp -? loại bẻ undefined của key optional
export type NoUndefinedField<T> = {
  [P in keyof T]-?: NoUndefinedField<NonNullable<T[P]>>
}

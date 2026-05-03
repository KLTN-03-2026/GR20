// hooks/useQueryConfigQR.ts
import useQueryParams from './useQueryParams'
import { isUndefined, omitBy } from 'lodash'

export interface QrQueryConfig {
  page?: string
  limit?: string
  search?: string
  onlyValid?: string
}

export default function useQueryConfigQR() {
  const queryParams: QrQueryConfig = useQueryParams()

  const queryConfig: QrQueryConfig = omitBy(
    {
      page: queryParams.page || '1',
      limit: queryParams.limit || '10',
      search: queryParams.search,
      onlyValid: queryParams.onlyValid
    },
    isUndefined
  )

  return queryConfig
}

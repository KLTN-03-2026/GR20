import { useSearchParams } from 'react-router-dom'

export default function useQueryParams() {
  const [searchParams] = useSearchParams()
  return Object.fromEntries([...searchParams])
  //co duoc cai hook lay duoc queryprams tren URL(duong dan a)
}

// components/Paginate/index.tsx
import classNames from 'classnames'
import { createSearchParams, Link, useLocation } from 'react-router-dom'
import type { QrQueryConfig } from 'src/hooks/useQueryConfig'

interface Props {
  queryConfig: QrQueryConfig
  pageSize: number
  search?: string
  onlyValid?: string
  result?: string
  fromDate?: string
  toDate?: string
  qrType?: string
}

const RANGE = 2

export default function Paginate({
  pageSize,
  queryConfig,
  search,
  onlyValid,
  result,
  fromDate,
  toDate,
  qrType
}: Props) {
  const location = useLocation()
  let doAfter = false
  let doBefore = false

  const page = Number(queryConfig.page)

  const renderDoBefore = (index: number) => {
    if (!doBefore) {
      doBefore = true
      return (
        <span
          className='flex items-center justify-center w-10 h-10 rounded-md bg-white border border-gray-300 text-gray-500 mx-1'
          key={index}
        >
          ...
        </span>
      )
    }
    return null
  }

  const renderDoAfter = (index: number) => {
    if (!doAfter) {
      doAfter = true
      return (
        <span
          className='flex items-center justify-center w-10 h-10 rounded-md bg-white border border-gray-300 text-gray-500 mx-1'
          key={index}
        >
          ...
        </span>
      )
    }
    return null
  }

  // Helper để tạo params đầy đủ
  const getAllParams = (newPage: number) => {
    const params: Record<string, string> = {
      page: newPage.toString(),
      limit: queryConfig.limit || '10'
    }
    if (search) params.search = search
    if (onlyValid) params.onlyValid = onlyValid
    if (result) params.result = result
    if (fromDate) params.fromDate = fromDate
    if (toDate) params.toDate = toDate
    if (qrType) params.qrType = qrType
    return params
  }

  const pagination = () => {
    return Array(pageSize)
      .fill(0)
      .map((_, index) => {
        const pageNumber = index + 1

        if (page <= RANGE * 2 + 1 && pageNumber > page + RANGE && pageNumber < pageSize - RANGE + 1) {
          return renderDoAfter(index)
        } else if (page > RANGE * 2 + 1 && page < pageSize - RANGE * 2) {
          if (pageNumber < page - 2 && pageNumber > RANGE) {
            return renderDoBefore(index)
          } else if (pageNumber > page + 2 && pageNumber < pageSize - RANGE + 1) {
            return renderDoAfter(index)
          }
        } else if (page >= pageSize - RANGE * 2 && pageNumber > RANGE && pageNumber < page - RANGE) {
          return renderDoBefore(index)
        }

        return (
          <Link
            key={index}
            to={{
              pathname: location.pathname,
              search: createSearchParams(getAllParams(pageNumber)).toString()
            }}
            className={classNames('flex items-center justify-center w-10 h-10 rounded-md transition-all mx-1', {
              'bg-primary text-white shadow-md': page === pageNumber,
              'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50': page !== pageNumber
            })}
          >
            {pageNumber}
          </Link>
        )
      })
  }

  doBefore = false
  doAfter = false

  return (
    <div className='flex flex-wrap items-center justify-center gap-1 mt-6'>
      {/* Previous button */}
      {page === 1 ? (
        <span className='flex items-center justify-center px-3 py-2 rounded-md bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed mx-1'>
          <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
            <path
              fillRule='evenodd'
              d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
              clipRule='evenodd'
            />
          </svg>
          <span className='ml-1 hidden sm:inline'>Trước</span>
        </span>
      ) : (
        <Link
          to={{
            pathname: location.pathname,
            search: createSearchParams(getAllParams(page - 1)).toString()
          }}
          className='flex items-center justify-center px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors mx-1'
        >
          <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
            <path
              fillRule='evenodd'
              d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
              clipRule='evenodd'
            />
          </svg>
          <span className='ml-1 hidden sm:inline'>Trước</span>
        </Link>
      )}

      {pagination()}

      {/* Next button */}
      {page === pageSize ? (
        <span className='flex items-center justify-center px-3 py-2 rounded-md bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed mx-1'>
          <span className='mr-1 hidden sm:inline'>Sau</span>
          <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
            <path
              fillRule='evenodd'
              d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
              clipRule='evenodd'
            />
          </svg>
        </span>
      ) : (
        <Link
          to={{
            pathname: location.pathname,
            search: createSearchParams(getAllParams(page + 1)).toString()
          }}
          className='flex items-center justify-center px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors mx-1'
        >
          <span className='mr-1 hidden sm:inline'>Sau</span>
          <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
            <path
              fillRule='evenodd'
              d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
              clipRule='evenodd'
            />
          </svg>
        </Link>
      )}
    </div>
  )
}

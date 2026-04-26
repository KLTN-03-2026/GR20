import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useContext, useMemo, useState } from 'react'
import { invoiceItemsApi } from 'src/apis/billing_api/invoice-items.api'
import { paymentsApi } from 'src/apis/billing_api/payments.api'
import { residentsApi } from 'src/apis/resident_api/residents.api'
import { utilityPricingApi } from 'src/apis/utility_api/utility-pricing.api'
import { AppContext } from 'src/contexts/app.context'

const getApiErrorMessage = (err: any, fallbackMessage: string) => {
  const apiErr = err?.response?.data
  const firstFieldError = apiErr?.errors ? Object.values(apiErr.errors).flat()?.[0] : null
  const rawMessage = firstFieldError || apiErr?.formErrors?.[0] || apiErr?.details || apiErr?.message || fallbackMessage
  if (typeof rawMessage !== 'string') return fallbackMessage

  const translatedMessages: Array<[string, string]> = [
    ['Payment not found', 'Không tìm thấy thanh toán'],
    ['Invoice not found', 'Không tìm thấy hóa đơn'],
    ['Webhook chưa xác nhận giao dịch. Vui lòng đợi thêm.', 'Webhook chưa xác nhận giao dịch. Vui lòng đợi thêm.'],
    ['Invalid payment amount', 'Số tiền thanh toán không hợp lệ']
  ]
  const mapped = translatedMessages.find(([en]) => rawMessage.includes(en))
  return mapped?.[1] || rawMessage
}

const logApiSuccess = (action: string, response: any) => {
  console.log(`[UserPayments][${action}] success`, {
    status: response?.status,
    endpoint: response?.config?.url,
    method: response?.config?.method,
    data: response?.data
  })
}

const logApiError = (action: string, err: any) => {
  console.error(`[UserPayments][${action}] error`, {
    status: err?.response?.status,
    endpoint: err?.config?.url || err?.response?.config?.url,
    method: err?.config?.method || err?.response?.config?.method,
    data: err?.response?.data,
    message: err?.message
  })
}

export default function UserPaymentsPage() {
  const queryClient = useQueryClient()
  const { user } = useContext(AppContext)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<'CASH' | 'BANK_TRANSFER'>('CASH')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_ONLY' | 'PAID_ONLY'>('ALL')
  const [payError, setPayError] = useState<string | null>(null)
  const [bankQrUrl, setBankQrUrl] = useState<string | null>(null)
  const [bankContent, setBankContent] = useState<string | null>(null)
  const [waitingWebhook, setWaitingWebhook] = useState(false)

  const userId = String((user as any)?.id || (user as any)?._id || '')

  const { data: apartmentsData } = useQuery({
    queryKey: ['user-apartments-by-resident', userId],
    queryFn: async () => {
      const response = await residentsApi.getUserApartments(userId)
      logApiSuccess('GetUserApartments', response)
      return response
    },
    enabled: Boolean(userId)
  })
  const { data: paymentsData, isLoading, error, isError } = useQuery({
    queryKey: ['user-payments', userId],
    queryFn: async () => {
      const response = await paymentsApi.getByUserId(userId, { page: 0, size: 100 })
      logApiSuccess('GetUserPayments', response)
      return response
    },
    enabled: Boolean(userId)
  })

  const apartments = apartmentsData?.data?.data || []
  const payments = paymentsData?.data?.data || []

  const myApartmentIds = useMemo(() => apartments.map((a) => Number(a.apartmentId)), [apartments])

  const myInvoices = useMemo(
    () =>
      payments.filter(
        (payment) =>
          myApartmentIds.includes(Number(payment.apartmentId)) &&
          (statusFilter === 'ALL' ||
            (statusFilter === 'PENDING_ONLY' && payment.status === 'PENDING') ||
            (statusFilter === 'PAID_ONLY' && payment.status === 'SUCCESS'))
      ),
    [payments, myApartmentIds, statusFilter]
  )

  const selectedInvoice = myInvoices.find((payment) => String(payment.invoiceId) === String(selectedInvoiceId))
  const selectedInvoiceItems = useQuery({
    queryKey: ['user-invoice-items', selectedInvoiceId],
    queryFn: async () => {
      if (!selectedInvoiceId) return null
      const response = await invoiceItemsApi.getByInvoiceId(String(selectedInvoiceId))
      logApiSuccess('GetInvoiceItemsByInvoice', response)
      return response
    },
    enabled: Boolean(selectedInvoiceId)
  })
  const activePricingQuery = useQuery({
    queryKey: ['active-utility-pricing'],
    queryFn: async () => {
      const response = await utilityPricingApi.getActive()
      logApiSuccess('GetActivePricing', response)
      return response
    }
  })

  const payMutation = useMutation({
    mutationFn: async () => {
      if (!selectedInvoice) return
      const latestPaymentRes = await paymentsApi.getByInvoiceId(String(selectedInvoice.invoiceId))
      const paymentId = latestPaymentRes.data.data.id
      if (selectedMethod === 'CASH') {
        await paymentsApi.update(paymentId, {
          paymentMethod: 'CASH',
          paymentGateway: 'OFFLINE',
          status: 'SUCCESS',
          paymentDate: new Date().toISOString()
        })
        return
      }

      // BANK_TRANSFER: gọi BE tạo VietQR (giống DatLichPhongKham QRCodeService)
      const qrRes = await paymentsApi.getMbVietQrByInvoiceId(String(selectedInvoice.invoiceId))
      setBankQrUrl(qrRes.data.data.qrCodeUrl)
      setBankContent(qrRes.data.data.content)
      setWaitingWebhook(true)
    },
    onSuccess: () => {
      // CASH sẽ đóng dialog. BANK_TRANSFER thì không đóng ở đây (vì còn bước xác nhận chuyển khoản).
      if (selectedMethod === 'CASH') {
        queryClient.invalidateQueries({ queryKey: ['user-payments'] })
        queryClient.invalidateQueries({ queryKey: ['payments'] })
        setSelectedInvoiceId(null)
        setPayError(null)
        setWaitingWebhook(false)
      }
    },
    onError: (err: any) => {
      logApiError('Pay', err)
      setPayError(getApiErrorMessage(err, 'Thanh toán thất bại'))
    }
  })

  const checkWebhookStatusMutation = useMutation({
    mutationFn: async () => {
      if (!selectedInvoice) return
      const latestPaymentRes = await paymentsApi.getByInvoiceId(String(selectedInvoice.invoiceId))
      const payment = latestPaymentRes.data.data
      if (payment.status !== 'SUCCESS') {
        throw new Error('Webhook chưa xác nhận giao dịch. Vui lòng đợi thêm.')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invoices'] })
      queryClient.invalidateQueries({ queryKey: ['user-payments'] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      setSelectedInvoiceId(null)
      setPayError(null)
      setBankQrUrl(null)
      setBankContent(null)
      setWaitingWebhook(false)
      setSelectedMethod('CASH')
    },
    onError: (err: any) => {
      logApiError('CheckWebhook', err)
      setPayError(getApiErrorMessage(err, 'Chưa nhận được xác nhận từ webhook'))
    }
  })

  if (isError) logApiError('GetUserPayments', error)

  return (
    <div className='min-h-screen bg-slate-50 px-6 py-6'>
      <div className='mx-auto max-w-6xl'>
        <h2 className='mb-2 text-3xl font-extrabold tracking-tight text-slate-900'>Thanh toán của tôi</h2>
        <p className='mb-4 text-sm text-slate-500'>Hiển thị tất cả hóa đơn của bạn theo các trạng thái thanh toán.</p>
        <div className='mb-4 grid grid-cols-1 gap-2 md:grid-cols-3'>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'PENDING_ONLY' | 'PAID_ONLY')}
            className='rounded border px-2 py-2'
          >
            <option value='PENDING_ONLY'>Chỉ hóa đơn chưa thanh toán</option>
            <option value='PAID_ONLY'>Chỉ hóa đơn đã thanh toán</option>
            <option value='ALL'>Tất cả hóa đơn</option>
          </select>
          <div />
          <div />
        </div>

        <div className='overflow-hidden rounded-2xl bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse text-left'>
              <thead>
                <tr className='bg-slate-50'>
                  {['Mã hóa đơn', 'Căn hộ', 'Kỳ', 'Số tiền', 'TT hóa đơn', 'TT thanh toán', 'Hành động'].map((h) => (
                    <th
                      key={h}
                      className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 ${
                        h === 'Hành động' ? 'text-right' : ''
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {isLoading && (
                  <tr>
                    <td className='px-6 py-6 text-sm text-slate-500' colSpan={7}>
                      Đang tải hóa đơn...
                    </td>
                  </tr>
                )}
                {!isLoading && myInvoices.length === 0 && (
                  <tr>
                    <td className='px-6 py-6 text-sm text-slate-500' colSpan={7}>
                      Không có hóa đơn nào cần thanh toán.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  myInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className='px-6 py-4 text-sm font-medium text-slate-800'>{invoice.invoiceCode || invoice.invoiceId}</td>
                      <td className='px-6 py-4 text-sm text-slate-700'>Apt {invoice.apartmentId}</td>
                      <td className='px-6 py-4 text-sm text-slate-700'>
                        {invoice.billingMonth}/{invoice.billingYear}
                      </td>
                      <td className='px-6 py-4 text-sm font-semibold text-slate-800'>{invoice.amount}</td>
                      <td className='px-6 py-4 text-sm text-slate-700'>{invoice.invoiceStatus || '-'}</td>
                      <td className='px-6 py-4 text-sm text-slate-700'>{invoice.status}</td>
                      <td className='px-6 py-4 text-right'>
                        {invoice.status === 'PENDING' ? (
                          <button
                            className='rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white'
                            onClick={() => setSelectedInvoiceId(String(invoice.invoiceId))}
                          >
                            Thanh toán
                          </button>
                        ) : (
                          <span className='text-xs text-slate-500'>Đã thanh toán</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedInvoice && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4' onClick={() => setSelectedInvoiceId(null)}>
          <div className='w-full max-w-md rounded-xl bg-white p-5 shadow-lg' onClick={(e) => e.stopPropagation()}>
            <h3 className='text-lg font-semibold text-slate-900'>Chọn phương thức thanh toán</h3>
            <p className='mt-2 text-sm text-slate-600'>
              Hóa đơn: <span className='font-medium'>{selectedInvoice.invoiceCode || selectedInvoice.id}</span>
            </p>
            <p className='text-sm text-slate-600'>
              Số tiền cần thanh toán: <span className='font-semibold'>{selectedInvoice.amount}</span>
            </p>
            {payError && <div className='mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-600'>{payError}</div>}
            <div className='mt-4 grid grid-cols-1 gap-2'>
              <button
                type='button'
                className={`rounded border px-3 py-2 text-left ${
                  selectedMethod === 'CASH' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200'
                }`}
                onClick={() => setSelectedMethod('CASH')}
              >
                Tiền mặt
              </button>
              <button
                type='button'
                className={`rounded border px-3 py-2 text-left ${
                  selectedMethod === 'BANK_TRANSFER' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200'
                }`}
                onClick={() => {
                  setSelectedMethod('BANK_TRANSFER')
                  setBankQrUrl(null)
                  setBankContent(null)
                }}
              >
                Ngân hàng (MB / VietQR)
              </button>
            </div>

            {selectedMethod === 'BANK_TRANSFER' && bankQrUrl && (
              <div className='mt-4 rounded border p-3'>
                <div className='text-sm font-semibold text-slate-800'>Quét QR để chuyển khoản</div>
                <div className='mt-2 flex justify-center'>
                  <img src={bankQrUrl} alt='VietQR MB' className='h-56 w-56 rounded border object-contain' />
                </div>
                {bankContent && (
                  <div className='mt-2 text-sm text-slate-700'>
                    Nội dung chuyển khoản: <span className='font-semibold'>{bankContent}</span>
                  </div>
                )}
                <div className='mt-2 text-xs text-slate-500'>
                  Hệ thống chỉ chuyển thành công khi webhook ngân hàng/Casso xác nhận giao dịch.
                </div>
              </div>
            )}
            <div className='mt-4 rounded border p-3'>
              <div className='mb-2 text-sm font-semibold text-slate-800'>Chi tiết hóa đơn</div>
              {(selectedInvoiceItems.data?.data?.data || []).length === 0 ? (
                <div className='text-xs text-slate-500'>Chưa có chi tiết hóa đơn.</div>
              ) : (
                <div className='space-y-1 text-xs text-slate-700'>
                  {(selectedInvoiceItems.data?.data?.data || []).map((item) => (
                    <div key={item.id} className='flex items-center justify-between'>
                      <span>{item.itemName}</span>
                      <span className='font-medium'>{item.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className='mt-3 rounded border p-3'>
              <div className='mb-2 text-sm font-semibold text-slate-800'>Bảng giá đang áp dụng</div>
              {(activePricingQuery.data?.data?.data || []).length === 0 ? (
                <div className='text-xs text-slate-500'>Chưa có bảng giá active.</div>
              ) : (
                <div className='space-y-1 text-xs text-slate-700'>
                  {(activePricingQuery.data?.data?.data || []).map((price) => (
                    <div key={price.id} className='flex items-center justify-between'>
                      <span>
                        {price.meterType} ({price.unit})
                      </span>
                      <span className='font-medium'>{price.pricePerUnit}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className='mt-5 flex justify-end gap-2'>
              <button type='button' className='rounded bg-slate-200 px-3 py-2 text-sm' onClick={() => setSelectedInvoiceId(null)}>
                Hủy
              </button>
              <button
                type='button'
                className='rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white'
                onClick={() => payMutation.mutate()}
              >
                {payMutation.isPending ? 'Đang xử lý...' : selectedMethod === 'BANK_TRANSFER' ? 'Tạo QR thanh toán' : 'Xác nhận thanh toán'}
              </button>
              {selectedMethod === 'BANK_TRANSFER' && bankQrUrl && waitingWebhook && (
                <button
                  type='button'
                  className='rounded bg-green-600 px-3 py-2 text-sm font-semibold text-white'
                  onClick={() => checkWebhookStatusMutation.mutate()}
                >
                  {checkWebhookStatusMutation.isPending ? 'Đang kiểm tra...' : 'Kiểm tra trạng thái'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

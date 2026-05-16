import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { billingApi } from 'src/apis/billing_api/billing.api'

export default function GenerateCashInvoicePage() {
  const [result, setResult] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const generateMutation = useMutation({
    mutationFn: (payload: { apartmentId: number; billingMonth: number; billingYear: number; dueDate?: string }) =>
      billingApi.generateCashInvoice(payload),
    onSuccess: (res) => {
      setResult(res.data.data)
      setErrorMsg(null)
    },
    onError: (err: any) => {
      console.error('[Billing][GenerateCash] error:', err?.response?.data || err)
      const apiErr = err?.response?.data
      const firstFieldError = apiErr?.errors ? Object.values(apiErr.errors).flat()?.[0] : null
      setErrorMsg(firstFieldError || apiErr?.formErrors?.[0] || apiErr?.message || 'Generate invoice failed')
    }
  })

  return (
    <div className='p-6'>
      <h2 className='mb-4 text-xl font-bold'>Generate Invoice + Cash Payment</h2>
      <p className='mb-4 max-w-2xl text-sm text-slate-600'>
        Tổng tiền = tiền thuê (hợp đồng RENT ACTIVE) + điện/nước theo chỉ số kỳ, giống luồng tạo hóa đơn tự động trên
        trang quản lý hóa đơn.
      </p>
      {errorMsg && <div className='mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-600'>{errorMsg}</div>}
      <form
        className='mb-4 grid grid-cols-1 gap-2 md:grid-cols-5'
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          generateMutation.mutate({
            apartmentId: Number(fd.get('apartmentId')),
            billingMonth: Number(fd.get('billingMonth')),
            billingYear: Number(fd.get('billingYear')),
            dueDate: String(fd.get('dueDate') || '')
          })
        }}
      >
        <input name='apartmentId' placeholder='Apartment ID' className='rounded border px-2 py-2' />
        <input name='billingMonth' placeholder='Billing month' className='rounded border px-2 py-2' />
        <input name='billingYear' placeholder='Billing year' className='rounded border px-2 py-2' />
        <input name='dueDate' type='date' className='rounded border px-2 py-2' />
        <button className='rounded bg-blue-600 px-3 py-2 text-white'>{generateMutation.isPending ? 'Generating...' : 'Generate'}</button>
      </form>

      {result && (
        <div className='rounded border p-4 text-sm'>
          <div className='mb-2 font-semibold'>Invoice: {result.invoice?.invoiceCode}</div>
          <div>Total: {result.invoice?.totalAmount}</div>
          <div>Status: {result.invoice?.status}</div>
          <div className='mt-2 font-semibold'>Payment: {result.payment?.status}</div>
        </div>
      )}
    </div>
  )
}

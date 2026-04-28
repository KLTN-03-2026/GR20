import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { invoiceItemsApi } from 'src/apis/billing_api/invoice-items.api'

export default function InvoiceItemsPage() {
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const { data } = useQuery({ queryKey: ['invoice-items'], queryFn: () => invoiceItemsApi.getAll() })
  const list = data?.data?.data || []

  const createMutation = useMutation({
    mutationFn: (payload: any) => invoiceItemsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoice-items'] }),
    onError: (err: any) => console.error('[InvoiceItems][Create] error:', err?.response?.data || err)
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => invoiceItemsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoice-items'] }),
    onError: (err: any) => console.error('[InvoiceItems][Delete] error:', err?.response?.data || err)
  })

  return (
    <div className='min-h-screen bg-[#F8F9FA] p-8 font-sans'>
      <div className='mx-auto max-w-6xl'>
      <div className='mb-8'>
        <span className='rounded bg-[#DDE7FF] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0052CC]'>
          Administration
        </span>
        <h1 className='mt-4 mb-2 text-3xl font-bold text-gray-900'>Quản lý chi tiết hóa đơn</h1>
        <p className='text-sm text-gray-500'>Quản lý các dòng thành phần tiền điện, nước, phí khác trong hóa đơn.</p>
      </div>
      <div className='mb-4 flex justify-end'>
        <button
          type='button'
          onClick={() => setIsCreateOpen(true)}
          className='rounded-lg bg-[#0052CC] px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700'
        >
          + Thêm dòng phí
        </button>
      </div>
      {isCreateOpen && <form
        className='mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-5'
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          createMutation.mutate({
            invoiceId: Number(fd.get('invoiceId')),
            itemName: fd.get('itemName'),
            amount: Number(fd.get('amount')),
            meterId: fd.get('meterId') ? Number(fd.get('meterId')) : undefined
          })
          e.currentTarget.reset()
          setIsCreateOpen(false)
        }}
      >
        <input name='invoiceId' placeholder='Invoice ID' className='rounded-lg border border-gray-200 px-4 py-2.5' />
        <input name='itemName' placeholder='Tên khoản phí' className='rounded-lg border border-gray-200 px-4 py-2.5' />
        <input name='amount' placeholder='Số tiền' className='rounded-lg border border-gray-200 px-4 py-2.5' />
        <input name='meterId' placeholder='Meter ID (tuỳ chọn)' className='rounded-lg border border-gray-200 px-4 py-2.5' />
        <button className='rounded-lg bg-[#0052CC] px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700'>
          {createMutation.isPending ? 'Đang lưu...' : 'Thêm dòng phí'}
        </button>
        <button
          type='button'
          className='rounded-lg bg-gray-100 px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-200'
          onClick={() => setIsCreateOpen(false)}
        >
          Hủy
        </button>
      </form>}

      <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
        <table className='w-full border-collapse text-left'>
          <thead>
            <tr className='border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400'>
              <th className='px-6 py-4'>Invoice ID</th>
              <th className='px-6 py-4'>Tên khoản phí</th>
              <th className='px-6 py-4'>Số tiền</th>
              <th className='px-6 py-4'>Meter ID</th>
              <th className='px-6 py-4 text-right'>Hành động</th>
            </tr>
          </thead>
          <tbody className='text-sm text-gray-700'>
            {list.map((item) => (
              <tr key={item.id}>
                <td className='px-6 py-4'>{item.invoiceId}</td>
                <td className='px-6 py-4 font-semibold text-gray-900'>{item.itemName}</td>
                <td className='px-6 py-4'>{item.amount}</td>
                <td className='px-6 py-4'>{item.meterId || '--'}</td>
                <td className='px-6 py-4 text-right'>
                  <div className='inline-flex gap-2'>
                    <button className='rounded-lg bg-slate-100 px-3 py-1.5 text-slate-700' onClick={() => setSelectedItem(item)}>
                      Chi tiết
                    </button>
                    <button
                      className='rounded-lg bg-red-100 px-3 py-1.5 text-red-700'
                      onClick={() => deleteMutation.mutate(item.id)}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className='px-6 py-8 text-center text-gray-500'>
                  Chưa có dữ liệu chi tiết hóa đơn.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {selectedItem && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 backdrop-blur-sm'>
          <div className='w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl'>
            <div className='flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4'>
              <h2 className='text-xl font-bold text-gray-800'>Chi tiết dòng phí</h2>
              <button className='text-gray-400 hover:text-gray-600' onClick={() => setSelectedItem(null)}>Đóng</button>
            </div>
            <div className='grid grid-cols-1 gap-3 p-6 text-sm text-gray-700'>
              <div><span className='font-semibold text-gray-900'>ID:</span> #{selectedItem.id}</div>
              <div><span className='font-semibold text-gray-900'>Invoice ID:</span> {selectedItem.invoiceId}</div>
              <div><span className='font-semibold text-gray-900'>Tên khoản phí:</span> {selectedItem.itemName}</div>
              <div><span className='font-semibold text-gray-900'>Số tiền:</span> {selectedItem.amount}</div>
              <div><span className='font-semibold text-gray-900'>Meter ID:</span> {selectedItem.meterId || '--'}</div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

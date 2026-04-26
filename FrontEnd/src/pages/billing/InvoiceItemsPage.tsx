import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { invoiceItemsApi } from 'src/apis/billing_api/invoice-items.api'

export default function InvoiceItemsPage() {
  const queryClient = useQueryClient()
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
    <div className='p-6'>
      <h2 className='mb-4 text-xl font-bold'>Invoice Items</h2>
      <form
        className='mb-4 grid grid-cols-1 gap-2 md:grid-cols-5'
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
        }}
      >
        <input name='invoiceId' placeholder='Invoice ID' className='rounded border px-2 py-2' />
        <input name='itemName' placeholder='Item name' className='rounded border px-2 py-2' />
        <input name='amount' placeholder='Amount' className='rounded border px-2 py-2' />
        <input name='meterId' placeholder='Meter ID (optional)' className='rounded border px-2 py-2' />
        <button className='rounded bg-blue-600 px-3 py-2 text-white'>{createMutation.isPending ? 'Saving...' : 'Create item'}</button>
      </form>
      <div className='space-y-2'>
        {list.map((item) => (
          <div key={item.id} className='flex items-center justify-between rounded border p-3'>
            <div>Invoice {item.invoiceId} | {item.itemName} | {item.amount}</div>
            <button className='rounded bg-red-100 px-2 py-1' onClick={() => deleteMutation.mutate(item.id)}>Xóa mềm</button>
          </div>
        ))}
      </div>
    </div>
  )
}

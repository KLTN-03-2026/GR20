// src/pages/TestAllQrApi/TestAllQrApi.tsx
import { useState } from 'react'
import { qrApi } from './Qr.api'

export default function TestAllQrApi() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testAPIs = async () => {
    setLoading(true)
    const results: any = {}

    try {
      // 1. Test scan QR
      results.scan = await qrApi.scanQr('GUEST_30a98f1d-2df5-4429-a746-7889e157dcb3')

      // 2. Test get list by host
      results.list = await qrApi.getGuestQrsByHost(1)

      // 3. Test get detail
      if (results.list.data.data[0]) {
        results.detail = await qrApi.getGuestQrById(results.list.data.data[0].id)
      }

      // 4. Test history
      results.history = await qrApi.getGuestQrHistory(1)

      setResult(results)
    } catch (error) {
      console.error(error)
      setResult({ error })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='p-4'>
      <button onClick={testAPIs} disabled={loading} className='bg-blue-500 text-white px-4 py-2 rounded'>
        {loading ? 'Testing...' : 'Test All APIs'}
      </button>

      {result && (
        <pre className='mt-4 bg-gray-100 p-4 rounded overflow-auto max-h-[600px] text-xs'>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}

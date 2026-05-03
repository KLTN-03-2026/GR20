import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
// import { AppProvider } from './contexts/app.context'
import 'src/i18n/i18n'
import { AppProvider } from './contexts/app.context'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, //dòng này để khi mình focus vào window thì nó sẽ không tự động refetch lại dữ liệu
      retry: 0 //nếy để là 3 thì khi fail nó sẽ retry lại 3 lần mới thôi
    }
  }
})
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <App />
        </AppProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
)

//  <ToastContainer
//       position='top-right'
//       autoClose={3000}
//       hideProgressBar={false}
//       newestOnTop={false}
//       closeOnClick
//       rtl={false}
//       pauseOnFocusLoss
//       draggable
//       pauseOnHover
//       theme='colored'
//     />

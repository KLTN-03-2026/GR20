import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import config from '../contexts/config'

export const useChatSocket = (userId?: number) => {
  // Thay useRef bằng useState để Component render lại khi có socket
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    // Nếu chưa có userId thì không kết nối
    if (!userId) return

    // Khởi tạo kết nối socket
    const socketInstance = io(config.BASEURL, {
      auth: { userId },
      transports: ['websocket']
    })

    socketInstance.on('connect', () => {
      console.log('⚡ Đã kết nối Socket thành công! ID:', socketInstance.id)
    })

    socketInstance.on('error_message', (error) => {
      console.error('❌ Lỗi Socket từ server:', error.message)
    })

    // Lưu socket vào state
    setSocket(socketInstance)

    // Cleanup function: Tự động ngắt kết nối khi rời khỏi trang Chat
    return () => {
      socketInstance.disconnect()
      console.log('Đã ngắt kết nối Socket')
    }
  }, [userId])

  // Trả về state socket
  return socket
}

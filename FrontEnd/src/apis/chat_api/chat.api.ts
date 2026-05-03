import http from '../../utils/http'

export const chatApi = {
  initChatProfile: async (prefixName: string) => (await http.post('/api/chat/init', { prefixName })).data.data,

  getDirectory: async (search?: string) => (await http.get('/api/chat/directory', { params: { search } })).data.data,

  initPrivateChat: async (targetUserId: number) => (await http.post('/api/chat/private', { targetUserId })).data.data,

  uploadFileMessage: async (roomId: number, file: File) => {
    const formData = new FormData()
    formData.append('roomId', roomId.toString())
    formData.append('file', file)

    return (
      await http.post('/api/chat/message/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    ).data.data
  },

  // --- 2 HÀM MỚI THÊM VÀO ---

  // 1. Lấy danh sách hộp thư (Inbox)
  getInboxList: async () => (await http.get('/api/chat/inbox')).data.data,

  // 2. Lấy lịch sử tin nhắn của 1 phòng
  getMessageHistory: async (roomId: number) => (await http.get(`/api/chat/rooms/${roomId}/messages`)).data.data
}

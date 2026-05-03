import React, { useState, useContext, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApi } from '../../apis/chat_api/chat.api'
import { AppContext } from '../../contexts/app.context'
import { useChatSocket } from '../../hooks/useChatSocket'
import { toast } from 'react-toastify'

export default function ChatPage() {
  const { user } = useContext(AppContext)
  const currentUserId = Number(user?._id || user?.id)
  const socket = useChatSocket(currentUserId)
  const queryClient = useQueryClient() // Dùng để refresh data

  const [activeTab, setActiveTab] = useState<'chats' | 'directory'>('chats')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentRoomId, setCurrentRoomId] = useState<number | null>(null)
  const [currentChatUser, setCurrentChatUser] = useState<any>(null)

  const [messages, setMessages] = useState<any[]>([])
  const [messageContent, setMessageContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Lắng nghe tin nhắn mới
  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (newMessage) => {
        if (Number(newMessage.roomId) === Number(currentRoomId)) {
          setMessages((prev) => [...prev, newMessage])
        }
        // Refresh lại danh sách Inbox bên trái để nó đẩy người vừa nhắn lên đầu
        queryClient.invalidateQueries({ queryKey: ['chatInbox'] })
      })
    }
    return () => {
      socket?.off('receive_message')
    }
  }, [socket, currentRoomId, queryClient])

  // API 1: Lấy danh bạ (Giữ nguyên)
  const { data: directoryData, isLoading: isLoadingDirectory } = useQuery({
    queryKey: ['chatDirectory', searchQuery],
    queryFn: () => chatApi.getDirectory(searchQuery),
    enabled: activeTab === 'directory'
  })

  // --- API MỚI 1: Lấy danh sách Inbox (Cuộc trò chuyện cũ) ---
  const { data: inboxData, isLoading: isLoadingInbox } = useQuery({
    queryKey: ['chatInbox'],
    queryFn: chatApi.getInboxList,
    enabled: activeTab === 'chats' // Chỉ gọi khi ở tab Cuộc trò chuyện
  })

  // --- API MỚI 2: Lấy Lịch sử tin nhắn khi click vào 1 phòng ---
  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['chatHistory', currentRoomId],
    queryFn: () => chatApi.getMessageHistory(currentRoomId!),
    enabled: !!currentRoomId
  })

  // Dùng useEffect để cập nhật messages khi lấy được lịch sử chat
  useEffect(() => {
    if (historyData) {
      setMessages(historyData)
    }
  }, [historyData])

  // API: Bấm vào danh bạ để tạo/mở phòng chat 1-1
  const initPrivateChatMutation = useMutation({
    mutationFn: chatApi.initPrivateChat,
    onSuccess: (res, variables) => {
      const roomId = res.roomId
      setCurrentRoomId(roomId)
      setActiveTab('chats')

      const targetUser = directoryData?.find((u: any) => Number(u.userId) === Number(variables))
      if (targetUser) setCurrentChatUser(targetUser)

      if (socket) socket.emit('join_room', roomId)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Lỗi tạo phòng')
    }
  })

  // Xử lý khi click vào 1 người trong Danh bạ
  const handleStartChatFromDirectory = (targetUserId: any) => {
    const targetIdNum = Number(targetUserId)
    if (targetIdNum === currentUserId) return
    initPrivateChatMutation.mutate(targetIdNum)
  }

  // Xử lý khi click vào 1 phòng chat có sẵn trong Inbox
  const handleSelectInboxRoom = (room: any) => {
    setCurrentRoomId(room.roomId)

    if (room.type === 'building' || room.type === 'group') {
      // Nếu là nhóm chung, tự tạo object ảo để UI hiển thị được Header
      setCurrentChatUser({
        userId: 'group', // ID ảo
        nickname: room.name,
        roleName: 'Nhóm cư dân chung',
        avatarUrl: room.avatar,
        isGroup: true // Cờ đánh dấu đây là chat nhóm
      })
    } else {
      // Nếu là 1-1 thì lấy thông tin người kia như bình thường
      setCurrentChatUser(room.chatWithUser)
    }

    if (socket) socket.emit('join_room', room.roomId)
  }
  const handleSendMessage = () => {
    if (!socket || !currentRoomId || !messageContent.trim()) return

    const data = {
      roomId: currentRoomId,
      content: messageContent
    }

    socket.emit('send_message', data)
    setMessageContent('')
    // Gửi xong thì refresh lại inbox để cái chat này nhảy lên đầu
    queryClient.invalidateQueries({ queryKey: ['chatInbox'] })
  }

  const getInitials = (name: string) => {
    if (!name) return 'UN'
    const words = name.split(' ')
    return words.length >= 2
      ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase()
  }

  // Format giờ đẹp để hiển thị tin nhắn cuối (VD: 14:30)
  const formatTime = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className='min-h-screen bg-[#F8F9FA] p-8 font-sans'>
      <div className='flex justify-between items-start mb-6'>
        <div>
          <span className='bg-[#DDE7FF] text-[#0052CC] px-3 py-1 rounded text-xs font-bold tracking-wider uppercase'>
            Communication
          </span>
          <h1 className='text-3xl font-bold text-gray-900 mt-4 mb-2'>Trò chuyện trực tuyến</h1>
          <p className='text-gray-500 text-sm'>Kết nối và trao đổi công việc theo thời gian thực.</p>
        </div>
      </div>

      <div className='flex h-[75vh] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
        {/* CỘT TRÁI */}
        <div className='w-1/3 border-r border-gray-100 flex flex-col bg-white'>
          <div className='flex p-4 border-b border-gray-100 shrink-0'>
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition ${activeTab === 'chats' ? 'bg-[#F8F9FA] text-[#0052CC]' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Cuộc trò chuyện
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition ${activeTab === 'directory' ? 'bg-[#F8F9FA] text-[#0052CC]' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Danh bạ
            </button>
          </div>

          <div className='flex-1 overflow-hidden p-4 flex flex-col'>
            {activeTab === 'chats' ? (
              // HIỂN THỊ DANH SÁCH INBOX
              <div className='flex-1 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar'>
                {isLoadingInbox ? (
                  <div className='flex justify-center py-8'>
                    <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-[#0052CC]'></div>
                  </div>
                ) : inboxData?.length === 0 ? (
                  <p className='text-sm text-center text-gray-400 mt-4'>Bạn chưa có cuộc trò chuyện nào.</p>
                ) : (
                  inboxData?.map((room: any) => (
                    <div
                      key={room.roomId}
                      className={`flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition border ${currentRoomId === room.roomId ? 'border-[#0052CC] bg-[#F8F9FA]' : 'border-transparent hover:border-gray-100'}`}
                      onClick={() => handleSelectInboxRoom(room)}
                    >
                      {room.avatar ? (
                        <img src={room.avatar} alt='avatar' className='w-11 h-11 rounded-full object-cover shadow-sm' />
                      ) : (
                        <div className='w-11 h-11 rounded-full bg-[#E5EDFF] text-[#0052CC] flex items-center justify-center font-bold text-sm shrink-0 shadow-sm'>
                          {getInitials(room.name)}
                        </div>
                      )}
                      <div className='overflow-hidden flex-1'>
                        <div className='flex justify-between items-center mb-0.5'>
                          <h4 className='font-bold text-gray-900 text-sm truncate'>{room.name}</h4>
                          <span className='text-[10px] text-gray-400'>{formatTime(room.lastMessageAt)}</span>
                        </div>
                        <p className='text-xs text-gray-500 truncate'>{room.lastMessage || 'Chưa có tin nhắn'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // HIỂN THỊ DANH BẠ
              <div className='flex flex-col h-full space-y-4'>
                <div className='relative shrink-0 text-gray-400'>
                  <input
                    type='text'
                    placeholder='Tìm kiếm cư dân, nhân viên...'
                    className='w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/50 text-sm font-medium transition text-gray-900'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <svg
                    className='w-4 h-4 absolute left-3.5 top-3.5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                    ></path>
                  </svg>
                </div>

                <div className='flex-1 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar'>
                  {isLoadingDirectory ? (
                    <div className='flex justify-center py-8'>
                      <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-[#0052CC]'></div>
                    </div>
                  ) : (
                    directoryData?.map((u: any) => (
                      <div
                        key={u.userId}
                        className={`flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition border ${Number(currentChatUser?.userId) === Number(u.userId) ? 'border-[#0052CC] bg-[#F8F9FA]' : 'border-transparent hover:border-gray-100'}`}
                        onClick={() => handleStartChatFromDirectory(u.userId)}
                      >
                        {u.avatarUrl ? (
                          <img
                            src={u.avatarUrl}
                            alt='avatar'
                            className='w-11 h-11 rounded-full object-cover shadow-sm'
                          />
                        ) : (
                          <div className='w-11 h-11 rounded-full bg-[#E5EDFF] text-[#0052CC] flex items-center justify-center font-bold text-sm shrink-0 shadow-sm'>
                            {getInitials(u.nickname)}
                          </div>
                        )}
                        <div className='overflow-hidden flex-1'>
                          <h4 className='font-bold text-gray-900 text-sm truncate'>{u.nickname}</h4>
                          <p className='text-xs text-gray-500 truncate mt-0.5'>{u.roleName || 'Cư dân'}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div className='w-2/3 flex flex-col bg-[#F8F9FA]/30 relative'>
          {currentRoomId && currentChatUser ? (
            <div className='flex-1 flex flex-col overflow-hidden'>
              <div className='px-6 py-4 border-b border-gray-100 bg-white flex items-center justify-between shrink-0'>
                <div className='flex items-center gap-3'>
                  {currentChatUser.avatarUrl || currentChatUser.avatar ? (
                    <img
                      src={currentChatUser.avatarUrl || currentChatUser.avatar}
                      alt='avatar'
                      className='w-10 h-10 rounded-full object-cover shadow-sm'
                    />
                  ) : (
                    <div className='w-10 h-10 rounded-full bg-[#E5EDFF] text-[#0052CC] flex items-center justify-center font-bold text-sm shadow-sm'>
                      {getInitials(currentChatUser.nickname || currentChatUser.name)}
                    </div>
                  )}
                  <div>
                    <h3 className='font-bold text-gray-900'>{currentChatUser.nickname || currentChatUser.name}</h3>
                    <div className='flex items-center gap-1.5 mt-0.5'>
                      <span className='w-2 h-2 rounded-full bg-green-500 animate-pulse'></span>
                      <span className='text-xs text-gray-500'>Đang tham gia</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className='flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 custom-scrollbar'>
                {isLoadingHistory ? (
                  <div className='h-full flex flex-col items-center justify-center'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#0052CC]'></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className='h-full flex flex-col items-center justify-center text-gray-400'>
                    <p className='text-xs bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-100'>
                      Bắt đầu cuộc trò chuyện mới
                    </p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = Number(msg.senderId) === currentUserId
                    return (
                      <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[70%] p-3.5 rounded-2xl text-sm shadow-sm ${
                            isMe
                              ? 'bg-[#0052CC] text-white rounded-tr-none'
                              : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                          }`}
                        >
                          {/* NẾU LÀ CHAT NHÓM VÀ KHÔNG PHẢI MÌNH GỬI -> HIỂN THỊ TÊN NGƯỜI ĐÓ */}
                          {!isMe && currentChatUser?.isGroup && (
                            <div className='text-xs font-bold text-[#0052CC] mb-1'>
                              {msg.senderName || msg.senderUsername || 'Thành viên'}
                            </div>
                          )}
                          {msg.content}
                          <div className={`text-[10px] mt-1.5 opacity-70 ${isMe ? 'text-right' : 'text-left'}`}>
                            {formatTime(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className='p-4 bg-white border-t border-gray-100 shrink-0'>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className='flex items-center gap-2'
                >
                  {/* Nút Upload ảnh sẽ làm ở bước sau */}
                  <button
                    type='button'
                    className='p-2 text-gray-400 hover:text-[#0052CC] transition rounded-full hover:bg-gray-50'
                  >
                    <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12'
                      ></path>
                    </svg>
                  </button>
                  <input
                    type='text'
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder='Nhập tin nhắn...'
                    className='flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/50 text-sm'
                  />
                  <button
                    type='submit'
                    disabled={!messageContent.trim()}
                    className='w-10 h-10 bg-[#0052CC] hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition shadow-md'
                  >
                    <svg className='w-5 h-5 ml-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
                      ></path>
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className='flex-1 flex flex-col items-center justify-center gap-4'>
              <div className='w-20 h-20 bg-white shadow-xl rounded-full flex items-center justify-center text-[#0052CC]/20 border border-gray-50'>
                <svg className='w-10 h-10' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='1.5'
                    d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                  ></path>
                </svg>
              </div>
              <p className='text-gray-400 text-sm font-medium'>Chọn một cuộc trò chuyện để bắt đầu</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import React, { useState, useContext, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApi } from '../../apis/chat_api/chat.api'
import { AppContext } from '../../contexts/app.context'
import { useChatSocket } from '../../hooks/useChatSocket'
import { toast } from 'react-toastify'
import config from '../../contexts/config'

export default function ChatPage() {
  const { user } = useContext(AppContext)
  const currentUserId = Number(user?._id || user?.id)
  const socket = useChatSocket(currentUserId)
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<'chats' | 'directory'>('chats')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentRoomId, setCurrentRoomId] = useState<number | null>(null)
  const [currentChatUser, setCurrentChatUser] = useState<any>(null)
  const [selectedModalImage, setSelectedModalImage] = useState<string | null>(null)

  const [messages, setMessages] = useState<any[]>([])
  const [messageContent, setMessageContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [editingMessageId, setEditingMessageId] = useState<number | null>(null)
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null)

  const [typingUserIds, setTypingUserIds] = useState<number[]>([])
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [isLastMessageRead, setIsLastMessageRead] = useState(false)
  const [onlineUserIds, setOnlineUserIds] = useState<number[]>([])

  const [showInitModal, setShowInitModal] = useState(false)
  const [prefixName, setPrefixName] = useState('')
  const [hasSubmittedEmpty, setHasSubmittedEmpty] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, typingUserIds, isLastMessageRead])

  useEffect(() => {
    if (!socket) return

    socket.on('receive_message', (newMessage) => {
      if (Number(newMessage.roomId) === Number(currentRoomId)) {
        setMessages((prev) => [...prev, newMessage])
        if (Number(newMessage.senderId) !== currentUserId) {
          socket.emit('mark_as_read', { roomId: currentRoomId })
        }
      }
      queryClient.invalidateQueries({ queryKey: ['chatInbox'] })
    })

    socket.on('message_updated', (updatedMsg) => {
      if (Number(updatedMsg.roomId) === Number(currentRoomId)) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === updatedMsg.id ? { ...msg, content: updatedMsg.content, updatedAt: updatedMsg.updatedAt } : msg
          )
        )
      }
    })

    socket.on('message_deleted', (deletedMsg) => {
      if (Number(deletedMsg.roomId) === Number(currentRoomId)) {
        setMessages((prev) => prev.map((msg) => (msg.id === deletedMsg.id ? { ...msg, isDeleted: true } : msg)))
      }
    })

    socket.on('user_typing', ({ userId }) => {
      setTypingUserIds((prev) => (prev.includes(userId) ? prev : [...prev, userId]))
    })

    socket.on('user_stop_typing', ({ userId }) => {
      setTypingUserIds((prev) => prev.filter((id) => id !== userId))
    })

    socket.on('user_read_message', ({ roomId }) => {
      if (Number(roomId) === Number(currentRoomId)) {
        setIsLastMessageRead(true)
      }
    })

    socket.on('online_users_list', (users: number[]) => {
      setOnlineUserIds(users)
    })

    socket.on('user_connected', (userId: number) => {
      setOnlineUserIds((prev) => (prev.includes(userId) ? prev : [...prev, userId]))
    })

    socket.on('user_disconnected', (userId: number) => {
      setOnlineUserIds((prev) => prev.filter((id) => id !== userId))
    })

    return () => {
      socket.off('receive_message')
      socket.off('message_updated')
      socket.off('message_deleted')
      socket.off('user_typing')
      socket.off('user_stop_typing')
      socket.off('user_read_message')
      socket.off('online_users_list')
      socket.off('user_connected')
      socket.off('user_disconnected')
    }
  }, [socket, currentRoomId, queryClient, currentUserId])

  useEffect(() => {
    setTypingUserIds([])
    setIsLastMessageRead(false)
    if (socket && currentRoomId) {
      socket.emit('mark_as_read', { roomId: currentRoomId })
    }
  }, [currentRoomId, socket])

  const { data: directoryData, isLoading: isLoadingDirectory } = useQuery({
    queryKey: ['chatDirectory', searchQuery],
    queryFn: () => chatApi.getDirectory(searchQuery),
    enabled: activeTab === 'directory'
  })

  const { data: inboxData, isLoading: isLoadingInbox } = useQuery({
    queryKey: ['chatInbox'],
    queryFn: chatApi.getInboxList,
    enabled: activeTab === 'chats'
  })

  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['chatHistory', currentRoomId],
    queryFn: () => chatApi.getMessageHistory(currentRoomId!),
    enabled: !!currentRoomId
  })

  useEffect(() => {
    if (inboxData && inboxData.length === 0 && !isLoadingInbox) {
      setShowInitModal(true)
    } else {
      setShowInitModal(false)
    }
  }, [inboxData, isLoadingInbox])

  useEffect(() => {
    if (historyData) setMessages(historyData)
  }, [historyData])

  useEffect(() => {
    if (messages.length > 0 && currentChatUser?.lastReadAt) {
      const lastMsg = messages[messages.length - 1]
      if (Number(lastMsg.senderId) === currentUserId) {
        const msgTime = new Date(lastMsg.createdAt).getTime()
        const readTime = new Date(currentChatUser.lastReadAt).getTime()
        if (readTime >= msgTime) {
          setIsLastMessageRead(true)
        }
      }
    }
  }, [messages, currentChatUser, currentUserId])

  const initProfileMutation = useMutation({
    mutationFn: chatApi.initChatProfile,
    onSuccess: () => {
      toast.success('Tuyệt vời! Đã vào phòng chat chung.')
      setShowInitModal(false)
      queryClient.invalidateQueries({ queryKey: ['chatInbox'] })
      queryClient.invalidateQueries({ queryKey: ['chatDirectory'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Lỗi khi đặt tên')
    }
  })

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
    onError: (error: any) => toast.error(error.response?.data?.message || 'Lỗi kết nối phòng chat')
  })

  const handleStartChatFromDirectory = (targetUserId: any) => {
    const targetIdNum = Number(targetUserId)
    if (targetIdNum === currentUserId) return
    initPrivateChatMutation.mutate(targetIdNum)
  }

  const handleSelectInboxRoom = (room: any) => {
    setCurrentRoomId(room.roomId)
    if (room.type === 'building' || room.type === 'group') {
      setCurrentChatUser({
        userId: 'group',
        nickname: room.name, // Khúc này nó sẽ ăn tên động "Nhóm cư dân tòa nhà HAGL1"
        roleName: 'Nhóm cư dân', // <--- SỬA CHỮ "Nhóm cộng đồng" THÀNH CHỮ NÀY
        avatarUrl: room.avatar,
        isGroup: true
      })
    } else {
      setCurrentChatUser(room.chatWithUser)
    }
    if (socket) socket.emit('join_room', room.roomId)
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageContent(e.target.value)
    if (socket && currentRoomId) {
      socket.emit('typing', { roomId: currentRoomId })
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { roomId: currentRoomId })
      }, 2000)
    }
  }

  const handleSendMessage = () => {
    if (!socket || !currentRoomId || !messageContent.trim()) return

    if (editingMessageId) {
      socket.emit('edit_message', { roomId: currentRoomId, messageId: editingMessageId, newContent: messageContent })
      setEditingMessageId(null)
    } else {
      socket.emit('send_message', { roomId: currentRoomId, content: messageContent })
      setIsLastMessageRead(false)
    }

    setMessageContent('')
    socket.emit('stop_typing', { roomId: currentRoomId })
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    queryClient.invalidateQueries({ queryKey: ['chatInbox'] })
  }

  const handleDeleteMessage = (messageId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn thu hồi tin nhắn này?')) {
      if (socket) socket.emit('delete_message', { roomId: currentRoomId, messageId })
    }
  }

  const handleStartEdit = (msg: any) => {
    setEditingMessageId(msg.id)
    setMessageContent(msg.content)
  }

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentRoomId) return
    try {
      toast.info('Đang tải ảnh lên...')
      await chatApi.uploadFileMessage(currentRoomId, file)
      setIsLastMessageRead(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      queryClient.invalidateQueries({ queryKey: ['chatInbox'] })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi gửi hình ảnh')
    }
  }

  const getInitials = (name: string) => {
    if (!name) return '?'
    const words = name.split(' ')
    return words.length >= 2 ? (words[0][0] + words[words.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className='min-h-screen bg-[#F8F9FA] p-8 font-sans relative'>
      <div className='flex justify-between items-start mb-6'>
        <div>
          <span className='bg-[#DDE7FF] text-[#0052CC] px-3 py-1 rounded text-xs font-bold uppercase tracking-wider'>
            Communication
          </span>
          <h1 className='text-3xl font-bold text-gray-900 mt-4 mb-2'>Trò chuyện trực tuyến</h1>
          <p className='text-gray-500 text-sm'>Dự án quản lý tòa nhà Homelink AI.</p>
        </div>
      </div>

      <div className='flex h-[75vh] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative'>
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
              <div className='flex-1 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar'>
                {isLoadingInbox ? (
                  <div className='flex justify-center py-8'>
                    <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-[#0052CC]'></div>
                  </div>
                ) : (
                  inboxData?.map((room: any) => {
                    const isOtherUserOnline =
                      !room.type?.includes('group') &&
                      !room.type?.includes('building') &&
                      room.chatWithUser?.userId &&
                      onlineUserIds.includes(Number(room.chatWithUser.userId))

                    return (
                      <div
                        key={room.roomId}
                        onClick={() => handleSelectInboxRoom(room)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition border ${currentRoomId === room.roomId ? 'border-[#0052CC] bg-[#F8F9FA]' : 'border-transparent hover:bg-gray-50'}`}
                      >
                        <div className='relative shrink-0'>
                          <div className='w-11 h-11 rounded-full bg-[#E5EDFF] text-[#0052CC] flex items-center justify-center font-bold text-sm shadow-sm'>
                            {getInitials(room.name)}
                          </div>
                          {isOtherUserOnline && (
                            <span className='absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full'></span>
                          )}
                        </div>
                        <div className='overflow-hidden flex-1'>
                          <div className='flex justify-between items-center'>
                            <h4 className='font-bold text-gray-900 text-sm truncate'>{room.name}</h4>
                            <span className='text-[10px] text-gray-400'>{formatTime(room.lastMessageAt)}</span>
                          </div>
                          <p className='text-xs text-gray-500 truncate'>
                            {room.lastMessage || 'Bắt đầu trò chuyện...'}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            ) : (
              <div className='flex flex-col h-full space-y-4'>
                <div className='relative shrink-0 text-gray-400'>
                  <input
                    type='text'
                    placeholder='Tìm kiếm...'
                    className='w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm'
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
                  ) : directoryData?.length === 0 ? (
                    <div className='text-center text-sm text-gray-500 py-4'>Chưa có thành viên nào trong danh bạ</div>
                  ) : (
                    directoryData?.map((u: any) => (
                      <div
                        key={u.userId}
                        onClick={() => handleStartChatFromDirectory(u.userId)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition border ${Number(currentChatUser?.userId) === Number(u.userId) ? 'border-[#0052CC] bg-[#F8F9FA]' : 'border-transparent hover:bg-gray-50'}`}
                      >
                        <div className='relative shrink-0'>
                          <div className='w-11 h-11 rounded-full bg-[#E5EDFF] text-[#0052CC] flex items-center justify-center font-bold text-sm shadow-sm'>
                            {getInitials(u.nickname)}
                          </div>
                          {onlineUserIds.includes(Number(u.userId)) && (
                            <span className='absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full'></span>
                          )}
                        </div>
                        <div className='overflow-hidden flex-1'>
                          <h4 className='font-bold text-gray-900 text-sm truncate'>{u.nickname}</h4>
                          <p className='text-xs text-gray-500 truncate'>{u.roleName || 'Thành viên'}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='w-2/3 flex flex-col bg-[#F8F9FA]/30 relative overflow-hidden'>
          {currentRoomId && currentChatUser ? (
            <div className='flex-1 flex flex-col overflow-hidden'>
              <div className='px-6 py-4 border-b border-gray-100 bg-white flex items-center gap-3 shrink-0 relative z-10'>
                <div className='w-10 h-10 rounded-full bg-[#E5EDFF] text-[#0052CC] flex items-center justify-center font-bold text-sm shadow-sm'>
                  {getInitials(currentChatUser.nickname || currentChatUser.name)}
                </div>
                <div>
                  <h3 className='font-bold text-gray-900'>{currentChatUser.nickname || currentChatUser.name}</h3>
                  {currentChatUser.isGroup ? (
                    <span className='text-[10px] text-[#0052CC] font-bold uppercase'>Nhóm cộng đồng</span>
                  ) : onlineUserIds.includes(Number(currentChatUser.userId)) ? (
                    <div className='flex items-center gap-1.5 mt-0.5'>
                      <span className='w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]'></span>
                      <span className='text-[10px] text-green-500 font-bold uppercase tracking-wider'>Trực tuyến</span>
                    </div>
                  ) : (
                    <div className='flex items-center gap-1.5 mt-0.5'>
                      <span className='w-2 h-2 rounded-full bg-gray-300'></span>
                      <span className='text-[10px] text-gray-400 font-bold uppercase tracking-wider'>Ngoại tuyến</span>
                    </div>
                  )}
                </div>
              </div>

              <div className='flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 custom-scrollbar relative z-0'>
                {isLoadingHistory ? (
                  <div className='h-full flex items-center justify-center'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#0052CC]'></div>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = Number(msg.senderId) === currentUserId
                    const imageUrl = `${config.BASEURL}${msg.attachmentUrl || msg.attachment?.url}`
                    const isMyLastMessage = isMe && idx === messages.length - 1
                    const isEdited =
                      msg.updatedAt && new Date(msg.updatedAt).getTime() - new Date(msg.createdAt).getTime() > 1000

                    return (
                      <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div
                          onMouseEnter={() => setHoveredMessageId(msg.id)}
                          onMouseLeave={() => setHoveredMessageId(null)}
                          className={`relative max-w-[70%] p-3.5 rounded-2xl text-sm shadow-sm ${
                            isMe
                              ? msg.isDeleted
                                ? 'bg-gray-100 text-gray-400 border border-gray-200'
                                : 'bg-[#0052CC] text-white rounded-tr-none'
                              : msg.isDeleted
                                ? 'bg-gray-100 text-gray-400 border border-gray-200'
                                : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                          }`}
                        >
                          {isMe && !msg.isDeleted && hoveredMessageId === msg.id && (
                            <div className='absolute top-2 -left-[76px] flex items-center gap-1 bg-white shadow-md border border-gray-100 rounded-lg p-1 before:absolute before:content-[""] before:inset-y-0 before:-right-10 before:w-10 before:bg-transparent'>
                              {msg.messageType === 'text' && (
                                <button
                                  onClick={() => handleStartEdit(msg)}
                                  className='p-1.5 hover:bg-blue-50 text-blue-600 rounded transition'
                                  title='Chỉnh sửa'
                                >
                                  <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth='2'
                                      d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
                                    ></path>
                                  </svg>
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className='p-1.5 hover:bg-red-50 text-red-500 rounded transition'
                                title='Thu hồi'
                              >
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth='2'
                                    d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                                  ></path>
                                </svg>
                              </button>
                            </div>
                          )}

                          {!isMe && currentChatUser?.isGroup && !msg.isDeleted && (
                            <div className='text-[10px] font-bold text-[#0052CC] mb-1'>
                              {msg.senderName || msg.senderUsername}
                            </div>
                          )}

                          {msg.isDeleted ? (
                            <div className='italic'>Tin nhắn đã bị thu hồi</div>
                          ) : msg.messageType === 'image' ? (
                            <img
                              src={imageUrl}
                              alt='sent image'
                              className='rounded-lg max-h-60 w-full object-cover cursor-pointer hover:opacity-90 transition'
                              onClick={() => setSelectedModalImage(imageUrl)}
                            />
                          ) : (
                            <div className='whitespace-pre-wrap break-words'>{msg.content}</div>
                          )}

                          <div
                            className={`text-[10px] mt-1.5 flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'} ${msg.isDeleted ? 'opacity-0' : 'opacity-60'}`}
                          >
                            {isEdited && !msg.isDeleted && <span>(đã sửa)</span>}
                            {formatTime(msg.createdAt)}
                          </div>
                        </div>

                        {isMyLastMessage && isLastMessageRead && !currentChatUser?.isGroup && (
                          <div className='text-[10px] text-gray-400 mt-1 flex items-center gap-1'>
                            <svg
                              className='w-3 h-3 text-[#0F9D58]'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth='3'
                                d='M5 13l4 4L19 7'
                              ></path>
                            </svg>
                            Đã xem
                          </div>
                        )}
                      </div>
                    )
                  })
                )}

                {typingUserIds.length > 0 && (
                  <div className='flex justify-start'>
                    <div className='bg-gray-100 text-gray-500 text-xs px-4 py-2.5 rounded-2xl rounded-tl-none animate-pulse flex items-center gap-2 shadow-sm border border-gray-200'>
                      <span className='flex gap-1'>
                        <span className='w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce'></span>
                        <span
                          className='w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce'
                          style={{ animationDelay: '0.2s' }}
                        ></span>
                        <span
                          className='w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce'
                          style={{ animationDelay: '0.4s' }}
                        ></span>
                      </span>
                      {currentChatUser?.isGroup
                        ? 'Ai đó đang gõ...'
                        : `${currentChatUser?.nickname || 'Người dùng'} đang gõ...`}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className='bg-white border-t border-gray-100 shrink-0 relative z-10'>
                {editingMessageId && (
                  <div className='absolute -top-10 left-0 right-0 bg-blue-50/90 backdrop-blur-sm px-6 py-2 flex items-center justify-between text-xs text-[#0052CC] border-t border-blue-100 shadow-sm'>
                    <div className='flex items-center gap-2'>
                      <svg className='w-4 h-4 animate-pulse' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
                        ></path>
                      </svg>
                      <span className='font-medium'>Đang chỉnh sửa tin nhắn...</span>
                    </div>
                    <button
                      type='button'
                      onClick={() => {
                        setEditingMessageId(null)
                        setMessageContent('')
                      }}
                      className='hover:text-red-500 font-bold transition'
                    >
                      Hủy (X)
                    </button>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className='flex items-center gap-2 p-4'
                >
                  <input
                    type='file'
                    ref={fileInputRef}
                    className='hidden'
                    accept='image/*'
                    onChange={handleUploadImage}
                    disabled={!!editingMessageId}
                  />
                  <button
                    type='button'
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!!editingMessageId}
                    className={`p-2 transition rounded-full ${editingMessageId ? 'text-gray-300' : 'text-gray-400 hover:text-[#0052CC] hover:bg-gray-50'}`}
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
                    onChange={handleTyping}
                    placeholder='Nhập tin nhắn...'
                    className='flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052CC]/50'
                  />
                  <button
                    type='submit'
                    disabled={!messageContent.trim()}
                    className='w-10 h-10 bg-[#0052CC] hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition shadow-md'
                  >
                    {editingMessageId ? (
                      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7'></path>
                      </svg>
                    ) : (
                      <svg className='w-5 h-5 ml-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
                        ></path>
                      </svg>
                    )}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className='flex-1 flex flex-col items-center justify-center gap-4 relative z-0'>
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

      {selectedModalImage && (
        <div
          className='fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/80 backdrop-blur-sm'
          onClick={() => setSelectedModalImage(null)}
        >
          <button
            onClick={() => setSelectedModalImage(null)}
            className='absolute top-6 right-6 text-white hover:text-gray-300 transition'
          >
            <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12'></path>
            </svg>
          </button>
          <div
            className='bg-white p-2 rounded-2xl shadow-2xl max-w-5xl max-h-[90vh] overflow-hidden'
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedModalImage}
              alt='sent full size'
              className='max-w-full max-h-[85vh] rounded-xl object-contain'
            />
          </div>
        </div>
      )}

      {/* --- POPUP ĐẶT TÊN KHỞI TẠO CHAT VỚI VALIDATION --- */}
      {showInitModal && (
        <div className='fixed inset-0 z-[10000] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm'>
          <div className='bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center transform transition-all'>
            <div className='w-16 h-16 bg-[#E5EDFF] text-[#0052CC] rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z'
                ></path>
              </svg>
            </div>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>Chào mừng đến với Chat</h2>
            <p className='text-gray-500 text-sm mb-6'>
              Vui lòng đặt một biệt danh (Prefix) để mọi người trong hệ thống dễ dàng nhận ra bạn nhé!
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!prefixName.trim()) {
                  setHasSubmittedEmpty(true)
                  toast.warning('Bạn chưa nhập tên đệm kìa!')
                  return
                }
                initProfileMutation.mutate(prefixName)
              }}
            >
              <input
                type='text'
                value={prefixName}
                onChange={(e) => {
                  setPrefixName(e.target.value)
                  if (e.target.value.trim()) setHasSubmittedEmpty(false)
                }}
                placeholder='VD: Căn hộ 1505, Kỹ thuật viên...'
                className={`w-full border rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 transition text-sm ${
                  hasSubmittedEmpty || (prefixName.trim() === '' && initProfileMutation.isError)
                    ? 'border-red-500 focus:ring-red-500 ring-1 ring-red-500'
                    : 'border-gray-300 focus:ring-[#0052CC]'
                }`}
                autoFocus
              />
              <button
                type='submit'
                disabled={initProfileMutation.isPending}
                className='w-full bg-[#0052CC] hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition disabled:bg-gray-300 shadow-md flex justify-center items-center'
              >
                {initProfileMutation.isPending ? (
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                ) : (
                  'Bắt đầu trò chuyện'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

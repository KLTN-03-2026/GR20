import React, { useState, useRef, useEffect } from 'react'

// Định nghĩa kiểu dữ liệu cho tin nhắn
interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      text: 'Xin chào! Mình là trợ lý AI của chung cư. Bạn cần hỗ trợ về vấn đề kỹ thuật, an ninh, hay tiện ích cộng đồng?',
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const token = localStorage.getItem('access_token')

      const response = await fetch('http://localhost:8000/api/aichat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage.text })
      })

      if (!response.ok) {
        throw new Error('Lỗi phản hồi từ server')
      }

      const result = await response.json()

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: result.data.answer,
        sender: 'bot',
        timestamp: new Date()
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Lỗi kết nối mạng hoặc phiên đăng nhập hết hạn, vui lòng thử lại sau.',
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className='fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-16 h-16 bg-gradient-to-tr from-primary to-secondary text-white rounded-full shadow-2xl flex items-center justify-center ai-glow hover:scale-110 active:scale-95 transition-all z-50 group'
      >
        <span className='material-symbols-outlined text-3xl'>smart_toy</span>
        <div className='absolute -top-12 right-0 bg-white text-primary text-xs font-bold px-4 py-2 rounded-xl shadow-xl border border-secondary-container opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap'>
          Hỏi trợ lý AI Homelink
        </div>
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-[360px] h-[550px] bg-gray-50 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-200 font-['Manrope',sans-serif]">
      {/* HEADER */}
      <div className='bg-gradient-to-tr from-primary to-secondary p-4 flex items-center justify-between shadow-md z-10'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-white rounded-full flex items-center justify-center relative shadow-sm'>
            <span className='material-symbols-outlined text-blue-600 text-2xl'>smart_toy</span>
            <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white'></div>
          </div>
          <div>
            <h3 className='text-white font-bold text-[18px] leading-tight'>Trợ lý Chung Cư</h3>
            <p className='text-blue-100 text-[12px]'>Sẵn sàng hỗ trợ cư dân</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className='text-white hover:bg-white/20 p-1 rounded-full transition-colors'
        >
          <span className='material-symbols-outlined'>close</span>
        </button>
      </div>

      {/* CHAT BODY */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-white relative'>
        <div className='flex justify-center my-2'>
          <span className='bg-gray-100 text-gray-500 text-[11px] font-bold px-3 py-1 rounded-full tracking-wider'>
            HÔM NAY
          </span>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-gray-100 text-gray-800 rounded-tl-sm border border-gray-100'
              }`}
            >
              <p className='text-[14px] leading-relaxed whitespace-pre-wrap'>{msg.text}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className='flex justify-start'>
            <div className='bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center'>
              <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
              <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{ animationDelay: '0.2s' }}></div>
              <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* FOOTER INPUT */}
      <div className='p-3 bg-white border-t border-gray-100'>
        <div className='flex items-center gap-2 bg-gray-50 p-1 pl-4 rounded-full border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all'>
          <input
            type='text'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder='Hỏi về chung cư...'
            className='flex-1 bg-transparent outline-none text-[14px] text-gray-700 py-2'
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              inputValue.trim() && !isLoading
                ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span className='material-symbols-outlined text-[20px] ml-1'>send</span>
          </button>
        </div>
      </div>
    </div>
  )
}

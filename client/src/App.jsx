import { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'
import './App.css'

const socket = io()

function App() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [username, setUsername] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [typingUsers, setTypingUsers] = useState(new Set())
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    // 初期メッセージを取得
    fetch('/api/messages')
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error('Error fetching messages:', err))

    // Socket.IOイベントリスナー
    socket.on('message', (message) => {
      setMessages(prev => [...prev, message])
    })

    socket.on('typing', (data) => {
      setTypingUsers(prev => new Set([...prev, data.user]))
    })

    socket.on('stop-typing', (data) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(data.user)
        return newSet
      })
    })

    return () => {
      socket.off('message')
      socket.off('typing')
      socket.off('stop-typing')
    }
  }, [])

  useEffect(() => {
    // 新しいメッセージが来たら最下部へスクロール
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleLogin = (e) => {
    e.preventDefault()
    if (username.trim()) {
      setIsLoggedIn(true)
    }
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (inputMessage.trim() && username) {
      const message = {
        user: username,
        text: inputMessage.trim()
      }
      socket.emit('message', message)
      setInputMessage('')
      handleStopTyping()
    }
  }

  const handleTyping = () => {
    socket.emit('typing', { user: username })
    
    // 既存のタイマーをクリア
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // 3秒後に自動的にタイピング状態を解除
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping()
    }, 3000)
  }

  const handleStopTyping = () => {
    socket.emit('stop-typing', { user: username })
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <form onSubmit={handleLogin} className="login-form">
          <h1>チャットアプリ</h1>
          <input
            type="text"
            placeholder="ユーザー名を入力"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={20}
            required
          />
          <button type="submit">チャットを開始</button>
        </form>
      </div>
    )
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>チャットルーム</h1>
        <span className="username">ログイン中: {username}</span>
      </div>
      
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`message ${msg.user === username ? 'own-message' : 'other-message'}`}
          >
            <div className="message-header">
              <span className="message-user">{msg.user}</span>
              <span className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString('ja-JP', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            <div className="message-text">{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {typingUsers.size > 0 && (
        <div className="typing-indicator">
          {Array.from(typingUsers).filter(user => user !== username).join(', ')} が入力中...
        </div>
      )}
      
      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          placeholder="メッセージを入力..."
          value={inputMessage}
          onChange={(e) => {
            setInputMessage(e.target.value)
            if (e.target.value) {
              handleTyping()
            } else {
              handleStopTyping()
            }
          }}
          onBlur={handleStopTyping}
        />
        <button type="submit">送信</button>
      </form>
    </div>
  )
}

export default App
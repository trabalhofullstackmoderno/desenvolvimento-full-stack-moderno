import { useState, useEffect, useRef, useCallback } from 'react'

interface WebSocketMessage {
  type: string
  data: any
}

interface UseWebSocketReturn {
  isConnected: boolean
  lastMessage: WebSocketMessage | null
  sendMessage: (message: WebSocketMessage) => void
  onlineUsers: string[]
  typingUsers: Map<string, string[]>
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [typingUsers, setTypingUsers] = useState<Map<string, string[]>>(new Map())

  const ws = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>()

  const connect = useCallback(() => {
    try {
      // Get token from localStorage or wherever you store it
      const token = localStorage.getItem('accessToken') || new URLSearchParams(window.location.search).get('token')

      if (!token) {
        console.error('No token available for WebSocket connection')
        return
      }

      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3333'}/ws?token=${token}`
      ws.current = new WebSocket(wsUrl)

      ws.current.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)

        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'ping' }))
          }
        }, 30000)
      }

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          setLastMessage(message)

          // Handle specific message types
          switch (message.type) {
            case 'connected':
              console.log('WebSocket authenticated:', message.data)
              break
            case 'contact_status':
              handleContactStatus(message.data)
              break
            case 'typing_indicator':
              handleTypingIndicator(message.data)
              break
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)

        // Clear heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current)
        }

        // Attempt to reconnect after 3 seconds
        if (!event.wasClean) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, 3000)
        }
      }

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

    } catch (error) {
      console.error('Error creating WebSocket connection:', error)
    }
  }, [])

  const handleContactStatus = (data: any) => {
    setOnlineUsers(prev => {
      const updated = [...prev]
      const index = updated.indexOf(data.userId)

      if (data.isOnline && index === -1) {
        updated.push(data.userId)
      } else if (!data.isOnline && index !== -1) {
        updated.splice(index, 1)
      }

      return updated
    })
  }

  const handleTypingIndicator = (data: any) => {
    setTypingUsers(prev => {
      const updated = new Map(prev)
      const conversationTypers = updated.get(data.conversationId) || []

      if (data.isTyping) {
        if (!conversationTypers.includes(data.userId)) {
          conversationTypers.push(data.userId)
        }
      } else {
        const index = conversationTypers.indexOf(data.userId)
        if (index !== -1) {
          conversationTypers.splice(index, 1)
        }
      }

      if (conversationTypers.length > 0) {
        updated.set(data.conversationId, conversationTypers)
      } else {
        updated.delete(data.conversationId)
      }

      return updated
    })
  }

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message))
    } else {
      console.error('WebSocket is not connected')
    }
  }, [])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
    }

    if (ws.current) {
      ws.current.close(1000, 'User disconnected')
    }
  }, [])

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    isConnected,
    lastMessage,
    sendMessage,
    onlineUsers,
    typingUsers
  }
}
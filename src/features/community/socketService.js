if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
  window.global = window
}

import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8088/ws-chat'

let stompClient = null
const subscriptions = new Map()
const connectListeners = new Set()

export function getSocketClient() {
  if (stompClient) return stompClient

  stompClient = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 3000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: (str) => {
      // console.log('[STOMP debug]', str)
    },
    onConnect: (frame) => {
      console.log('STOMP connected to social-service WebSocket:', frame)
      // Execute all active subscription callbacks
      connectListeners.forEach((listener) => {
        try {
          listener()
        } catch (err) {
          console.error('Error executing STOMP connect listener:', err)
        }
      })
    },
    onStompError: (frame) => {
      console.error('STOMP error:', frame?.headers?.['message'], frame?.body)
    },
    onWebSocketClose: () => {
      console.warn('STOMP WebSocket closed, reconnecting...')
    },
  })

  return stompClient
}

export function connectSocket(onConnect) {
  const client = getSocketClient()

  if (onConnect) {
    connectListeners.add(onConnect)
  }

  if (!client.active) {
    client.activate()
  } else if (client.connected && onConnect) {
    try {
      onConnect()
    } catch (err) {
      console.error('Error in connectSocket callback:', err)
    }
  }

  return client
}

export function subscribeToConversation(conversationId, onMessage) {
  if (!conversationId) return () => {}
  const client = getSocketClient()
  const topic = `/topic/conversation/${conversationId}`

  const doSubscribe = () => {
    if (!client.connected) return
    if (subscriptions.has(topic)) {
      try {
        subscriptions.get(topic).unsubscribe()
      } catch {
        // ignore
      }
    }
    const sub = client.subscribe(topic, (message) => {
      try {
        const payload = JSON.parse(message.body)
        onMessage(payload)
      } catch (err) {
        console.error('Error parsing WS message:', err)
      }
    })
    subscriptions.set(topic, sub)
  }

  connectListeners.add(doSubscribe)

  if (client.connected) {
    doSubscribe()
  } else {
    connectSocket()
  }

  return () => {
    connectListeners.delete(doSubscribe)
    if (subscriptions.has(topic)) {
      try {
        subscriptions.get(topic).unsubscribe()
      } catch {
        // ignore
      }
      subscriptions.delete(topic)
    }
  }
}

export function subscribeToTyping(conversationId, onTyping) {
  if (!conversationId) return () => {}
  const client = getSocketClient()
  const topic = `/topic/conversation/${conversationId}/typing`

  const doSubscribe = () => {
    if (!client.connected) return
    if (subscriptions.has(topic)) {
      try {
        subscriptions.get(topic).unsubscribe()
      } catch {
        // ignore
      }
    }
    const sub = client.subscribe(topic, (message) => {
      try {
        const payload = JSON.parse(message.body)
        onTyping(payload)
      } catch (err) {
        console.error('Error parsing typing WS message:', err)
      }
    })
    subscriptions.set(topic, sub)
  }

  connectListeners.add(doSubscribe)

  if (client.connected) {
    doSubscribe()
  } else {
    connectSocket()
  }

  return () => {
    connectListeners.delete(doSubscribe)
    if (subscriptions.has(topic)) {
      try {
        subscriptions.get(topic).unsubscribe()
      } catch {
        // ignore
      }
      subscriptions.delete(topic)
    }
  }
}

export function sendTyping(conversationId, userId, userName, isTyping) {
  const client = getSocketClient()
  const payload = {
    conversationId,
    userId,
    userName,
    isTyping,
  }

  if (client && client.connected) {
    try {
      client.publish({
        destination: '/app/chat.typing',
        body: JSON.stringify(payload),
      })
      client.publish({
        destination: `/topic/conversation/${conversationId}/typing`,
        body: JSON.stringify(payload),
      })
    } catch (err) {
      console.warn('Cannot publish typing event:', err)
    }
  }
}

export function subscribeToUserEvents(userId, onEvent) {
  if (!userId) return () => {}
  const client = getSocketClient()
  const topic = `/topic/user/${userId}`

  const doSubscribe = () => {
    if (!client.connected) return
    if (subscriptions.has(topic)) {
      try {
        subscriptions.get(topic).unsubscribe()
      } catch {
        // ignore
      }
    }
    const sub = client.subscribe(topic, (message) => {
      try {
        const payload = JSON.parse(message.body)
        console.log(`[WS] Received user event on ${topic}:`, payload)
        onEvent(payload)
      } catch (err) {
        console.error('Error parsing user event WS message:', err)
      }
    })
    subscriptions.set(topic, sub)
    console.log(`[WS] Subscribed to personal channel ${topic}`)
  }

  connectListeners.add(doSubscribe)

  if (client.connected) {
    doSubscribe()
  } else {
    connectSocket()
  }

  return () => {
    connectListeners.delete(doSubscribe)
    if (subscriptions.has(topic)) {
      try {
        subscriptions.get(topic).unsubscribe()
      } catch {
        // ignore
      }
      subscriptions.delete(topic)
    }
  }
}

export function disconnectSocket() {
  if (stompClient) {
    connectListeners.clear()
    subscriptions.forEach((sub) => {
      try {
        sub.unsubscribe()
      } catch {
        // ignore
      }
    })
    subscriptions.clear()
    stompClient.deactivate()
    stompClient = null
  }
}

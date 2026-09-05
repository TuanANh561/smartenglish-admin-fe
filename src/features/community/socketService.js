const SOCKET_CONFIG = {
  url: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001',
  transports: ['websocket'],
}

export function createSocketClient() {
  return {
    connected: false,
    connect() {
      this.connected = true
      return this
    },
    disconnect() {
      this.connected = false
      return this
    },
    emit(eventName, payload) {
      return { eventName, payload, queued: true }
    },
    subscribe(eventName, callback) {
      return { eventName, callback, active: true }
    },
  }
}

export function buildSocketHooks() {
  const client = createSocketClient()

  return {
    client,
    connect() {
      client.connect()
      return client
    },
    disconnect() {
      client.disconnect()
      return client
    },
    joinRoom(roomId) {
      return client.emit('join-room', { roomId })
    },
    sendMessage(roomId, message) {
      return client.emit('send-message', { roomId, message })
    },
    subscribeToRoom(roomId, handler) {
      return client.subscribe(`room:${roomId}`, handler)
    },
    SOCKET_CONFIG,
  }
}

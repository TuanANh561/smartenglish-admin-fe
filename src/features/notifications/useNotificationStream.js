import { useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { ENDPOINTS } from '@/lib/endpoints'

/**
 * Phát âm thanh thông báo êm dịu sử dụng Web Audio API (không cần file âm thanh ngoài)
 */
function playNotificationChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return

    const ctx = new AudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
    const now = ctx.currentTime

    // Tạo nốt 1 (880Hz - A5)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(880, now)
    gain1.gain.setValueAtTime(0.12, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.35)

    // Tạo nốt 2 (1318.5Hz - E6, chime ấm áp hơn sau 80ms)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(1318.5, now + 0.08)
    gain2.gain.setValueAtTime(0.15, now + 0.08)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.08)
    osc2.stop(now + 0.6)
  } catch (err) {
    // Trình duyệt có thể chặn autoplay âm thanh trước khi user tương tác
    console.debug('Web Audio play failed (policy):', err)
  }
}

/**
 * Hiển thị Native Desktop Notification nếu được trình duyệt cho phép
 */
function showDesktopNotification(title, body, onClick) {
  if (typeof window === 'undefined' || !('Notification' in window)) return

  if (Notification.permission === 'granted') {
    try {
      const notif = new Notification(title || 'SmartEnglish AI', {
        body: body || 'Bạn có thông báo mới.',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      })
      if (typeof onClick === 'function') {
        notif.onclick = () => {
          window.focus()
          onClick()
          notif.close()
        }
      }
    } catch (e) {
      console.debug('Desktop notification trigger error:', e)
    }
  }
}

/**
 * Hook quản lý kết nối Server-Sent Events (SSE) theo thời gian thực cho Admin / Giáo viên
 */
export function useNotificationStream({ onNotification, soundEnabled = true, desktopEnabled = true } = {}) {
  const user = useAuthStore((s) => s.user)
  const token = typeof window !== 'undefined' ? localStorage.getItem('se_admin_token') : null
  const eventSourceRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const retryCountRef = useRef(0)

  const requestDesktopPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
    try {
      const permission = await Notification.requestPermission()
      return permission
    } catch {
      return 'denied'
    }
  }, [])

  const connectStream = useCallback(() => {
    const rawToken = typeof window !== 'undefined' ? localStorage.getItem('se_admin_token') : null
    const targetUserId = user?.id || 1

    // Đóng kết nối cũ nếu có
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || ''
    const streamUrl = `${apiBaseUrl.replace(/\/+$/, '')}${ENDPOINTS.notifications.stream}?token=${encodeURIComponent(rawToken || '')}&userId=${targetUserId}`

    try {
      const es = new EventSource(streamUrl)
      eventSourceRef.current = es

      es.addEventListener('CONNECTED', (event) => {
        retryCountRef.current = 0
        console.info('🟢 SSE Notification Stream đã kết nối thành công:', event.data)
      })

      es.addEventListener('NOTIFICATION', (event) => {
        try {
          const data = JSON.parse(event.data)

          // 1. Phát âm thanh nếu được bật
          if (soundEnabled) {
            playNotificationChime()
          }

          // 2. Hiển thị Desktop Notification nếu được bật
          if (desktopEnabled) {
            showDesktopNotification(data.title, data.body || data.message, () => {
              if (data.targetLink) {
                window.location.href = data.targetLink
              }
            })
          }

          // 3. Gọi callback cập nhật State trong UI
          if (typeof onNotification === 'function') {
            onNotification(data)
          }
        } catch (e) {
          console.error('Lỗi phân tích dữ liệu SSE NOTIFICATION:', e)
        }
      })

      es.onerror = () => {
        es.close()
        eventSourceRef.current = null

        // Tự động kết nối lại theo exponential backoff (tối đa 30s)
        const delay = Math.min(3000 * Math.pow(1.5, retryCountRef.current), 30000)
        retryCountRef.current += 1
        console.warn(`Mất kết nối SSE Notification. Thử lại sau ${Math.round(delay / 1000)}s...`)

        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = setTimeout(() => {
          connectStream()
        }, delay)
      }
    } catch (err) {
      console.warn('Không thể khởi tạo EventSource SSE:', err)
    }
  }, [token, user, soundEnabled, desktopEnabled, onNotification])

  useEffect(() => {
    connectStream()

    return () => {
      clearTimeout(reconnectTimeoutRef.current)
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [connectStream])

  return {
    requestDesktopPermission,
    isConnected: Boolean(eventSourceRef.current && eventSourceRef.current.readyState === EventSource.OPEN),
  }
}

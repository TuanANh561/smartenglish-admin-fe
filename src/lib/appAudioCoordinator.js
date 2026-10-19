/**
 * appAudioCoordinator.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Trung tâm điều phối và ngắt âm thanh toàn cục (Global App Audio Coordinator)
 * 
 * Đảm bảo: Khi màn hình bị đổi (chuyển route URL, đổi tab học liệu, chuyển trang
 * phân trang, đóng/mở drawer hoặc modal, rời tab trình duyệt...) thì TOÀN BỘ
 * âm thanh (HTML5 Audio, Web Speech API speechSynthesis, TTS hai tầng) đều được
 * tắt ngay lập tức, tránh hiện tượng âm thanh cũ tiếp tục phát đè lên màn hình mới.
 * ─────────────────────────────────────────────────────────────────────────────
 */

let activeOwner = null
let activeStop = null

// Danh sách các callback dọn dẹp âm thanh đăng ký từ các module
const audioCleanupHandlers = new Set()

// Danh sách các đối tượng HTMLAudioElement đang hoạt động
const activeAudioElements = new Set()

/**
 * Đăng ký một HTMLAudioElement để theo dõi và ngắt tự động khi đổi màn hình
 */
export function registerAudioElement(audio) {
  if (!audio) return () => {}
  activeAudioElements.add(audio)
  const cleanup = () => {
    activeAudioElements.delete(audio)
  }
  audio.addEventListener('ended', cleanup, { once: true })
  audio.addEventListener('pause', cleanup)
  audio.addEventListener('error', cleanup, { once: true })
  return cleanup
}

/**
 * Đăng ký hàm ngắt âm thanh từ các component hoặc module cụ thể
 */
export function registerAudioStopHandler(handler) {
  if (typeof handler === 'function') {
    audioCleanupHandlers.add(handler)
    return () => {
      audioCleanupHandlers.delete(handler)
    }
  }
  return () => {}
}

export function claimAppAudio(owner, stop) {
  if (activeOwner !== owner && activeStop) {
    try {
      activeStop()
    } catch {
      // Cleanup is best-effort.
    }
  }
  activeOwner = owner
  activeStop = stop
}

export function releaseAppAudio(owner) {
  if (activeOwner === owner) {
    activeOwner = null
    activeStop = null
  }
}

/**
 * Dừng ngay lập tức toàn bộ âm thanh đang phát trong toàn bộ hệ thống
 */
export function stopAllAppAudio() {
  const stop = activeStop
  activeOwner = null
  activeStop = null

  // 1. Dừng handler của active owner hiện tại
  try {
    stop?.()
  } catch {
    // Cleanup is best-effort.
  }

  // 2. Chạy tất cả handler dọn dẹp đã đăng ký từ các component/module
  audioCleanupHandlers.forEach((handler) => {
    try {
      handler()
    } catch {
      // Ignore
    }
  })

  // 3. Dừng và ngắt toàn bộ HTMLAudioElement đang phát
  activeAudioElements.forEach((audio) => {
    try {
      audio.pause()
      audio.currentTime = 0
      audio.removeAttribute('src')
      audio.load?.()
    } catch {
      // Ignore
    }
  })
  activeAudioElements.clear()

  // 4. Tìm và dừng mọi thẻ <audio> có trong DOM
  if (typeof document !== 'undefined') {
    try {
      document.querySelectorAll('audio').forEach((el) => {
        try {
          el.pause()
          el.currentTime = 0
        } catch {
          // Ignore
        }
      })
    } catch {
      // Ignore
    }
  }

  // 5. Huỷ mọi giọng đọc Web Speech API đang phát hoặc đang xếp hàng
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel()
    } catch {
      // Cleanup is best-effort.
    }
  }
}

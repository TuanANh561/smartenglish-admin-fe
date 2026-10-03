/**
 * twoLayerAudio.js
 * ─────────────────────────────────────────────────────────────────────────────
 * SmartEnglish AI - Bộ Phát Âm Thanh 2 Tầng Đa Giọng Đọc (Multi-Speaker 2-Layer Audio Engine)
 * 
 * • Tầng 1 (Primary): Phát link Audio MP3/OGG từ Backend (audioUrl)
 * • Tầng 2 (Fallback / Direct): Tự động chuyển sang Web Speech API (window.speechSynthesis)
 *   với cơ chế nhận diện đối thoại thông minh:
 *   + Đối thoại nhiều người (Part 3): Phân vai Nam đọc giọng Nam trầm, Nữ đọc giọng Nữ trong trẻo.
 *   + Bài đọc đơn / Thuyết trình / Thông báo (Part 1, 2, 4): Giữ nguyên 1 giọng đọc đồng nhất, tự nhiên.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Cấu hình phát âm thanh: Tạm thời khóa Tầng 1 (URL Audio ngoài do link chưa chính xác)
// Chỉ sử dụng Tầng 2 (Web Speech API) đọc trực tiếp từ script/nội dung câu hỏi
export const ENABLE_LAYER_1 = false

let activeAudioElement = null
let activeSpeechController = null

/**
 * Phân tích kịch bản văn bản thành các phân đoạn (segments) kèm vai đọc và giới tính
 * Hỗ trợ các định dạng kịch bản chuẩn TOEIC:
 * - "Man: ... \nWoman: ..."
 * - "(Man): ... \n(Woman): ..."
 * - "[Man]: ... \n[Woman]: ..."
 * - "M-Cn: ... \nW-Br: ..."
 * - "M: ... \nW: ..."
 * - "Speaker 1: ... \nSpeaker 2: ..."
 * 
 * @param {string} text
 * @returns {Array<{ speaker: string, gender: 'male'|'female'|'single', text: string }>}
 */
function cleanSpokenText(t) {
  if (!t) return ''
  return t
    // Xóa nhãn người nói ở đầu câu như Woman:, Man:, [Woman], (Man), Elena:, Dr. Vance:
    .replace(/^[\(\[]?\s*(?:Woman(?:\s*\d+)?|Man(?:\s*\d+)?|Female(?:\s*\d+)?|Male(?:\s*\d+)?|Speaker\s*\d+|Narrator|Announcer|W|M|W-[A-Za-z]+|M-[A-Za-z]+|(?:(?:Mr|Ms|Mrs|Dr)\.?\s+)?[A-Z][a-z]{1,15})\s*[\)\]]?\s*[:：\-–—]?\s*/i, '')
    // Xóa các nhãn trong ngoặc còn sót lại nếu có
    .replace(/[\(\[]\s*(?:Man(?:\s*\d+)?|Woman(?:\s*\d+)?|Male(?:\s*\d+)?|Female(?:\s*\d+)?|Narrator|Announcer|Speaker\s*\d+)\s*[\)\]]\s*[:：]?/gi, '')
    .trim()
}

function inferGender(speaker, index) {
  if (!speaker) return 'single'
  const low = speaker.toLowerCase().trim()
  const femaleKeywords = [
    'woman', 'female', 'girl', 'lady', 'she', 'her', 'mrs', 'ms', 'miss',
    'sarah', 'jenny', 'karen', 'brenda', 'patel', 'maya', 'sandra', 'mary',
    'linda', 'barbara', 'elizabeth', 'jennifer', 'maria', 'susan', 'margaret',
    'dorothy', 'lisa', 'nancy', 'betty', 'helen', 'donna', 'carol', 'ruth',
    'sharon', 'michelle', 'laura', 'emily', 'anna', 'rebecca', 'sophia', 'elena',
  ]
  const maleKeywords = [
    'man', 'male', 'boy', 'gentleman', 'he', 'him', 'mr', 'david', 'john',
    'mark', 'tom', 'alex', 'ken', 'carlos', 'arthur', 'greg', 'vance',
    'robert', 'michael', 'william', 'james', 'richard', 'charles', 'joseph',
    'thomas', 'christopher', 'daniel', 'paul', 'donald', 'george', 'brian',
    'kevin', 'jason', 'matthew', 'gary', 'timothy', 'frank', 'eric', 'stephen',
    'andrew', 'raymond', 'gregory', 'joshua', 'peter', 'ryan', 'roger', 'jack',
  ]

  if (low === 'w' || low.startsWith('w-') || femaleKeywords.some((k) => low.includes(k))) return 'female'
  if (low === 'm' || low.startsWith('m-') || maleKeywords.some((k) => low.includes(k))) return 'male'

  // Đối thoại luân phiên mặc định (Lượt chẵn: Nữ, Lượt lẻ: Nam hoặc ngược lại)
  return index % 2 === 0 ? 'female' : 'male'
}

export function parseDialogueSegments(text) {
  if (!text || typeof text !== 'string') return []
  const normalized = text.replace(/\\n/g, '\n').replace(/\r/g, '').trim()
  if (!normalized) return []

  // Regex nhận diện mọi định dạng nhãn người nói (kể cả viết liền trên 1 dòng hoặc xuống dòng):
  // Woman: ... Man: ... / (Woman) ... (Man) ... / [Woman]: ... / W: ... M: ... / Dr. Vance: ... Elena: ...
  const inlineSpeakerPattern = /(?:^|[\r\n]+|\s+)([\(\[]?\s*(?:Woman(?:\s*\d+)?|Man(?:\s*\d+)?|Female(?:\s*\d+)?|Male(?:\s*\d+)?|Speaker\s*\d+|Narrator|Announcer|W|M|W-[A-Za-z]+|M-[A-Za-z]+|(?:(?:Mr|Ms|Mrs|Dr)\.?\s+)?[A-Z][a-z]{1,15})\s*[\)\]]?\s*[:：]|\([WM]\)|\(Woman\)|\(Man\)|\(Female\)|\(Male\)|\[[WM]\]|\[Woman\]|\[Man\])\s*/gi

  // Tách các nhãn người nói nằm liền dòng thành các dòng riêng biệt
  const formattedWithNewlines = normalized.replace(inlineSpeakerPattern, (match, tag, offset) => {
    return (offset === 0 ? '' : '\n') + tag.trim() + ' '
  })

  const lines = formattedWithNewlines.split('\n')
  const segments = []
  let currentSpeaker = null
  let currentGender = 'single'
  let currentText = ''

  const tagLineRegex = /^[\(\[]?\s*([A-Za-z0-9\s\.\-]{1,24})\s*[\)\]]?\s*[:：]?\s*(.*)$/

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine) continue

    const match = trimmedLine.match(tagLineRegex)
    if (match && match[1] && (
      inlineSpeakerPattern.test(trimmedLine) ||
      match[1].toLowerCase().includes('man') ||
      match[1].toLowerCase().includes('woman') ||
      match[1].toLowerCase().includes('speaker') ||
      match[1].toLowerCase() === 'm' ||
      match[1].toLowerCase() === 'w'
    )) {
      if (currentSpeaker && currentText.trim()) {
        const spoken = cleanSpokenText(currentText)
        if (spoken) segments.push({ speaker: currentSpeaker, gender: currentGender, text: spoken })
      }
      currentSpeaker = match[1].replace(/[\(\[\]\)]/g, '').trim()
      currentGender = inferGender(currentSpeaker, segments.length)
      currentText = match[2] || ''
    } else {
      if (currentSpeaker) {
        currentText += ' ' + trimmedLine
      } else {
        currentText += (currentText ? ' ' : '') + trimmedLine
      }
    }
  }

  if (currentSpeaker && currentText.trim()) {
    const spoken = cleanSpokenText(currentText)
    if (spoken) segments.push({ speaker: currentSpeaker, gender: currentGender, text: spoken })
  } else if (!segments.length && currentText.trim()) {
    const spoken = cleanSpokenText(currentText)
    if (spoken) segments.push({ speaker: 'Narrator', gender: 'single', text: spoken })
  }

  // Nếu kịch bản không chứa đối thoại nhiều người, trả về 1 phân đoạn duy nhất
  return segments.length ? segments : [{ speaker: 'Narrator', gender: 'single', text: cleanSpokenText(normalized) }]
}

/**
 * Lựa chọn giọng nói và cao độ (pitch) phù hợp theo giới tính:
 * - male: Giọng nam trầm, dứt khoát (David, Guy, Mark, George...) hoặc pitch trầm (0.80)
 * - female: Giọng nữ trong trẻo, tự nhiên (Zira, Jenny, Aria, Samantha...) hoặc pitch cao (1.20)
 * - single: 1 giọng đọc đồng nhất, tự nhiên từ đầu đến cuối
 * 
 * @param {SpeechSynthesisVoice[]} voices
 * @param {'male'|'female'|'single'} gender
 * @param {string} lang
 * @returns {{ voice: SpeechSynthesisVoice | null, pitch: number }}
 */
export function resolveVoiceAndPitch(voices, gender, lang = 'en-US') {
  const enVoices = voices.filter(
    (v) => v.lang === lang || v.lang.startsWith(lang.slice(0, 2)) || v.lang.startsWith('en')
  )
  const pool = enVoices.length ? enVoices : voices

  const maleVoice = pool.find((v) => {
    const n = v.name.toLowerCase()
    return (
      n.includes('david') ||
      n.includes('guy') ||
      n.includes('mark') ||
      n.includes('george') ||
      n.includes('james') ||
      n.includes('male') ||
      n.includes('ryan') ||
      n.includes('christopher') ||
      n.includes('eric') ||
      n.includes('daniel') ||
      n.includes('tom') ||
      n.includes('alex') ||
      n.includes('fred') ||
      n.includes('richard') ||
      (n.includes('natural') && (n.includes('guy') || n.includes('mark') || n.includes('male')))
    )
  })

  const femaleVoice = pool.find((v) => {
    const n = v.name.toLowerCase()
    return (
      n.includes('zira') ||
      n.includes('jenny') ||
      n.includes('aria') ||
      n.includes('samantha') ||
      n.includes('female') ||
      n.includes('susan') ||
      n.includes('katherine') ||
      n.includes('cynthia') ||
      n.includes('victoria') ||
      n.includes('karen') ||
      n.includes('moira') ||
      n.includes('fiona') ||
      n.includes('hazel') ||
      n.includes('clara') ||
      n.includes('amy') ||
      n.includes('emma') ||
      n.includes('serena') ||
      (n.includes('google') && !n.includes('male'))
    )
  })

  if (gender === 'male') {
    // Ưu tiên chọn giọng nam khác giọng nữ
    const chosenMale = maleVoice || pool.find((v) => v !== femaleVoice) || pool[0] || null
    return {
      voice: chosenMale,
      pitch: maleVoice ? 0.90 : 0.78, // Nếu chỉ có 1 giọng dùng chung, hạ pitch xuống 0.78 để tạo âm trầm nam rõ rệt
    }
  }

  if (gender === 'female') {
    // Ưu tiên chọn giọng nữ khác giọng nam
    const chosenFemale = femaleVoice || pool.find((v) => v !== maleVoice) || pool[0] || null
    return {
      voice: chosenFemale,
      pitch: femaleVoice ? 1.12 : 1.25, // Nếu chỉ có 1 giọng dùng chung, tăng pitch lên 1.25 để tạo âm bổng nữ rõ rệt
    }
  }

  // Giọng đơn / Người dẫn chuyện (Single / Narrator)
  const defaultVoice = pool.find((v) => {
    const n = v.name.toLowerCase()
    return (
      n.includes('natural') ||
      n.includes('google') ||
      n.includes('david') ||
      n.includes('samantha') ||
      n.includes('jenny')
    )
  }) || pool[0] || null

  return {
    voice: defaultVoice,
    pitch: 1.0,
  }
}

/**
 * Dừng toàn bộ âm thanh đang phát ở cả 2 tầng (Audio HTML5 & Web Speech)
 */
export function stopAllTwoLayerAudio() {
  if (activeSpeechController) {
    try {
      activeSpeechController.abort()
    } catch (_) {}
    activeSpeechController = null
  }

  // Dừng Tầng 1
  if (activeAudioElement) {
    try {
      activeAudioElement.pause()
      activeAudioElement.currentTime = 0
      activeAudioElement.src = ''
    } catch (_) {}
    activeAudioElement = null
  }

  // Dừng Tầng 2
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel()
    } catch (_) {}
  }
}

/**
 * Phát âm thanh với cơ chế 2 tầng tự động fallback
 * 
 * @param {Object} params
 * @param {string} params.audioUrl - Đường dẫn file audio từ Backend (Tầng 1)
 * @param {string} params.fallbackText - Nội dung văn bản đọc bằng Speech API (Tầng 2)
 * @param {string} [params.lang='en-US'] - Ngôn ngữ phát giọng
 * @param {number} [params.rate=0.9] - Tốc độ đọc (mặc định 0.9 chuẩn TOEIC)
 * @param {Function} [params.onStart] - Callback khi bắt đầu phát (layer: 'audio' | 'speech')
 * @param {Function} [params.onEnd] - Callback khi kết thúc phát
 * @param {Function} [params.onError] - Callback khi cả 2 tầng đều gặp sự cố
 * @returns {Function} cleanup / stop function
 */
export function playTwoLayerAudio({
  audioUrl,
  fallbackText,
  lang = 'en-US',
  rate = 0.9,
  onStart,
  onEnd,
  onError,
}) {
  stopAllTwoLayerAudio()

  const cleanUrl = typeof audioUrl === 'string' ? audioUrl.trim() : ''
  const cleanText = typeof fallbackText === 'string' ? fallbackText.trim() : ''

  // ─── TẦNG 2: Web Speech API Fallback (Đa Giọng Thông Minh) ───────────────────
  const triggerSpeechFallback = (reason) => {
    if (reason) {
      console.warn(`[2-Layer Audio] Chuyển sang Tầng 2 (Web Speech API) do: ${reason}`)
    }

    if (!cleanText) {
      console.warn('[2-Layer Audio] Tầng 2 không có nội dung văn bản (fallbackText) để đọc.')
      onEnd?.()
      return
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.error('[2-Layer Audio] Trình duyệt không hỗ trợ Web Speech API.')
      onError?.(new Error('Web Speech API is not supported in this browser'))
      onEnd?.()
      return
    }

    try {
      window.speechSynthesis.cancel()

      const segments = parseDialogueSegments(cleanText)
      if (!segments.length) {
        onEnd?.()
        return
      }

      let isAborted = false
      let timerId = null

      activeSpeechController = {
        abort: () => {
          isAborted = true
          if (timerId) clearTimeout(timerId)
          try {
            window.speechSynthesis.cancel()
          } catch (_) {}
        },
      }

      const speakSegment = (index) => {
        if (isAborted) return
        if (index >= segments.length) {
          activeSpeechController = null
          onEnd?.()
          return
        }

        const voices = window.speechSynthesis.getVoices() || []
        const seg = segments[index]
        const utterance = new SpeechSynthesisUtterance(seg.text)
        utterance.lang = lang
        utterance.rate = rate

        const { voice, pitch } = resolveVoiceAndPitch(voices, seg.gender, lang)
        if (voice) {
          utterance.voice = voice
        }
        utterance.pitch = pitch

        utterance.onstart = () => {
          if (index === 0) {
            onStart?.('speech')
          }
        }

        utterance.onend = () => {
          if (isAborted) return
          if (index + 1 < segments.length) {
            // Tạm dừng 280ms giữa các lượt thoại của nam và nữ để tạo nhịp tự nhiên như đàm thoại thật
            timerId = setTimeout(() => {
              speakSegment(index + 1)
            }, 280)
          } else {
            activeSpeechController = null
            onEnd?.()
          }
        }

        utterance.onerror = (e) => {
          if (isAborted) return
          console.warn(`[2-Layer Audio] Lỗi segment ${index}:`, e)
          if (index + 1 < segments.length) {
            speakSegment(index + 1)
          } else {
            activeSpeechController = null
            onEnd?.()
          }
        }

        window.speechSynthesis.speak(utterance)
      }

      speakSegment(0)
    } catch (err) {
      console.error('[2-Layer Audio] Lỗi khi kích hoạt Web Speech API:', err)
      activeSpeechController = null
      onEnd?.()
      onError?.(err)
    }
  }

  // ─── TẦNG 1: Audio URL từ Backend (Tạm khóa nếu ENABLE_LAYER_1 === false) ──
  if (ENABLE_LAYER_1 && cleanUrl) {
    try {
      const audio = new Audio()
      activeAudioElement = audio
      audio.preload = 'auto'

      let hasFallenBack = false
      const handleFallbackOnce = (reason) => {
        if (!hasFallenBack) {
          hasFallenBack = true
          if (activeAudioElement === audio) {
            activeAudioElement = null
          }
          triggerSpeechFallback(reason)
        }
      }

      audio.onplay = () => {
        onStart?.('audio')
      }

      audio.onended = () => {
        if (activeAudioElement === audio) {
          activeAudioElement = null
        }
        onEnd?.()
      }

      audio.onerror = () => {
        handleFallbackOnce('Lỗi tải file Audio HTML5 từ URL')
      }

      audio.src = cleanUrl
      const playPromise = audio.play()

      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          handleFallbackOnce(`Trình duyệt chặn autoplay hoặc URL hỏng: ${err.message}`)
        })
      }

      return () => {
        try {
          audio.pause()
          audio.currentTime = 0
        } catch (_) {}
        if (activeAudioElement === audio) {
          activeAudioElement = null
        }
      }
    } catch (err) {
      triggerSpeechFallback(`Khởi tạo Audio element thất bại: ${err.message}`)
    }
  } else {
    // Tầng 1 bị khóa hoặc không có URL -> Tự động chuyển thẳng sang Tầng 2 Web Speech API
    triggerSpeechFallback(!ENABLE_LAYER_1 ? 'Tầng 1 tạm thời bị khóa theo cấu hình - phát trực tiếp bằng Tầng 2 (Web Speech API)' : 'Không có link audioUrl từ Backend')
  }

  return () => {
    stopAllTwoLayerAudio()
  }
}

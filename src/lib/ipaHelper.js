// Cache key for LocalStorage
const IPA_CACHE_KEY = 'smartenglish_online_ipa_cache_v1'

// In-memory cache to speed up repeated queries in the same session
let memoryCache = {}

function loadCache() {
  if (typeof window === 'undefined') return
  try {
    const data = localStorage.getItem(IPA_CACHE_KEY)
    if (data) memoryCache = JSON.parse(data)
  } catch (e) {
    // Ignore storage errors
  }
}

function saveToCache(wordKey, result) {
  if (typeof window === 'undefined') return
  try {
    memoryCache[wordKey.toLowerCase()] = result
    localStorage.setItem(IPA_CACHE_KEY, JSON.stringify(memoryCache))
  } catch (e) {
    // Ignore storage quota
  }
}

loadCache()

// Danh mục các lỗi chính tả tiếng Anh phổ biến để tự động chuẩn hóa
export const COMMON_TYPOS = {
  aple: 'apple',
  appel: 'apple',
  compani: 'company',
  compnay: 'company',
  busines: 'business',
  bussiness: 'business',
  serendpity: 'serendipity',
  serendipiti: 'serendipity',
  necesary: 'necessary',
  neccessary: 'necessary',
  necesaryy: 'necessary',
  embarass: 'embarrass',
  embarras: 'embarrass',
  embaras: 'embarrass',
  accomodate: 'accommodate',
  acommodate: 'accommodate',
  definately: 'definitely',
  definitly: 'definitely',
  seperate: 'separate',
  separete: 'separate',
  recieve: 'receive',
  recive: 'receive',
  occured: 'occurred',
  ocured: 'occurred',
  enviroment: 'environment',
  goverment: 'government',
  schedual: 'schedule',
  skedule: 'schedule',
  beautifull: 'beautiful',
  beutiful: 'beautiful',
  pronounciation: 'pronunciation',
  pronouciation: 'pronunciation',
  grammer: 'grammar',
  gramar: 'grammar',
  knowlege: 'knowledge',
  intellegence: 'intelligence',
  lenguage: 'language',
  opertunity: 'opportunity',
  oppurtunity: 'opportunity',
  experiance: 'experience',
  practise: 'practice',
  succes: 'success',
  succsess: 'success',
}

// Bàn phím ký tự IPA quốc tế dự phòng
export const IPA_KEYBOARD_GROUPS = [
  {
    name: 'Nguyên âm ngắn & dài (Vowels)',
    symbols: ['iː', 'ɪ', 'ʊ', 'uː', 'e', 'ə', 'ɜː', 'ɔː', 'æ', 'ʌ', 'ɑː', 'ɒ'],
  },
  {
    name: 'Nguyên âm đôi (Diphthongs)',
    symbols: ['ɪə', 'eɪ', 'ʊə', 'ɔɪ', 'əʊ', 'eə', 'aɪ', 'aʊ'],
  },
  {
    name: 'Phụ âm đặc biệt (Consonants)',
    symbols: ['p', 'b', 't', 'd', 'tʃ', 'dʒ', 'k', 'ɡ', 'f', 'v', 'θ', 'ð', 's', 'z', 'ʃ', 'ʒ', 'm', 'n', 'ŋ', 'h', 'l', 'r', 'w', 'j'],
  },
  {
    name: 'Trọng âm & Ký tự (Stress & Marks)',
    symbols: ['ˈ', 'ˌ', '/', 'ː', '·'],
  },
]

let currentAudio = null

/**
 * Dừng mọi âm thanh đang phát (cả file MP3 và SpeechSynthesis)
 */
export function stopAudio() {
  dialogueStopRequested = true
  if (currentAudio) {
    try {
      currentAudio.pause()
      currentAudio.currentTime = 0
    } catch (e) {
      // Ignore
    }
    currentAudio = null
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel()
    } catch (e) {
      // Ignore
    }
  }
}

/**
 * Phát âm ra loa (Audio Player):
 * - Nếu có URL file mp3 thì phát file thu âm thật
 * - Luôn có Web Speech API (speechSynthesis) đảm bảo phát ra tiếng 100% không tốn token
 */
export function speakWord(text, audioUrl = null) {
  stopAudio()
  if (!text && !audioUrl) return

  // 1. Thử phát file audio MP3 trước nếu có
  if (audioUrl) {
    try {
      const audio = new Audio(audioUrl)
      currentAudio = audio
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Nếu trình duyệt chặn phát audio tự động hoặc link lỗi, fallback sang Web Speech
          speakWithSpeechSynthesis(text)
        })
        return
      }
    } catch (e) {
      // Fallback
    }
  }

  // 2. Dùng Web Speech API của trình duyệt
  speakWithSpeechSynthesis(text)
}

let dialogueStopRequested = false

export function parseDuration(durationStr) {
  if (!durationStr) return 35
  const parts = String(durationStr).split(':').map(Number)
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1]
  }
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  return 35
}

export function formatTime(seconds) {
  const safeSec = Math.max(0, Math.floor(seconds))
  const m = Math.floor(safeSec / 60)
  const s = safeSec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function getEnglishVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return []
  const voices = window.speechSynthesis.getVoices() || []
  return voices.filter(
    (v) =>
      v.lang &&
      (v.lang.startsWith('en') ||
        v.lang.includes('US') ||
        v.lang.includes('GB') ||
        v.lang.includes('AU'))
  )
}

export const FEMALE_VOICE_REGEX =
  /female|woman|girl|zira|samantha|karen|victoria|hazel|susan|jenny|aria|ava|emma|sonia|libby|mia|natasha|clara|stephanie|fiona|veena|moira|tessa/i
export const MALE_VOICE_REGEX =
  /male|man|boy|david|george|daniel|guy|mark|richard|ryan|brian|oliver|russell|alex\b|fred|tom\b|lee\b/i

export function parseDialogueSpeakers(text, speaker1Name = '', speaker2Name = '') {
  if (!text) return { speakers: [], turns: [] }

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  const speakers = []
  const turns = []

  const spk1Clean = (speaker1Name || '').trim().toLowerCase()
  const spk2Clean = (speaker2Name || '').trim().toLowerCase()

  lines.forEach((line, lineIndex) => {
    // Nhận diện mẫu "Alex: text" hoặc "- Alex: text" hoặc "[Alex]: text" hoặc "Alex - text"
    const match = line.match(/^[-*•]?\s*\[?([A-Za-z0-9\s]{1,25})\]?[:\-]\s*(.+)$/)

    if (match) {
      const spkName = match[1].trim()
      const spkLower = spkName.toLowerCase()
      const content = match[2].trim()

      let spkIdx = 0
      if (spk2Clean && spkLower === spk2Clean) {
        spkIdx = 1
      } else if (spk1Clean && spkLower === spk1Clean) {
        spkIdx = 0
      } else {
        let foundIdx = speakers.indexOf(spkName)
        if (foundIdx === -1) {
          speakers.push(spkName)
          foundIdx = speakers.length - 1
        }
        spkIdx = foundIdx
      }

      turns.push({ speaker: spkName, text: content, speakerIndex: spkIdx })
    } else {
      // Dòng không có tiền tố tên: tự động phân bổ luân phiên giữa 2 người nói
      const spkIdx = lineIndex % 2
      const fallbackName = spkIdx === 1 ? (speaker2Name || 'Speaker 2') : (speaker1Name || 'Speaker 1')
      turns.push({ speaker: fallbackName, text: line, speakerIndex: spkIdx })
    }
  })

  return { speakers, turns }
}

function speakWithSpeechSynthesis(text, onEnd = null) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  try {
    window.speechSynthesis.cancel()
    const clean = String(text || '').replace(/[\/\[\]]/g, '').trim()
    if (!clean) return

    const utterance = new SpeechSynthesisUtterance(clean)
    utterance.lang = 'en-US'
    utterance.rate = 0.92

    const voices = getEnglishVoices()
    const englishVoice =
      voices.find((v) => v.name.includes('Natural') || v.name.includes('Google')) ||
      voices.find((v) => v.lang.startsWith('en-US')) ||
      voices[0]
    if (englishVoice) {
      utterance.voice = englishVoice
    }

    if (onEnd) {
      utterance.onend = () => onEnd()
      utterance.onerror = () => onEnd()
    }

    window.speechSynthesis.speak(utterance)
  } catch (err) {
    console.warn('[TTS Error]:', err)
    if (onEnd) onEnd()
  }
}

export const VOICE_PERSONAS = [
  // --- Giọng Nam ---
  {
    id: 'male-baritone',
    gender: 'male',
    name: 'Nam - Trầm ấm, chững chạc (US Baritone)',
    tag: 'US · Trầm ấm',
    pitch: 0.82,
    rate: 0.92,
    matcher: /david|guy|mark|richard/i,
    lang: 'en-US',
  },
  {
    id: 'male-standard',
    gender: 'male',
    name: 'Nam - Chuẩn tự nhiên (US Standard)',
    tag: 'US · Tự nhiên',
    pitch: 0.95,
    rate: 0.96,
    matcher: /google us|natural|david/i,
    lang: 'en-US',
  },
  {
    id: 'male-energetic',
    gender: 'male',
    name: 'Nam - Trẻ trung, nhiệt huyết (US Energetic)',
    tag: 'US · Trẻ trung',
    pitch: 1.04,
    rate: 1.02,
    matcher: /george|google us|natural/i,
    lang: 'en-US',
  },
  {
    id: 'male-british',
    gender: 'male',
    name: 'Nam - Giọng Anh-Anh lịch thiệp (UK British)',
    tag: 'UK · Lịch thiệp',
    pitch: 0.92,
    rate: 0.94,
    matcher: /george|oliver|uk|gb|daniel/i,
    lang: 'en-GB',
  },
  {
    id: 'male-deep',
    gender: 'male',
    name: 'Nam - Trầm vang, phát thanh viên (Deep Bass)',
    tag: 'US · Trầm sâu',
    pitch: 0.72,
    rate: 0.88,
    matcher: /david|mark/i,
    lang: 'en-US',
  },
  {
    id: 'male-aussie',
    gender: 'male',
    name: 'Nam - Giọng Úc tự nhiên (AU Australian)',
    tag: 'AU · Thoải mái',
    pitch: 0.98,
    rate: 0.96,
    matcher: /australia|au|russell/i,
    lang: 'en-AU',
  },

  // --- Giọng Nữ ---
  {
    id: 'female-warm',
    gender: 'female',
    name: 'Nữ - Ấm áp, truyền cảm (US Warm Story)',
    tag: 'US · Truyền cảm',
    pitch: 1.18,
    rate: 0.93,
    matcher: /zira|jenny|samantha|aria|ava/i,
    lang: 'en-US',
  },
  {
    id: 'female-bright',
    gender: 'female',
    name: 'Nữ - Trong trẻo, tươi sáng (US Bright)',
    tag: 'US · Trong trẻo',
    pitch: 1.28,
    rate: 0.98,
    matcher: /samantha|victoria|google us female|zira/i,
    lang: 'en-US',
  },
  {
    id: 'female-soft',
    gender: 'female',
    name: 'Nữ - Nhẹ nhàng, thanh lịch (US Soft & Calm)',
    tag: 'US · Nhẹ nhàng',
    pitch: 1.20,
    rate: 0.90,
    matcher: /zira|karen|samantha/i,
    lang: 'en-US',
  },
  {
    id: 'female-british',
    gender: 'female',
    name: 'Nữ - Giọng Anh-Anh quý phái (UK British)',
    tag: 'UK · Thanh lịch',
    pitch: 1.16,
    rate: 0.94,
    matcher: /hazel|susan|uk|gb|serena|fiona/i,
    lang: 'en-GB',
  },
  {
    id: 'female-mature',
    gender: 'female',
    name: 'Nữ - Chuyên nghiệp, phát thanh viên (US News)',
    tag: 'US · Chuyên nghiệp',
    pitch: 1.14,
    rate: 0.96,
    matcher: /zira|google us|natural/i,
    lang: 'en-US',
  },
  {
    id: 'female-aussie',
    gender: 'female',
    name: 'Nữ - Giọng Úc năng động (AU Australian)',
    tag: 'AU · Tươi vui',
    pitch: 1.22,
    rate: 0.96,
    matcher: /australia|au|catherine|karen/i,
    lang: 'en-AU',
  },
]

export function resolveSpeakerVoice(options = {}, isSpeaker2 = false, voices = []) {
  const isFemale = isSpeaker2
    ? options.speaker2Gender === 'female'
    : options.speaker1Gender === 'female'
  const gender = isFemale ? 'female' : 'male'

  const personaId = isSpeaker2 ? options.speaker2Persona : options.speaker1Persona
  const voiceURI = isSpeaker2 ? options.speaker2VoiceURI : options.speaker1VoiceURI
  const customPitch = isSpeaker2 ? options.speaker2Pitch : options.speaker1Pitch
  const customRate = isSpeaker2 ? options.speaker2Rate : options.speaker1Rate

  const persona =
    VOICE_PERSONAS.find((p) => p.id === personaId) ||
    VOICE_PERSONAS.find((p) => p.gender === gender)

  let voice = null

  // 1. Khớp theo VoiceURI do người dùng chọn trực tiếp (nếu có)
  if (voiceURI) {
    voice = voices.find((v) => v.voiceURI === voiceURI || v.name === voiceURI)
  }

  // 2. Lọc danh sách giọng tiếng Anh theo giới tính thực tế để đảm bảo không bị lẫn lộn
  if (!voice && voices.length > 0) {
    if (gender === 'female') {
      // Tìm các giọng rõ ràng là nữ (Zira, Jenny, Samantha, Karen, Hazel, Susan, etc.)
      const femaleVoices = voices.filter((v) => FEMALE_VOICE_REGEX.test(v.name))

      if (femaleVoices.length > 0) {
        // Khớp theo matcher của persona
        if (persona?.matcher) {
          voice = femaleVoices.find((v) => persona.matcher.test(v.name))
        }
        // Khớp theo ngôn ngữ accent (ví dụ en-GB, en-AU, en-US)
        if (!voice && persona?.lang) {
          voice = femaleVoices.find(
            (v) =>
              v.lang &&
              v.lang.toLowerCase().replace('_', '-').startsWith(persona.lang.toLowerCase().slice(0, 5))
          )
        }
        // Fallback: chọn giọng nữ đầu tiên trong danh sách giọng nữ
        if (!voice) {
          voice = femaleVoices[0]
        }
      } else {
        // Nếu không có giọng nào ghi rõ nữ trong tên, loại trừ các giọng chắc chắn là nam
        const nonMaleVoices = voices.filter((v) => !MALE_VOICE_REGEX.test(v.name))
        if (nonMaleVoices.length > 0) {
          voice =
            nonMaleVoices.find((v) => persona?.matcher && persona.matcher.test(v.name)) ||
            nonMaleVoices[0]
        }
      }
    } else {
      // Giọng Nam (David, Mark, George, Daniel, Guy, etc.)
      const maleVoices = voices.filter((v) => MALE_VOICE_REGEX.test(v.name))

      if (maleVoices.length > 0) {
        if (persona?.matcher) {
          voice = maleVoices.find((v) => persona.matcher.test(v.name))
        }
        if (!voice && persona?.lang) {
          voice = maleVoices.find(
            (v) =>
              v.lang &&
              v.lang.toLowerCase().replace('_', '-').startsWith(persona.lang.toLowerCase().slice(0, 5))
          )
        }
        if (!voice) {
          voice = maleVoices[0]
        }
      } else {
        const nonFemaleVoices = voices.filter((v) => !FEMALE_VOICE_REGEX.test(v.name))
        if (nonFemaleVoices.length > 0) {
          voice = nonFemaleVoices[0]
        }
      }
    }
  }

  // 3. Fallback cuối cùng
  if (!voice && voices.length > 0) {
    if (gender === 'female') {
      voice = voices.find((v) => FEMALE_VOICE_REGEX.test(v.name)) || voices[1] || voices[0]
    } else {
      voice = voices.find((v) => MALE_VOICE_REGEX.test(v.name)) || voices[0]
    }
  }

  // 4. Cân chỉnh Cao độ (Pitch) & Tốc độ (Rate):
  let pitch =
    customPitch !== undefined && customPitch !== null && customPitch !== ''
      ? Number(customPitch)
      : persona
      ? persona.pitch
      : gender === 'female'
      ? 1.2
      : 0.92

  // Đảm bảo giọng Nữ luôn có cao độ thanh thoát (ít nhất 1.15x) để tách biệt rõ rệt với giọng Nam
  if (gender === 'female' && pitch < 1.12) {
    pitch = 1.18
  }
  if (gender === 'male' && pitch > 1.05) {
    pitch = 0.95
  }

  const rate =
    customRate !== undefined && customRate !== null && customRate !== ''
      ? Number(customRate)
      : persona
      ? persona.rate
      : 0.95

  const lang = (persona && persona.lang) || (voice && voice.lang) || 'en-US'

  return { voice, pitch, rate, lang, gender }
}

/**
 * Xác định chất giọng Người dẫn chuyện (Narrator) đọc mở bài (Tiêu đề + Mô tả ngắn)
 * Đảm bảo sử dụng chất giọng KHÁC BIỆT hoàn toàn so với các nhân vật đối thoại
 */
export function resolveNarratorVoice(options = {}, voices = [], speaker1Resolved = null, speaker2Resolved = null) {
  const spk1URI = speaker1Resolved?.voice?.voiceURI || ''
  const spk2URI = speaker2Resolved?.voice?.voiceURI || ''

  // 1. Tìm các giọng khả dụng chưa bị gán cho Người nói 1 và Người nói 2
  const distinctVoices = voices.filter((v) => v.voiceURI !== spk1URI && v.voiceURI !== spk2URI)

  let narratorVoice = null

  if (distinctVoices.length > 0) {
    // Ưu tiên giọng truyền thanh viên / BBC / UK hoặc giọng Natural chuyên nghiệp
    narratorVoice =
      distinctVoices.find((v) => /natural|google uk|george|hazel|susan|aria|samantha/i.test(v.name)) ||
      distinctVoices.find((v) => /female|zira|karen|victoria/i.test(v.name)) ||
      distinctVoices[0]
  }

  // 2. Nếu máy chỉ có 1-2 giọng cài sẵn, chọn giọng khác với Người nói 1
  if (!narratorVoice && voices.length > 0) {
    narratorVoice = voices.find((v) => v.voiceURI !== spk1URI) || voices[0]
  }

  return {
    voice: narratorVoice,
    pitch: 1.05, // Cao độ trang trọng, chuẩn phát thanh viên dẫn chuyện
    rate: 0.90,  // Tốc độ vừa phải, rõ ràng, phong cách giới thiệu bài học
    lang: narratorVoice?.lang || 'en-US',
  }
}

/**
 * Phát thử 1 câu ngắn cho từng nhân vật độc lập
 */
export function speakSingleVoiceSample(text, config = {}, onEnd = null) {
  stopAudio()
  dialogueStopRequested = false

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd()
    return
  }

  const voices = getEnglishVoices()
  const resolved = resolveSpeakerVoice(config, false, voices)

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = resolved.lang || 'en-US'
  utterance.pitch = resolved.pitch
  utterance.rate = resolved.rate
  if (resolved.voice) {
    utterance.voice = resolved.voice
  }

  utterance.onend = () => {
    if (onEnd) onEnd()
  }
  utterance.onerror = () => {
    if (onEnd) onEnd()
  }

  window.speechSynthesis.speak(utterance)
}

/**
 * Phát đoạn hội thoại thông minh hỗ trợ người dẫn đọc tiêu đề + mô tả và chuyển đổi giọng đọc đa nhân vật
 */
export function speakDialogue(dialogueText, options = {}, onEnd = null) {
  stopAudio()
  dialogueStopRequested = false

  if (!dialogueText && !options.intro) {
    if (onEnd) onEnd()
    return
  }

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd()
    return
  }

  const voices = getEnglishVoices()
  let allTurns = []

  // 1. Phần mở đầu (Bắt buộc đọc cả Tiêu đề + Mô tả ngắn) -> Người dẫn chuyện (Narrator) đọc trước
  if (options.intro && String(options.intro).trim()) {
    allTurns.push({
      speaker: 'Narrator',
      text: String(options.intro).trim(),
      isIntro: true,
      speakerIndex: -1,
    })
  }

  // 2. Phân tích các câu thoại của nhân vật trong bản chép lời
  if (dialogueText && dialogueText.trim()) {
    const { turns } = parseDialogueSpeakers(
      dialogueText,
      options.speaker1Name || 'Alex',
      options.speaker2Name || 'Sarah'
    )
    allTurns = allTurns.concat(turns)
  }

  if (allTurns.length === 0) {
    if (onEnd) onEnd()
    return
  }

  const isSingleMode = options.mode === 'single'
  const speaker1Resolved = resolveSpeakerVoice(options, false, voices)
  const speaker2Resolved = resolveSpeakerVoice(options, true, voices)
  // Giọng Người dẫn chuyện riêng biệt khác với cả 2 nhân vật
  const narratorResolved = resolveNarratorVoice(options, voices, speaker1Resolved, speaker2Resolved)

  let currentTurnIndex = 0

  function playNextTurn() {
    if (dialogueStopRequested || currentTurnIndex >= allTurns.length) {
      if (onEnd) onEnd()
      return
    }

    const currentTurn = allTurns[currentTurnIndex]
    const utterance = new SpeechSynthesisUtterance(currentTurn.text)

    // Xác định cấu hình giọng cho turn hiện tại:
    let resolvedConfig = speaker1Resolved

    if (currentTurn.isIntro) {
      // Intro (Tiêu đề + Mô tả ngắn): Đọc bởi Người dẫn chuyện (Narrator) với giọng riêng biệt
      resolvedConfig = narratorResolved
    } else if (!isSingleMode && currentTurn.speakerIndex % 2 === 1) {
      // Đối thoại: Speaker 2 (Người nói B - Nữ nếu chọn nữ)
      resolvedConfig = speaker2Resolved
    } else {
      // Độc thoại hoặc Speaker 1 (Người nói A - Nam nếu chọn nam)
      resolvedConfig = speaker1Resolved
    }

    utterance.lang = resolvedConfig.lang || 'en-US'
    utterance.pitch = resolvedConfig.pitch
    utterance.rate = resolvedConfig.rate
    if (resolvedConfig.voice) {
      utterance.voice = resolvedConfig.voice
    }

    utterance.onend = () => {
      currentTurnIndex += 1
      playNextTurn()
    }

    utterance.onerror = (e) => {
      console.warn('[Dialogue Speech Error]:', e)
      currentTurnIndex += 1
      playNextTurn()
    }

    window.speechSynthesis.speak(utterance)
  }

  playNextTurn()
}

/**
 * 1. Nguồn trực tuyến: Free Dictionary API (api.dictionaryapi.dev)
 */
async function fetchFromFreeDictionary(word) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3500)

    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    clearTimeout(timeoutId)

    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        const entry = data[0]
        let ipaText = entry.phonetic
        let audioUrl = null

        if (Array.isArray(entry.phonetics)) {
          for (const p of entry.phonetics) {
            if (!ipaText && p.text && p.text.trim()) {
              ipaText = p.text
            }
            if (!audioUrl && p.audio && p.audio.trim()) {
              audioUrl = p.audio
            }
          }
        }

        if (ipaText) {
          const formatted = ipaText.startsWith('/')
            ? ipaText
            : `/${ipaText.replace(/[\/\[\]]/g, '')}/`
          return {
            word: entry.word || word,
            ipa: formatted,
            audioUrl: audioUrl || null,
          }
        }
      }
    }
  } catch (e) {
    // Network or timeout
  }
  return null
}

/**
 * 2. Nguồn trực tuyến: Datamuse Lexical API (api.datamuse.com - 500,000+ từ tiếng Anh)
 */
async function fetchFromDatamuse(word) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const res = await fetch(
      `https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&md=r&ipa=1&max=1`,
      { signal: controller.signal }
    )
    clearTimeout(timeoutId)

    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0]
        const ipaTag = item.tags?.find((t) => t.startsWith('ipa_pron:'))
        if (ipaTag) {
          const rawIpa = ipaTag.replace('ipa_pron:', '').trim()
          return {
            word: item.word || word,
            ipa: `/${rawIpa}/`,
            audioUrl: null,
          }
        }
      }
    }
  } catch (e) {
    // Network or timeout
  }
  return null
}

/**
 * Tra cứu phiên âm IPA hoàn toàn từ CÁC TỪ ĐIỂN TRỰC TUYẾN TRÊN MẠNG (ONLINE)
 * Không hardcode danh sách từ thủ công trong code!
 * 
 * Luồng:
 * 1. Kiểm tra Cache LocalStorage (đã tra từ trước thì lấy ra ngay)
 * 2. Chuẩn hóa lỗi chính tả nếu có (COMMON_TYPOS)
 * 3. Tra cứu trực tuyến qua Free Dictionary API (lấy cả IPA và MP3 thu âm bản xứ)
 * 4. Tra cứu trực tuyến qua Datamuse API (ngân hàng 500,000+ từ tiếng Anh)
 * 5. Lưu vào Cache để tái sử dụng
 */
export async function generateIpaWithSpellCheck(rawWord) {
  const cleanInput = (rawWord || '').trim()
  if (!cleanInput) {
    return { correctedWord: '', originalWord: '', ipa: '', isCorrected: false }
  }

  const lower = cleanInput.toLowerCase()

  // 1. Kiểm tra Cache LocalStorage đã lưu trước đó chưa
  if (memoryCache[lower]) {
    const cached = memoryCache[lower]
    return {
      ...cached,
      originalWord: cleanInput,
    }
  }

  // 2. Kiểm tra sửa lỗi chính tả
  let correctedWord = cleanInput
  let isCorrected = false
  if (COMMON_TYPOS[lower]) {
    correctedWord = COMMON_TYPOS[lower]
    isCorrected = true
  }

  const lookupKey = correctedWord.toLowerCase()

  // 3. Tra cứu Online: Nguồn 1 - Free Dictionary API (Lấy IPA + MP3)
  const onlineDict = await fetchFromFreeDictionary(lookupKey)
  if (onlineDict && onlineDict.ipa) {
    const result = {
      correctedWord: onlineDict.word || correctedWord,
      originalWord: cleanInput,
      ipa: onlineDict.ipa,
      audioUrl: onlineDict.audioUrl,
      isCorrected,
    }
    saveToCache(lower, result)
    return result
  }

  // 4. Tra cứu Online: Nguồn 2 - Datamuse Lexical API (Dự phòng cho mọi từ tiếng Anh)
  const datamuseDict = await fetchFromDatamuse(lookupKey)
  if (datamuseDict && datamuseDict.ipa) {
    const result = {
      correctedWord: datamuseDict.word || correctedWord,
      originalWord: cleanInput,
      ipa: datamuseDict.ipa,
      audioUrl: null,
      isCorrected,
    }
    saveToCache(lower, result)
    return result
  }

  // 5. Nếu tra từ điển online không thấy (từ sai hoặc từ đặc thù)
  return {
    correctedWord: cleanInput,
    originalWord: cleanInput,
    ipa: '',
    isCorrected: false,
    notFound: true,
  }
}

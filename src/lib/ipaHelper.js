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

function speakWithSpeechSynthesis(text) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  try {
    window.speechSynthesis.cancel()
    const clean = String(text || '').replace(/[\/\[\]]/g, '').trim()
    if (!clean) return

    const utterance = new SpeechSynthesisUtterance(clean)
    utterance.lang = 'en-US'
    utterance.rate = 0.9

    // Chọn voice tiếng Anh tốt nhất nếu có
    const voices = window.speechSynthesis.getVoices()
    const englishVoice = voices.find(
      (v) => (v.lang.startsWith('en-US') || v.lang.startsWith('en')) && v.name.includes('Google')
    ) || voices.find((v) => v.lang.startsWith('en'))
    if (englishVoice) {
      utterance.voice = englishVoice
    }

    window.speechSynthesis.speak(utterance)
  } catch (err) {
    console.warn('[TTS Error]:', err)
  }
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

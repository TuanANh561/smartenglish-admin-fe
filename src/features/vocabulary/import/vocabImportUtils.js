/**
 * vocabImportUtils.js
 * Hàm thuần túy (pure functions) phục vụ luồng Import Từ Vựng.
 * Không có side effects, không gọi API, không dùng state.
 */

import {
  MOCK_PARSED_VOCABULARY,
  MOCK_PARSED_VOCAB_TECH,
  MOCK_PARSED_VOCAB_HEALTH,
  MOCK_PARSED_GRAMMAR,
  MOCK_PARSED_READING,
  MOCK_PARSED_QUIZ,
} from '@/mocks/data/pdfImportSamples'

/**
 * Trả về bộ dữ liệu mock tương ứng với loại import và preset đang chọn.
 * @param {'vocabulary'|'grammar'|'reading'|'quiz'} type
 * @param {{ id: string } | null} preset
 */
export function getMockDataForType(type, preset) {
  if (preset?.id === 'pdf-vocab-02') return MOCK_PARSED_VOCAB_TECH
  if (preset?.id === 'pdf-vocab-03') return MOCK_PARSED_VOCAB_HEALTH
  switch (type) {
    case 'grammar':  return MOCK_PARSED_GRAMMAR
    case 'reading':  return MOCK_PARSED_READING
    case 'quiz':     return MOCK_PARSED_QUIZ
    case 'vocabulary':
    default:         return MOCK_PARSED_VOCABULARY
  }
}

/**
 * Parse mảng JSON thô (từ FileReader hoặc paste) thành danh sách item chuẩn.
 * @param {object[]} arr - mảng object JSON thô từ AI
 * @returns {{ id, word, pronunciation, phonetic, partOfSpeech, ... }[]}
 */
/**
 * Chuẩn hóa partOfSpeech từ nhiều định dạng viết tắt (n, v, adj, adv...)
 */
function normalizePartOfSpeech(pos) {
  if (!pos || typeof pos !== 'string') return 'Noun'
  const p = pos.trim().toLowerCase()
  if (p === 'n' || p.startsWith('noun') || p === 'danh từ') return 'Noun'
  if (p === 'v' || p.startsWith('verb') || p === 'động từ') return 'Verb'
  if (p === 'adj' || p.startsWith('adject') || p === 'a' || p === 'tính từ') return 'Adjective'
  if (p === 'adv' || p.startsWith('adverb') || p === 'trạng từ') return 'Adverb'
  if (p.startsWith('prep') || p === 'giới từ') return 'Preposition'
  if (p.startsWith('conj') || p === 'liên từ') return 'Conjunction'
  if (p.startsWith('pron') || p === 'đại từ') return 'Pronoun'
  if (p.startsWith('phrase') || p === 'cụm từ') return 'Phrase'
  // Giữ nguyên viết hoa chữ đầu nếu là từ khác
  return pos.charAt(0).toUpperCase() + pos.slice(1)
}

/**
 * Chuẩn hóa 1 item từ vựng từ bất kỳ cấu trúc JSON nào trên mạng
 */
function normalizeWordItem(it, idx) {
  if (!it || typeof it !== 'object') {
    return {
      id: `json-${Date.now()}-${idx + 1}`,
      word: typeof it === 'string' ? it.trim() : '',
      pronunciation: '/.../',
      phonetic: '/.../',
      partOfSpeech: 'Noun',
      vietnameseMeaning: '',
      englishMeaning: '',
      exampleSentence: '',
      exampleEn: '',
      exampleVi: '',
      topic: 'General',
      cefrLevel: 'B2',
      audioUrl: '',
      status: 'error',
      statusVal: 'error',
      statusMessage: 'Dữ liệu không đúng định dạng',
      isDuplicate: false,
    }
  }

  // Tự động nhận diện trường Từ vựng (Word / Term / Vocab...)
  const word = String(
    it.word ||
    it.term ||
    it.vocab ||
    it.vocabulary ||
    it.headword ||
    it.english ||
    it.en ||
    it.name ||
    it.text ||
    it.entry ||
    ''
  ).trim()

  // Tự động nhận diện Nghĩa tiếng Việt
  const vietnameseMeaning = String(
    it.vietnameseMeaning ||
    it.meaningVi ||
    it.meaning_vi ||
    it.meaning ||
    it.definition ||
    it.def ||
    it.vi ||
    it.translation ||
    it.trans ||
    it.nghia ||
    it.dinhNghia ||
    it.giaiThich ||
    it.vietnamese ||
    ''
  ).trim()

  // Tự động nhận diện Nghĩa tiếng Anh
  const englishMeaning = String(
    it.englishMeaning ||
    it.meaningEn ||
    it.meaning_en ||
    it.definitionEn ||
    it.definition_en ||
    it.en_definition ||
    it.gloss ||
    ''
  ).trim()

  // Tự động nhận diện Phiên âm IPA
  const pronunciation = String(
    it.pronunciation ||
    it.phonetic ||
    it.ipa ||
    it.ipaUs ||
    it.ipa_us ||
    it.spelling ||
    it.transcription ||
    ''
  ).trim()

  // Tự động nhận diện Từ loại (Part of speech)
  const rawPos = it.partOfSpeech || it.pos || it.type || it.tu_loai || it.tuLoai || 'Noun'
  const partOfSpeech = normalizePartOfSpeech(rawPos)

  // Tự động nhận diện Ví dụ tiếng Anh
  const exampleEn = String(
    it.exampleEn ||
    it.example_en ||
    it.example ||
    it.exampleSentence ||
    it.sentence ||
    it.context ||
    it.sample ||
    ''
  ).trim()

  // Tự động nhận diện Ví dụ tiếng Việt
  const exampleVi = String(
    it.exampleVi ||
    it.example_vi ||
    it.exampleSentenceVi ||
    it.vi_example ||
    it.translation_example ||
    it.exampleMeaning ||
    ''
  ).trim()

  // Tự động nhận diện Topic
  const topic = String(
    it.topic ||
    it.category ||
    it.theme ||
    it.group ||
    it.subject ||
    'General'
  ).trim()

  // Tự động nhận diện Audio URL
  const audioUrl = String(
    it.audioUrl ||
    it.audio ||
    it.audio_us_url ||
    it.audioUsUrl ||
    it.sound ||
    it.mp3 ||
    it.pronunciationAudio ||
    ''
  ).trim()

  // Tự động nhận diện Cấp độ CEFR
  const cefrLevel = String(
    it.cefrLevel ||
    it.cefr ||
    it.level ||
    'B2'
  ).trim().toUpperCase()

  const isValid = word.length > 0

  return {
    id: `json-${Date.now()}-${idx + 1}`,
    word,
    pronunciation: pronunciation || '/.../',
    phonetic: pronunciation || '/.../',
    partOfSpeech,
    vietnameseMeaning,
    englishMeaning,
    exampleSentence: exampleEn,
    exampleEn,
    exampleVi,
    topic,
    cefrLevel,
    audioUrl,
    status: isValid ? 'valid' : 'error',
    statusVal: isValid ? 'valid' : 'error',
    statusMessage: isValid ? 'Hợp lệ' : 'Thiếu từ vựng tiếng Anh',
    isDuplicate: false,
  }
}

/**
 * Parse mảng hoặc object JSON bất kỳ (từ FileReader hoặc paste) thành danh sách item chuẩn.
 * Tự động unwrap các cấu trúc lồng nhau: { data: [...] }, { words: [...] }, v.v.
 * @param {object[]|object} raw - dữ liệu JSON thô
 * @returns {object[]} danh sách item chuẩn hóa
 */
export function parseJsonItems(raw) {
  let list = []

  if (Array.isArray(raw)) {
    list = raw
  } else if (raw && typeof raw === 'object') {
    // Tìm thuộc tính đầu tiên có giá trị là mảng (vd: data, words, items, vocabulary...)
    const candidateKey = Object.keys(raw).find((k) => Array.isArray(raw[k]))
    if (candidateKey) {
      list = raw[candidateKey]
    } else {
      // Dạng dictionary { "apple": "quả táo", "banana": "quả chuối" }
      // hoặc { "apple": { "meaning": "quả táo", "ipa": "/ˈæp.əl/" } }
      list = Object.entries(raw).map(([key, val]) => {
        if (typeof val === 'string') {
          return { word: key, vietnameseMeaning: val }
        }
        if (typeof val === 'object' && val !== null) {
          return { word: key, ...val }
        }
        return { word: key }
      })
    }
  }

  return list.map((item, idx) => normalizeWordItem(item, idx))
}

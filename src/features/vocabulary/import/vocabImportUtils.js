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
export function parseJsonItems(arr) {
  return arr.map((it, idx) => ({
    id: `json-${Date.now()}-${idx + 1}`,
    word: it.word || '',
    pronunciation: it.pronunciation || it.phonetic || '/.../',
    phonetic: it.pronunciation || it.phonetic || '/.../',
    partOfSpeech: it.partOfSpeech || 'Noun',
    vietnameseMeaning: it.vietnameseMeaning || '',
    englishMeaning: it.englishMeaning || '',
    exampleSentence: it.exampleEn || it.exampleSentence || '',
    exampleEn: it.exampleEn || it.exampleSentence || '',
    exampleVi: it.exampleVi || '',
    topic: it.topic || 'General',
    cefrLevel: it.cefrLevel || 'B2',
    audioUrl: it.audioUrl || it.audio || it.audio_us_url || it.audioUsUrl || it.sound || it.pronunciationAudio || '',
    status: 'valid',
    statusVal: 'valid',
    statusMessage: 'Hợp lệ',
    isDuplicate: false,
  }))
}

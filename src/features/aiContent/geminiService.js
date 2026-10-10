/**
 * Dịch vụ Sinh nội dung AI (Reading, Quiz, TOEIC Part 5/6, Cloze)
 * Toàn bộ yêu cầu sinh nội dung được gửi trực tiếp về Backend Service
 * (/admin/ai/generate-content) để bảo vệ Gemini API Key và đảm bảo hiệu năng.
 */
import { api } from '@/lib/api'

export class GeminiServiceError extends Error {
  constructor(message, code = 'GEMINI_ERROR', details = null) {
    super(message)
    this.code = code
    this.details = details
    this.name = 'GeminiServiceError'
  }
}

/**
 * Gọi API backend sinh nội dung AI. Không tạo dữ liệu giả khi provider lỗi.
 */
async function callBackendAiContent(payload) {
  try {
    const res = await api.post('/admin/ai/generate-content', { data: payload })
    const data = res?.data !== undefined ? res.data : res
    if (data && (data.questions || data.text || data.title)) {
      return data
    }
    throw new GeminiServiceError('Backend trả về nội dung AI không hợp lệ', 'INVALID_RESPONSE')
  } catch (error) {
    if (error instanceof GeminiServiceError) throw error
    const status = error?.response?.status
    if (status === 401 || status === 403) {
      throw new GeminiServiceError('Bạn không có quyền sử dụng chức năng AI này', 'FORBIDDEN')
    }
    if (status === 429) {
      throw new GeminiServiceError('Đã vượt hạn mức AI. Vui lòng thử lại sau', 'RATE_LIMIT')
    }
    throw new GeminiServiceError('Dịch vụ AI tạm thời không khả dụng', 'BACKEND_UNAVAILABLE')
  }
}

/**
 * Sinh bài đọc tiếng Anh kèm câu hỏi đọc hiểu
 */
export async function generateReading({ topic, level = 'B2', questionCount = 3 }) {
  const data = await callBackendAiContent({
    type: 'reading',
    topic,
    level,
    questionCount,
  })

  return {
    title: data.title || `Reading Passage - ${topic}`,
    text: data.text || '',
    questions: (data.questions || []).map((q, idx) => ({
      id: q.id ?? idx + 1,
      questionText: q.questionText || q.question || `Câu hỏi ${idx + 1}`,
      options: q.options || ['A', 'B', 'C', 'D'],
      correctAnswer: q.correctAnswer || 'A',
      explanationVi: q.explanationVi || 'Giải thích chi tiết',
    })),
  }
}

/**
 * Sinh bài tập điền khuyết / TOEIC Part 5, Part 6
 */
export async function generateCloze({ topic, level = 'B2', type = 'cloze_sentence', questionCount = 3 }) {
  const data = await callBackendAiContent({
    type,
    topic,
    level,
    questionCount,
  })

  return {
    title: data.title || `${type.toUpperCase()} - ${topic}`,
    text: data.text || '',
    questions: (data.questions || []).map((q, idx) => ({
      id: q.id ?? idx + 1,
      questionText: q.questionText || q.question || `${idx + 1}.`,
      options: q.options || ['A', 'B', 'C', 'D'],
      correctAnswer: q.correctAnswer || 'A',
      explanationVi: q.explanationVi || 'Giải thích chi tiết',
    })),
  }
}

/**
 * Sinh bộ câu hỏi trắc nghiệm kiểm tra
 */
export async function generateQuiz({ topic, level = 'B2', questionCount = 3 }) {
  const data = await callBackendAiContent({
    type: 'quiz',
    topic,
    level,
    questionCount,
  })

  return {
    questions: (data.questions || []).map((q, idx) => ({
      id: q.id ?? idx + 1,
      questionText: q.questionText || q.question || `Câu hỏi ${idx + 1}`,
      options: q.options || ['A', 'B', 'C', 'D'],
      correctAnswer: q.correctAnswer || 'A',
      explanationVi: q.explanationVi || 'Giải thích chi tiết',
    })),
  }
}

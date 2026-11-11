/**
 * Dịch vụ Sinh nội dung AI (Reading, Quiz Grammar, Quiz Vocab, TOEIC Part 5/6/7, Placement Test)
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
 * Gọi API backend sinh nội dung AI.
 */
async function callBackendAiContent(payload) {
  try {
    // Sinh 10 câu hỏi có thể mất hơn 30 giây (timeout mặc định của api)
    const res = await api.post('/admin/ai/generate-content', { data: payload, timeout: 90000 })
    const data = res?.data !== undefined ? res.data : res
    if (data && (data.questions || data.text || data.title)) {
      return data
    }
    throw new GeminiServiceError('Backend trả về nội dung AI không hợp lệ', 'INVALID_RESPONSE')
  } catch (error) {
    if (error instanceof GeminiServiceError) throw error
    // Lỗi từ api đã được chuẩn hoá thành { status, message }
    const status = error?.status ?? error?.response?.status
    if (status === 401 || status === 403) {
      throw new GeminiServiceError('Bạn không có quyền sử dụng chức năng AI này', 'FORBIDDEN')
    }
    if (status === 429) {
      throw new GeminiServiceError('Đã vượt hạn mức AI. Vui lòng thử lại sau', 'RATE_LIMIT')
    }
    if (status === 0 && /thời gian chờ/i.test(error?.message || '')) {
      throw new GeminiServiceError('AI phản hồi quá lâu, vui lòng thử lại với ít câu hỏi hơn', 'TIMEOUT')
    }
    throw new GeminiServiceError(error?.message || 'Dịch vụ AI tạm thời không khả dụng', 'BACKEND_UNAVAILABLE')
  }
}

/**
 * Sinh bài đọc tiếng Anh kèm câu hỏi đọc hiểu
 */
export async function generateReading({ topic, level = 'B2', questionCount = 3, instructions = '' }) {
  const data = await callBackendAiContent({
    type: 'reading',
    topic,
    level,
    questionCount,
    instructions,
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
 * Sinh bài tập điền khuyết / TOEIC Part 5, Part 6, Part 7
 */
export async function generateCloze({ topic, level = 'B2', type = 'toeic_part_5', questionCount = 3, instructions = '' }) {
  const data = await callBackendAiContent({
    type,
    topic,
    level,
    questionCount,
    instructions,
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
 * Sinh bộ câu hỏi trắc nghiệm kiểm tra (Grammar, Vocab, Placement, General)
 */
export async function generateQuiz({ topic, level = 'B2', questionCount = 3, type = 'quiz_grammar', instructions = '' }) {
  const data = await callBackendAiContent({
    type,
    topic,
    level,
    questionCount,
    instructions,
  })

  return {
    title: data.title || `Quiz: ${topic}`,
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

/**
 * quizServiceApi.js
 * ─────────────────────────────────────────────────────────────────────────────
 * API calls kết nối tới learning-service (/admin/quizzes)
 * Quản lý ngân hàng Quiz luyện tập (Micro-quiz, Ghép nối, Điền từ, Trắc nghiệm)
 * ─────────────────────────────────────────────────────────────────────────────
 */
import axios from 'axios'

const BASE_URL = '/admin/quizzes'

export const QUIZ_TYPES = [
  { value: 'ALL', label: 'Tất cả loại Quiz' },
  { value: 'DYNAMIC', label: 'Quiz Tự động sinh' },
  { value: 'GRAMMAR_MINI', label: 'Mini Test Ngữ pháp' },
  { value: 'VOCAB_PRACTICE', label: 'Luyện tập Từ vựng' },
  { value: 'PLACEMENT', label: 'Kiểm tra Đầu vào' },
  { value: 'MOCK_TOEIC', label: 'TOEIC Mini Quiz' },
]

export const QUESTION_TYPES = [
  { value: 'MULTIPLE_CHOICE', label: 'Trắc nghiệm 4 lựa chọn', icon: 'CheckSquare' },
  { value: 'FILL_BLANK', label: 'Điền vào chỗ trống', icon: 'PenLine' },
  { value: 'MATCHING', label: 'Ghép nối từ & nghĩa', icon: 'Shuffle' },
  { value: 'WORD_ORDER', label: 'Sắp xếp trật tự từ', icon: 'ArrowUpDown' },
  { value: 'TRUE_FALSE', label: 'Đúng / Sai', icon: 'HelpCircle' },
]

export async function getAdminQuizzes(params = {}) {
  try {
    const res = await axios.get(BASE_URL, { params })
    return res.data?.data || []
  } catch (err) {
    console.warn('[quizServiceApi] Không thể kết nối learning-service, sử dụng fallback:', err.message)
    return []
  }
}

export async function getAdminQuizById(id) {
  const res = await axios.get(`${BASE_URL}/${id}`)
  return res.data?.data
}

export async function createAdminQuiz(payload) {
  const res = await axios.post(BASE_URL, payload)
  return res.data?.data
}

export async function updateAdminQuiz(id, payload) {
  const res = await axios.put(`${BASE_URL}/${id}`, payload)
  return res.data?.data
}

export async function deleteAdminQuiz(id) {
  const res = await axios.delete(`${BASE_URL}/${id}`)
  return res.data
}

export async function addQuestionToQuiz(quizId, questionPayload) {
  const res = await axios.post(`${BASE_URL}/${quizId}/questions`, questionPayload)
  return res.data?.data
}

export async function updateQuestionInQuiz(quizId, questionId, questionPayload) {
  const res = await axios.put(`${BASE_URL}/${quizId}/questions/${questionId}`, questionPayload)
  return res.data?.data
}

export async function deleteQuestionFromQuiz(quizId, questionId) {
  const res = await axios.delete(`${BASE_URL}/${quizId}/questions/${questionId}`)
  return res.data
}

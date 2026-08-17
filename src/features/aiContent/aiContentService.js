import { aiContentItems } from '@/mocks/data/aiContent'

// Key lưu trữ trong localStorage — thay đổi key này nếu muốn reset toàn bộ dữ liệu
const STORAGE_KEY = 'smartenglish_ai_content_v1'

const STATUS_LABELS = {
  GENERATING: 'GENERATING',
  PENDING_REVIEW: 'PENDING_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
}

const TYPE_GROUPS = {
  vocabulary: 'vocabulary',
  vocab: 'vocabulary',
  reading: 'reading',
  listening: 'listening',
  quiz: 'quiz',
  exam: 'quiz',
}

function normalizeStatus(status) {
  const value = (status ?? 'PENDING_REVIEW').toString().toUpperCase()
  return STATUS_LABELS[value] ?? value
}

function normalizeType(type) {
  return TYPE_GROUPS[(type ?? 'vocabulary').toLowerCase()] ?? 'vocabulary'
}

function getStorage() {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

// Chuẩn hóa một record để đảm bảo luôn có đầy đủ các field cần thiết
function normalizeRecord(item) {
  const createdAt = item.createdAt ?? new Date().toISOString()

  return {
    id: item.id || `AIC-${Date.now()}`,
    type: normalizeType(item.type),
    title: item.title || 'Nội dung AI',
    status: normalizeStatus(item.status),
    source: item.source || 'AI',
    level: item.level || 'B2',
    content: item.content || item.definition || '',
    createdBy: item.createdBy || 'AI System',
    createdAt,
    updatedAt: item.updatedAt || createdAt,
    approvedBy: item.approvedBy ?? null,
    approvedAt: item.approvedAt ?? null,
    rejectionReason: item.rejectionReason ?? '',
    definition: item.definition || item.content || '',
    confidenceScore: item.confidenceScore ?? 92,
    typeLabel: item.typeLabel || 'Nội dung AI',
    icon: item.icon || 'vocab',
    context: item.context || '',
    chartData: item.chartData ?? null,
    questions: item.questions ?? [],
    geminiPrompt: item.geminiPrompt ?? '',
  }
}

// Khởi tạo dữ liệu mẫu từ file mock khi localStorage chưa có gì
function seedRecords() {
  const base = (aiContentItems || []).map((item) => normalizeRecord(item))
  const storage = getStorage()

  if (storage) {
    storage.setItem(STORAGE_KEY, JSON.stringify(base))
  }

  return base
}

// Đọc tất cả records từ localStorage, nếu chưa có thì seed dữ liệu mẫu
export function getAIContentRecords() {
  const storage = getStorage()

  try {
    const raw = storage ? storage.getItem(STORAGE_KEY) : null
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => normalizeRecord(item))
      }
    }
  } catch {
    // ignore and fallback to seed
  }

  return seedRecords()
}

function persistRecords(records) {
  const storage = getStorage()
  const normalized = (records || []).map((item) => normalizeRecord(item))

  if (storage) {
    storage.setItem(STORAGE_KEY, JSON.stringify(normalized))
  }

  return normalized
}

export function getPendingAIContent(type) {
  const records = getAIContentRecords()
  return records.filter((item) => {
    const matchStatus = item.status === 'PENDING_REVIEW'
    const matchType = !type || normalizeType(item.type) === normalizeType(type)
    return matchStatus && matchType
  })
}

export function getApprovedAIContent(type) {
  const records = getAIContentRecords()
  return records.filter((item) => {
    const matchStatus = item.status === 'APPROVED'
    const matchType = !type || normalizeType(item.type) === normalizeType(type)
    return matchStatus && matchType
  })
}

export function getPublishedContent(type) {
  return getApprovedAIContent(type)
}

export function getAIContentStats() {
  const records = getAIContentRecords()
  return {
    total: records.length,
    pending: records.filter((item) => item.status === 'PENDING_REVIEW').length,
    approved: records.filter((item) => item.status === 'APPROVED').length,
    rejected: records.filter((item) => item.status === 'REJECTED').length,
  }
}

export async function generateAIContent({ type = 'vocabulary', title, content, level = 'B2', createdBy = 'AI System' }) {
  const records = getAIContentRecords()
  const now = new Date().toISOString()
  const generated = normalizeRecord({
    id: `AIC-${Date.now()}`,
    type,
    title: title || 'Nội dung AI mới',
    status: 'GENERATING',
    source: 'AI',
    level,
    content: content || '',
    createdBy,
    createdAt: now,
    updatedAt: now,
    definition: content || '',
  })

  const nextRecords = [generated, ...records]
  persistRecords(nextRecords)

  await new Promise((resolve) => setTimeout(resolve, 900))

  const final = normalizeRecord({
    ...generated,
    status: 'PENDING_REVIEW',
    updatedAt: new Date().toISOString(),
  })

  const finalRecords = nextRecords.map((item) => (item.id === generated.id ? final : item))
  persistRecords(finalRecords)

  return final
}

export function updateAIContent(id, payload = {}) {
  const records = getAIContentRecords()
  const target = records.find((item) => item.id === id)

  if (!target) return null
  if (target.status === 'APPROVED') {
    throw new Error('Không thể chỉnh sửa nội dung đã được duyệt.')
  }

  const updated = normalizeRecord({
    ...target,
    ...payload,
    title: payload.title ?? target.title,
    content: payload.content ?? target.content,
    definition: payload.definition ?? payload.content ?? target.definition,
    updatedAt: new Date().toISOString(),
    status: 'PENDING_REVIEW',
  })

  const nextRecords = records.map((item) => (item.id === id ? updated : item))
  persistRecords(nextRecords)
  return updated
}

export function approveAIContent(id, currentUser = null) {
  const records = getAIContentRecords()
  const target = records.find((item) => item.id === id)

  if (!target) return null

  const approved = normalizeRecord({
    ...target,
    status: 'APPROVED',
    approvedBy: currentUser?.displayName || currentUser?.email || 'Admin',
    approvedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    rejectionReason: '',
  })

  persistRecords(records.map((item) => (item.id === id ? approved : item)))
  return approved
}

export function rejectAIContent(id, reason = '', currentUser = null) {
  const records = getAIContentRecords()
  const target = records.find((item) => item.id === id)

  if (!target) return null

  const rejected = normalizeRecord({
    ...target,
    status: 'REJECTED',
    rejectionReason: reason || 'Nội dung không đạt tiêu chuẩn duyệt.',
    approvedBy: currentUser?.displayName || currentUser?.email || null,
    updatedAt: new Date().toISOString(),
  })

  persistRecords(records.map((item) => (item.id === id ? rejected : item)))
  return rejected
}

// ─── Thu hồi nội dung đã duyệt (kéo về PENDING_REVIEW) ──────────────────────
// Dùng khi nội dung đã publish nhưng phát hiện vi phạm — cần xét duyệt lại
export function revokeAIContent(id, reason = '', currentUser = null) {
  const records = getAIContentRecords()
  const target = records.find((item) => item.id === id)

  if (!target) return null
  if (target.status !== 'APPROVED') return target

  const revoked = normalizeRecord({
    ...target,
    status: 'PENDING_REVIEW',
    approvedBy: null,
    approvedAt: null,
    rejectionReason: reason || '',
    updatedAt: new Date().toISOString(),
  })

  persistRecords(records.map((item) => (item.id === id ? revoked : item)))
  return revoked
}

export function buildPublicContent(type, fallbackItems = []) {
  const approved = getApprovedAIContent(type)

  const normalizeQuestion = (q) => {
    const correctIndex = q.correctAnswer
      ? q.correctAnswer.charCodeAt(0) - 'A'.charCodeAt(0)
      : 0
    return {
      id: q.id || Math.random().toString(36).substr(2, 9),
      question: q.questionText || q.question || '',
      options: q.options || [],
      correctIndex,
      explanationVi: q.explanationVi || '',
    }
  }

  const publicItems = approved.map((item) => {
    const group = normalizeType(item.type)

    if (group === 'reading') {
      return {
        id: item.id,
        title: item.title,
        level: item.level,
        topic: 'AI sinh',
        description: item.content || item.definition,
        content: item.content || item.definition,
        wordCount: Math.max(300, Math.ceil((item.content || '').length / 10)),
        minutes: 5,
        authorName: item.approvedBy || item.createdBy || 'Hoàng Thị Mai',
        authorEmail: 'mai.ht@gmail.com',
        createdAt: item.createdAt,
        questions: (item.questions || []).map(normalizeQuestion),
        isAI: true,
        source: 'AI',
      }
    }

    if (group === 'listening') {
      return {
        id: item.id,
        title: item.title,
        description: item.content || item.definition,
        level: item.level,
        accent: 'AI Voice',
        topic: 'AI sinh',
        status: 'ready',
        duration: '03:00',
        authorName: item.approvedBy || item.createdBy || 'Hoàng Thị Mai',
        authorEmail: 'mai.ht@gmail.com',
        waveform: [8, 14, 10, 16, 12, 18, 12, 14, 9, 16, 10, 13],
        createdAt: item.createdAt,
        isAI: true,
        source: 'AI',
      }
    }

    if (group === 'quiz') {
      // Nếu có câu hỏi từ Gemini, flatten thành danh sách individual questions
      if (item.questions && item.questions.length > 0) {
        return item.questions.map((q, idx) => ({
          id: q.id || `${item.id}-q${idx}`,
          questionType: 'multiple_choice',
          questionText: q.questionText || q.question || '',
          options: q.options || [],
          correctAnswer: q.correctAnswer || 'A',
          explanationVi: q.explanationVi || '',
          relatedWord: item.title,
          cefrLevel: item.level,
          topic: 'AI sinh',
          difficulty: 'medium',
          authorName: item.approvedBy || item.createdBy || 'Hoàng Thị Mai',
          authorEmail: 'mai.ht@gmail.com',
          source: 'ai',
          status: 'approved',
          createdAt: item.createdAt,
          isAI: true,
        }))
      }

      // Fallback: create placeholder questions from content
      return {
        id: item.id,
        questionType: 'multiple_choice',
        questionText: item.content || item.title,
        options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
        correctAnswer: 'Đáp án A',
        explanationVi: 'Nội dung do AI sinh đã được duyệt và công bố.',
        relatedWord: item.title,
        cefrLevel: item.level,
        topic: 'Từ vựng',
        difficulty: 'medium',
        source: 'ai',
        status: 'approved',
        createdAt: item.createdAt,
        isAI: true,
      }
    }

    return {
      id: item.id,
      title: item.title,
      level: item.level,
      topic: 'AI sinh',
      description: item.content || item.definition,
      content: item.content || item.definition,
      isAI: true,
      source: 'AI',
    }
  })

  // Flatten quiz questions from Gemini (which returns arrays)
  const flattened = publicItems.flat()

  return [...fallbackItems, ...flattened]
}

export function syncGeneratedContentToPublicModules() {
  return getApprovedAIContent()
}

/**
 * Save Gemini-generated content with questions
 * @param {string} type - 'reading' or 'quiz'
 * @param {string} title - Content title
 * @param {string} content - Content text
 * @param {string} level - CEFR level
 * @param {Array} questions - Array of question objects from Gemini
 * @param {string} geminiPrompt - Original Gemini prompt
 * @param {object} currentUser - Current user object
 * @returns {object} Saved record
 */
// ─── Lưu nội dung được sinh bởi Gemini vào localStorage ─────────────────────
// Được gọi sau khi generateReading() hoặc generateQuiz() thành công
// Tự động đặt status = PENDING_REVIEW (chờ admin duyệt trước khi publish)
export function saveGeminiContent({ type, title, content, level, questions = [], geminiPrompt = '', createdBy = 'AI System' }) {
  const records = getAIContentRecords()
  const now = new Date().toISOString()

  const record = normalizeRecord({
    id: `AIC-${Date.now()}`,
    type,
    title: title || 'Nội dung AI mới',
    status: 'PENDING_REVIEW',
    source: 'Gemini',
    level: level || 'B2',
    content: content || '',
    definition: content || '',
    createdBy,
    createdAt: now,
    updatedAt: now,
    questions: (questions || []).map((q) => ({
      id: q.id || Math.random().toString(36).substr(2, 9),
      questionText: q.questionText || q.question || '',
      options: q.options || [],
      correctAnswer: q.correctAnswer || 'A',
      explanationVi: q.explanationVi || '',
    })),
    geminiPrompt,
    confidenceScore: 95,
  })

  const updated = [record, ...records]
  persistRecords(updated)

  return record
}


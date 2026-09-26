import { aiContentItems } from '@/mocks/data/aiContent'
import { http } from '@/lib/api'

// Key lưu trữ dự phòng trong localStorage khi offline hoặc chưa kịp sync
const STORAGE_KEY = 'smartenglish_ai_content_v1'
const MEMORY_STORE = []

const STATUS_LABELS = {
  GENERATING: 'GENERATING',
  PENDING_REVIEW: 'PENDING_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  DELETED: 'DELETED',
}

const TYPE_GROUPS = {
  vocabulary: 'vocabulary',
  vocab: 'vocabulary',
  reading: 'reading',
  listening: 'listening',
  quiz: 'quiz',
  exam: 'quiz',
  toeic_part_5: 'quiz',
  cloze_sentence: 'quiz',
  short_test: 'short_test',
  toeic_part_6: 'short_test',
  toeic_part_7: 'short_test',
  cloze_paragraph: 'short_test',
}

export function isShortTestRecord(item) {
  if (!item) return false
  const t = (item.rawType || item.type || '').toLowerCase()
  if (['short_test', 'toeic_part_6', 'toeic_part_7', 'cloze_paragraph'].includes(t)) {
    return true
  }
  const title = (item.title || '').toLowerCase()
  if (
    title.includes('part 6') ||
    title.includes('part 7') ||
    title.includes('cloze paragraph') ||
    title.includes('test ngắn') ||
    title.includes('đoạn văn')
  ) {
    return true
  }
  if (Array.isArray(item.questions) && item.questions.length > 1 && (item.content || '').length > 60) {
    return true
  }
  return false
}

function normalizeStatus(status) {
  const value = (status ?? 'PENDING_REVIEW').toString().toUpperCase()
  return STATUS_LABELS[value] ?? value
}

function normalizeType(type) {
  return TYPE_GROUPS[(type ?? 'vocabulary').toLowerCase()] ?? 'vocabulary'
}

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
    return globalThis.localStorage
  }
  return null
}

// Chuẩn hóa một record để đảm bảo luôn có đầy đủ các field cần thiết
export function normalizeRecord(item) {
  if (!item) return null
  const createdAt = item.createdAt ?? new Date().toISOString()

  return {
    id: item.id || `AIC-${Date.now()}`,
    type: normalizeType(item.type),
    rawType: item.type || 'reading',
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
    questions: Array.isArray(item.questions) ? item.questions : [],
    geminiPrompt: item.geminiPrompt ?? '',
    deletedAt: item.deletedAt ?? null,
    deletedBy: item.deletedBy ?? null,
  }
}

function seedRecords() {
  const base = (aiContentItems || []).map((item) => normalizeRecord(item))
  const storage = getStorage()

  if (storage) {
    storage.setItem(STORAGE_KEY, JSON.stringify(base))
    return base
  }

  if (MEMORY_STORE.length === 0) {
    MEMORY_STORE.push(...base)
  }

  return [...MEMORY_STORE]
}

export function persistRecords(records) {
  const storage = getStorage()
  const normalized = (records || []).map((item) => normalizeRecord(item))

  if (storage) {
    storage.setItem(STORAGE_KEY, JSON.stringify(normalized))
    return normalized
  }

  MEMORY_STORE.length = 0
  MEMORY_STORE.push(...normalized)
  return normalized
}

// Đọc đồng bộ từ local cache
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

  if (!storage && MEMORY_STORE.length > 0) {
    return [...MEMORY_STORE].map((item) => normalizeRecord(item))
  }

  return seedRecords()
}

// =========================================================================
// BACKEND REST API CALLS (PostgreSQL via content-service /admin/ai/contents)
// =========================================================================

export async function fetchAIContentRecords(params = {}) {
  try {
    const res = await http.get('/admin/ai/contents', {
      params: {
        page: params.page || 1,
        size: params.size || 50,
        type: params.type || undefined,
        status: params.status || undefined,
        search: params.search || undefined,
        createdBy: params.createdBy || undefined,
        trash: params.trash ?? false,
      },
    })

    const items = res?.items || (Array.isArray(res) ? res : [])
    const normalized = items.map(normalizeRecord)

    // Cập nhật lại cache cục bộ để các module khác (Reading/Quiz/Listening) đọc đồng bộ
    if (normalized.length > 0) {
      persistRecords(normalized)
    }

    return normalized
  } catch (error) {
    console.warn('⚠️ [AiContent] Không thể kết nối backend, sử dụng cache cục bộ:', error?.message)
    return getAIContentRecords()
  }
}

export async function fetchAIContentStats() {
  try {
    const res = await http.get('/admin/ai/contents/statistics')
    return res || getAIContentStats()
  } catch {
    return getAIContentStats()
  }
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
    if (!type) return matchStatus
    if (type === 'short_test') {
      return matchStatus && isShortTestRecord(item)
    }
    if (type === 'quiz') {
      return matchStatus && !isShortTestRecord(item) && (normalizeType(item.type) === 'quiz' || item.type === 'toeic_part_5' || item.type === 'cloze_sentence')
    }
    return matchStatus && normalizeType(item.type) === normalizeType(type)
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
    deleted: records.filter((item) => item.status === 'DELETED').length,
  }
}

// ─── Lưu nội dung được sinh bởi Gemini vào CSDL PostgreSQL (content-service) ───
export async function saveGeminiContent({ type, title, content, level, questions = [], geminiPrompt = '', createdBy = 'Admin' }) {
  const payload = {
    type,
    title: title || 'Nội dung AI mới',
    content: content || '',
    definition: content || '',
    level: level || 'B2',
    questions: (questions || []).map((q) => ({
      id: q.id || Math.random().toString(36).substr(2, 9),
      questionText: q.questionText || q.question || '',
      options: q.options || [],
      correctAnswer: q.correctAnswer || 'A',
      explanationVi: q.explanationVi || '',
    })),
    geminiPrompt,
    confidenceScore: 95,
    createdBy: createdBy || 'Admin',
  }

  let record
  try {
    const res = await http.post('/admin/ai/contents', payload, {
      params: { currentUser: createdBy },
    })
    record = normalizeRecord(res)
  } catch (err) {
    console.warn('⚠️ Lỗi khi lưu lên backend CSDL, fallback lưu local:', err?.message)
    record = normalizeRecord({
      id: `AIC-${Date.now()}`,
      ...payload,
      status: 'PENDING_REVIEW',
      source: 'Gemini',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  const records = getAIContentRecords()
  const updated = [record, ...records.filter((i) => i.id !== record.id)]
  persistRecords(updated)
  return record
}

export async function updateAIContent(id, payload = {}) {
  const records = getAIContentRecords()
  const target = records.find((item) => item.id === id)

  if (target?.status === 'APPROVED') {
    throw new Error('Không thể chỉnh sửa nội dung đã được duyệt.')
  }
  if (target?.status === 'DELETED') {
    throw new Error('Không thể chỉnh sửa nội dung trong thùng rác.')
  }

  let updatedRecord
  try {
    const res = await http.put(`/admin/ai/contents/${id}`, {
      title: payload.title ?? target?.title,
      content: payload.content ?? target?.content,
      definition: payload.definition ?? payload.content ?? target?.definition,
      level: payload.level ?? target?.level,
      questions: payload.questions ?? target?.questions ?? [],
    })
    updatedRecord = normalizeRecord(res)
  } catch {
    updatedRecord = normalizeRecord({
      ...target,
      ...payload,
      title: payload.title ?? target?.title,
      content: payload.content ?? target?.content,
      definition: payload.definition ?? payload.content ?? target?.definition,
      updatedAt: new Date().toISOString(),
      status: 'PENDING_REVIEW',
    })
  }

  const nextRecords = records.map((item) => (item.id === id ? updatedRecord : item))
  persistRecords(nextRecords)
  return updatedRecord
}

export async function approveAIContent(id, currentUser = null) {
  const reviewer = currentUser?.displayName || currentUser?.email || 'Admin'
  let approvedRecord

  try {
    const res = await http.put(`/admin/ai/contents/${id}/approve`, null, {
      params: { reviewer },
    })
    approvedRecord = normalizeRecord(res)
  } catch {
    const records = getAIContentRecords()
    const target = records.find((item) => item.id === id)
    if (!target) return null
    approvedRecord = normalizeRecord({
      ...target,
      status: 'APPROVED',
      approvedBy: reviewer,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rejectionReason: '',
    })
  }

  const records = getAIContentRecords()
  persistRecords(records.map((item) => (item.id === id ? approvedRecord : item)))
  return approvedRecord
}

export async function rejectAIContent(id, reason = '', currentUser = null) {
  const reviewer = currentUser?.displayName || currentUser?.email || 'Admin'
  let rejectedRecord

  try {
    const res = await http.put(`/admin/ai/contents/${id}/reject`, null, {
      params: { reason, reviewer },
    })
    rejectedRecord = normalizeRecord(res)
  } catch {
    const records = getAIContentRecords()
    const target = records.find((item) => item.id === id)
    if (!target) return null
    rejectedRecord = normalizeRecord({
      ...target,
      status: 'REJECTED',
      rejectionReason: reason || 'Nội dung không đạt tiêu chuẩn duyệt.',
      approvedBy: reviewer,
      updatedAt: new Date().toISOString(),
    })
  }

  const records = getAIContentRecords()
  persistRecords(records.map((item) => (item.id === id ? rejectedRecord : item)))
  return rejectedRecord
}

export async function revokeAIContent(id, reason = '', currentUser = null) {
  const reviewer = currentUser?.displayName || currentUser?.email || 'Admin'
  let revokedRecord

  try {
    const res = await http.put(`/admin/ai/contents/${id}/revoke`, null, {
      params: { reviewer },
    })
    revokedRecord = normalizeRecord(res)
  } catch {
    const records = getAIContentRecords()
    const target = records.find((item) => item.id === id)
    if (!target) return null
    revokedRecord = normalizeRecord({
      ...target,
      status: 'PENDING_REVIEW',
      approvedBy: null,
      approvedAt: null,
      rejectionReason: reason || '',
      updatedAt: new Date().toISOString(),
    })
  }

  const records = getAIContentRecords()
  persistRecords(records.map((item) => (item.id === id ? revokedRecord : item)))
  return revokedRecord
}

export async function softDeleteAIContent(id, currentUser = null) {
  const user = currentUser?.displayName || currentUser?.email || 'Admin'
  try {
    await http.delete(`/admin/ai/contents/${id}`, {
      params: { currentUser: user },
    })
  } catch {
    // ignore
  }

  const records = getAIContentRecords()
  const target = records.find((item) => item.id === id)
  if (!target) return null

  const deleted = normalizeRecord({
    ...target,
    status: 'DELETED',
    deletedBy: user,
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  persistRecords(records.map((item) => (item.id === id ? deleted : item)))
  return deleted
}

export async function restoreAIContent(id) {
  let restoredRecord
  try {
    const res = await http.put(`/admin/ai/contents/${id}/restore`)
    restoredRecord = normalizeRecord(res)
  } catch {
    const records = getAIContentRecords()
    const target = records.find((item) => item.id === id)
    if (!target) return null
    restoredRecord = normalizeRecord({
      ...target,
      status: 'PENDING_REVIEW',
      deletedBy: null,
      deletedAt: null,
      updatedAt: new Date().toISOString(),
    })
  }

  const records = getAIContentRecords()
  persistRecords(records.map((item) => (item.id === id ? restoredRecord : item)))
  return restoredRecord
}

export async function bulkApproveAIContents(ids, currentUser = null) {
  const reviewer = currentUser?.displayName || currentUser?.email || 'Admin'
  try {
    await http.post('/admin/ai/contents/bulk-approve', { ids, reviewer })
  } catch {
    // fallback
  }

  const records = getAIContentRecords()
  const updated = records.map((item) => {
    if (ids.includes(item.id)) {
      return normalizeRecord({
        ...item,
        status: 'APPROVED',
        approvedBy: reviewer,
        approvedAt: new Date().toISOString(),
      })
    }
    return item
  })
  persistRecords(updated)
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

    if (type === 'short_test' || group === 'short_test' || isShortTestRecord(item)) {
      const testTitle = item.title || 'Bài test ngắn AI'
      const questions = (item.questions || []).map((q, idx) => ({
        id: q.id || `${item.id}-${idx + 1}`,
        questionNumber: q.questionNumber || `${idx + 1}`,
        questionText: q.questionText || q.question || `Câu hỏi ${idx + 1}`,
        options: q.options || [],
        correctAnswer: q.correctAnswer || '',
        explanationVi: q.explanationVi || '',
      }))

      let testType = 'reading_short'
      let testTypeLabel = 'Đọc hiểu đoạn văn ngắn'
      const lower = (item.title || '').toLowerCase()
      if (lower.includes('part 6')) {
        testType = 'toeic_part_6'
        testTypeLabel = 'TOEIC Part 6 (Điền đoạn văn)'
      } else if (lower.includes('part 7')) {
        testType = 'toeic_part_7'
        testTypeLabel = 'TOEIC Part 7 (Đọc hiểu ngắn)'
      } else if (lower.includes('cloze') || lower.includes('điền')) {
        testType = 'cloze_paragraph'
        testTypeLabel = 'Điền khuyết văn bản'
      }

      return {
        id: item.id,
        title: testTitle,
        testType,
        testTypeLabel,
        level: item.level || 'B2',
        durationMinutes: Math.max(3, Math.ceil((questions.length || 3) * 1.5)),
        authorName: item.approvedBy || item.createdBy || 'Hoàng Thị Mai',
        authorEmail: 'mai.ht@gmail.com',
        status: 'approved',
        createdAt: item.createdAt,
        passage: item.content || item.definition || '',
        questions,
        isAI: true,
      }
    }

    if (group === 'quiz') {
      if (Array.isArray(item.questions) && item.questions.length > 0) {
        return item.questions.map((q, idx) => ({
          id: `${item.id}-q${idx + 1}`,
          title: item.title || 'Câu hỏi trắc nghiệm AI',
          questionType: 'multiple_choice',
          questionText: q.questionText || q.question || `${item.title} #${idx + 1}`,
          options: q.options || [],
          correctAnswer: q.correctAnswer || (q.options ? q.options[0] : ''),
          explanationVi: q.explanationVi || 'Câu hỏi do AI sinh đã được duyệt.',
          relatedWord: item.title || 'Từ vựng',
          cefrLevel: item.level || 'B2',
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

      const quizTitle = item.title || 'Bài kiểm tra AI'
      return {
        id: item.id,
        title: quizTitle,
        questionType: 'multiple_choice',
        questionText: quizTitle,
        options: [],
        correctAnswer: '',
        explanationVi: item.content || item.definition || 'Nội dung do AI sinh đã được duyệt và công bố.',
        relatedWord: quizTitle,
        cefrLevel: item.level || 'B2',
        topic: 'AI sinh',
        difficulty: 'medium',
        authorName: item.approvedBy || item.createdBy || 'Hoàng Thị Mai',
        authorEmail: 'mai.ht@gmail.com',
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

  const flattened = publicItems.flat()
  return [...fallbackItems, ...flattened]
}

export function syncGeneratedContentToPublicModules() {
  return getApprovedAIContent()
}

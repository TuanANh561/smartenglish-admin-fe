/**
 * readingApi.js
 * ─────────────────────────────────────────────────────────────────────────────
 * API calls cho quản lý Ngân hàng Bài đọc Hiểu (Reading Passages)
 * Backend: content-service → /admin/reading-passages
 * Trực tiếp kết nối Backend chuẩn, không sử dụng mock/fallback
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { api } from '@/lib/api'

const BASE = '/admin/reading-passages'

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

function normalizePassage(item) {
  if (!item) return item
  return {
    ...item,
    id: item.id,
    cefrLevel: item.cefrLevel || 'B1',
    wordCount: item.wordCount ?? 0,
    estimatedMin: item.estimatedMin ?? 5,
    xpReward: item.xpReward ?? 30,
    questionCount: item.questionCount ?? (item.questions?.length || 0),
    keyVocabulary: item.keyVocabulary || [],
    questions: item.questions || [],
    status: item.status || 'published',
    deletedAt: item.deletedAt || null,
  }
}

// ─── List / Filter / Pagination ───────────────────────────────────────────────

/**
 * Lấy danh sách bài đọc có phân trang, tìm kiếm và lọc từ backend
 */
export async function getReadingPassages(params = {}) {
  const p = {}
  if (params.page !== undefined) p.page = params.page
  if (params.size !== undefined) p.size = params.size
  if (params.sortBy) p.sortBy = params.sortBy
  if (params.search?.trim()) p.search = params.search.trim()
  if (params.topic && params.topic !== 'Tất cả chủ đề' && params.topic !== 'ALL') p.topic = params.topic
  if (params.cefrLevel && params.cefrLevel !== 'ALL' && params.cefrLevel !== 'Tất cả') p.cefrLevel = params.cefrLevel
  if (params.status && params.status !== 'all') p.status = params.status
  if (params.trash !== undefined) p.trash = Boolean(params.trash)

  const res = await api.get(BASE, { params: p })
  const data = res?.data !== undefined ? res.data : res

  if (data && Array.isArray(data.items)) {
    return {
      ...data,
      items: data.items.map(normalizePassage),
    }
  }

  if (Array.isArray(data)) {
    return {
      items: data.map(normalizePassage),
      total: data.length,
      page: p.page || 1,
      size: p.size || 8,
      totalPages: Math.ceil(data.length / (p.size || 8)) || 1,
    }
  }

  return data
}

// ─── Topics ───────────────────────────────────────────────────────────────────

export async function getReadingTopics() {
  const res = await api.get(`${BASE}/topics`)
  const topics = res?.data !== undefined ? res.data : res
  return Array.isArray(topics) ? topics : []
}

// ─── Trash count ──────────────────────────────────────────────────────────────

export async function getReadingTrashCount() {
  const res = await api.get(`${BASE}/trash/count`)
  const count = res?.data !== undefined ? res.data : res
  return typeof count === 'number' ? count : Number(count) || 0
}

// ─── Get by ID ────────────────────────────────────────────────────────────────

export async function getReadingPassageById(id) {
  const res = await api.get(`${BASE}/${id}`)
  const item = res?.data !== undefined ? res.data : res
  return normalizePassage(item)
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createReadingPassage(data) {
  const payload = buildPayload(data)
  const res = await api.post(BASE, { data: payload })
  const created = res?.data !== undefined ? res.data : res
  return normalizePassage(created)
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateReadingPassage(id, data) {
  const payload = buildPayload(data)
  const res = await api.put(`${BASE}/${id}`, { data: payload })
  const updated = res?.data !== undefined ? res.data : res
  return normalizePassage(updated)
}

// ─── Toggle Publish ───────────────────────────────────────────────────────────

export async function togglePublishReadingPassage(id) {
  const res = await api.patch(`${BASE}/${id}/publish`)
  const updated = res?.data !== undefined ? res.data : res
  return normalizePassage(updated)
}

// ─── Duplicate ────────────────────────────────────────────────────────────────

export async function duplicateReadingPassage(id, authorInfo = {}) {
  const res = await api.post(`${BASE}/${id}/duplicate`, { data: authorInfo })
  const created = res?.data !== undefined ? res.data : res
  return normalizePassage(created)
}

// ─── Soft Delete ──────────────────────────────────────────────────────────────

export async function deleteReadingPassage(id) {
  return await api.del(`${BASE}/${id}`)
}

// ─── Restore ──────────────────────────────────────────────────────────────────

export async function restoreReadingPassage(id) {
  const res = await api.patch(`${BASE}/${id}/restore`)
  const restored = res?.data !== undefined ? res.data : res
  return normalizePassage(restored)
}

// ─── Permanent Delete ─────────────────────────────────────────────────────────

export async function permanentDeleteReadingPassage(id) {
  return await api.del(`${BASE}/${id}/permanent`)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildPayload(data) {
  return {
    titleVi: data.titleVi || '',
    titleEn: data.titleEn || '',
    topic: data.topic || 'General',
    cefrLevel: data.cefrLevel || 'B1',
    passageText: data.passageText || '',
    description: data.description || '',
    estimatedMin: data.estimatedMin ? Number(data.estimatedMin) : undefined,
    xpReward: data.xpReward ? Number(data.xpReward) : undefined,
    keyVocabulary: data.keyVocabulary || [],
    questions: data.questions || [],
    status: data.status || 'published',
    authorName: data.authorName || 'Quản trị viên Hệ thống',
    authorEmail: data.authorEmail || 'admin@smartenglish.vn',
  }
}

export { CEFR_LEVELS }

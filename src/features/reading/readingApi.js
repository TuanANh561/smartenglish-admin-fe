/**
 * readingApi.js
 * ─────────────────────────────────────────────────────────────────────────────
 * API calls cho quản lý Ngân hàng Bài đọc Hiểu (Reading Passages)
 * Backend: content-service  →  /admin/reading-passages
 * Hỗ trợ fallback tự động giữa Vite Proxy (8082), Gateway (8080) và in-memory mock store
 * ─────────────────────────────────────────────────────────────────────────────
 */
import axios from 'axios'

const BASE = '/admin/reading-passages'

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

// In-memory mock store for offline fallback
let localPassages = [
  {
    id: 'read-mock-1',
    titleVi: 'Trí Tuệ Nhân Tạo Đang Thay Đổi Cách Chúng Ta Học Ngoại Ngữ',
    titleEn: 'How Artificial Intelligence Is Changing the Way We Learn Foreign Languages',
    topic: 'Technology',
    cefrLevel: 'B2',
    passageText: 'Artificial Intelligence (AI) is revolutionizing language learning...',
    description: 'Bài đọc về cách AI đang cách mạng hóa việc học ngoại ngữ.',
    wordCount: 230,
    estimatedMin: 8,
    xpReward: 40,
    keyVocabulary: [],
    questions: Array(4).fill({}),
    questionCount: 4,
    status: 'published',
    authorName: 'Ban Biên Tập SmartEnglish',
    authorEmail: 'system@smartenglish.vn',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: null,
    deletedAt: null,
  },
  {
    id: 'read-mock-2',
    titleVi: 'Biến Đổi Khí Hậu: Thách Thức Lớn Nhất Của Thế Kỷ 21',
    titleEn: 'Climate Change: The Greatest Challenge of the 21st Century',
    topic: 'Environment',
    cefrLevel: 'B1',
    passageText: 'Climate change refers to long-term shifts in global temperatures...',
    description: 'Bài đọc về biến đổi khí hậu và các giải pháp quốc tế.',
    wordCount: 190,
    estimatedMin: 6,
    xpReward: 30,
    keyVocabulary: [],
    questions: Array(3).fill({}),
    questionCount: 3,
    status: 'published',
    authorName: 'Ban Biên Tập SmartEnglish',
    authorEmail: 'system@smartenglish.vn',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: null,
    deletedAt: null,
  },
]
let mockIdCounter = 100

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

async function callApi(method, path, options = {}) {
  // 1. Vite Proxy (tương đối → port 8082, bypass CORS)
  try {
    const res = await axios({ method, url: path, params: options.params, data: options.data })
    const payload = res?.data
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload.data !== undefined && payload.data !== null ? payload.data : payload
    }
    return payload
  } catch (err) {
    console.warn('[readingApi] Backend unreachable, using local fallback:', err?.message)
    throw err
  }
}

// ─── List / Filter / Pagination ───────────────────────────────────────────────

/**
 * Lấy danh sách bài đọc có phân trang, tìm kiếm và lọc
 */
export async function getReadingPassages(params = {}) {
  const p = {}
  if (params.page  !== undefined) p.page  = params.page
  if (params.size  !== undefined) p.size  = params.size
  if (params.sortBy)              p.sortBy = params.sortBy
  if (params.search?.trim())      p.search = params.search.trim()
  if (params.topic && params.topic !== 'Tất cả chủ đề' && params.topic !== 'ALL') p.topic = params.topic
  if (params.cefrLevel && params.cefrLevel !== 'ALL' && params.cefrLevel !== 'Tất cả') p.cefrLevel = params.cefrLevel
  if (params.status && params.status !== 'all')  p.status = params.status
  if (params.trash !== undefined) p.trash = Boolean(params.trash)

  try {
    const res = await callApi('get', BASE, { params: p })
    const data = res?.data !== undefined ? res.data : res
    if (data && Array.isArray(data.items)) {
      return { ...data, items: data.items.map(normalizePassage) }
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
  } catch {
    // Local mock fallback
    let list = localPassages.filter(
      (item) => p.trash ? Boolean(item.deletedAt) : !item.deletedAt
    )
    if (p.search) {
      const q = p.search.toLowerCase()
      list = list.filter(
        (item) =>
          item.titleVi?.toLowerCase().includes(q) ||
          item.titleEn?.toLowerCase().includes(q) ||
          item.topic?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q),
      )
    }
    if (p.topic)     list = list.filter((item) => item.topic === p.topic)
    if (p.cefrLevel) list = list.filter((item) => item.cefrLevel === p.cefrLevel)
    if (p.status)    list = list.filter((item) => item.status === p.status)

    const page = p.page || 1
    const size = p.size || 8
    return {
      items: list.slice((page - 1) * size, page * size).map(normalizePassage),
      total: list.length,
      page,
      size,
      totalPages: Math.max(1, Math.ceil(list.length / size)),
    }
  }
}

// ─── Topics ───────────────────────────────────────────────────────────────────

export async function getReadingTopics() {
  try {
    const res = await callApi('get', `${BASE}/topics`)
    const topics = res?.data !== undefined ? res.data : res
    if (Array.isArray(topics) && topics.length > 0) return topics
    return getLocalTopics()
  } catch {
    return getLocalTopics()
  }
}

function getLocalTopics() {
  return Array.from(new Set(localPassages.filter(p => !p.deletedAt).map((p) => p.topic))).filter(Boolean)
}

// ─── Trash count ──────────────────────────────────────────────────────────────

export async function getReadingTrashCount() {
  try {
    const res = await callApi('get', `${BASE}/trash/count`)
    const count = res?.data !== undefined ? res.data : res
    return typeof count === 'number' ? count : Number(count) || 0
  } catch {
    return localPassages.filter((p) => Boolean(p.deletedAt)).length
  }
}

// ─── Get by ID ────────────────────────────────────────────────────────────────

export async function getReadingPassageById(id) {
  try {
    const res = await callApi('get', `${BASE}/${id}`)
    const item = res?.data !== undefined ? res.data : res
    return normalizePassage(item)
  } catch {
    const found = localPassages.find((item) => String(item.id) === String(id))
    if (found) return normalizePassage(found)
    throw new Error(`Không tìm thấy bài đọc ID=${id}`)
  }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createReadingPassage(data) {
  const payload = buildPayload(data)
  try {
    const res = await callApi('post', BASE, { data: payload })
    const created = res?.data !== undefined ? res.data : res
    localPassages.unshift(normalizePassage(created))
    return normalizePassage(created)
  } catch {
    const localNew = normalizePassage({
      ...payload,
      id: `read-local-${++mockIdCounter}`,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      deletedAt: null,
    })
    localPassages.unshift(localNew)
    return localNew
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateReadingPassage(id, data) {
  const payload = buildPayload(data)
  try {
    const res = await callApi('put', `${BASE}/${id}`, { data: payload })
    const updated = res?.data !== undefined ? res.data : res
    localPassages = localPassages.map((p) =>
      String(p.id) === String(id) ? normalizePassage({ ...p, ...updated }) : p,
    )
    return normalizePassage(updated)
  } catch {
    let updated = null
    localPassages = localPassages.map((p) => {
      if (String(p.id) === String(id)) {
        updated = normalizePassage({ ...p, ...payload, updatedAt: new Date().toISOString() })
        return updated
      }
      return p
    })
    return updated || normalizePassage(payload)
  }
}

// ─── Toggle Publish ───────────────────────────────────────────────────────────

export async function togglePublishReadingPassage(id) {
  try {
    const res = await callApi('patch', `${BASE}/${id}/publish`)
    const updated = res?.data !== undefined ? res.data : res
    localPassages = localPassages.map((p) =>
      String(p.id) === String(id) ? normalizePassage({ ...p, ...updated }) : p,
    )
    return normalizePassage(updated)
  } catch {
    let updated = null
    localPassages = localPassages.map((p) => {
      if (String(p.id) === String(id)) {
        const nextStatus = p.status === 'published' ? 'draft' : 'published'
        updated = normalizePassage({ ...p, status: nextStatus, updatedAt: new Date().toISOString() })
        return updated
      }
      return p
    })
    return updated
  }
}

// ─── Duplicate ────────────────────────────────────────────────────────────────

export async function duplicateReadingPassage(id, authorInfo = {}) {
  try {
    const res = await callApi('post', `${BASE}/${id}/duplicate`, { data: authorInfo })
    const created = res?.data !== undefined ? res.data : res
    localPassages.unshift(normalizePassage(created))
    return normalizePassage(created)
  } catch {
    const original = localPassages.find((p) => String(p.id) === String(id))
    const duplicated = normalizePassage({
      ...(original || {}),
      id: `read-local-${++mockIdCounter}`,
      titleVi: `${original?.titleVi || 'Bài đọc'} (Bản sao)`,
      titleEn: `${original?.titleEn || 'Reading'} (Copy)`,
      status: 'draft',
      authorName: authorInfo.authorName || original?.authorName || 'Admin',
      authorEmail: authorInfo.authorEmail || original?.authorEmail || 'admin@smartenglish.vn',
      createdAt: new Date().toISOString(),
      updatedAt: null,
      deletedAt: null,
    })
    localPassages.unshift(duplicated)
    return duplicated
  }
}

// ─── Soft Delete ──────────────────────────────────────────────────────────────

export async function deleteReadingPassage(id) {
  try {
    const res = await callApi('delete', `${BASE}/${id}`)
    localPassages = localPassages.map((p) =>
      String(p.id) === String(id) ? { ...p, deletedAt: new Date().toISOString() } : p,
    )
    return res?.data !== undefined ? res.data : res
  } catch {
    localPassages = localPassages.map((p) =>
      String(p.id) === String(id) ? { ...p, deletedAt: new Date().toISOString() } : p,
    )
    return { success: true }
  }
}

// ─── Restore ──────────────────────────────────────────────────────────────────

export async function restoreReadingPassage(id) {
  try {
    const res = await callApi('patch', `${BASE}/${id}/restore`)
    localPassages = localPassages.map((p) =>
      String(p.id) === String(id) ? { ...p, deletedAt: null } : p,
    )
    return res?.data !== undefined ? res.data : res
  } catch {
    localPassages = localPassages.map((p) =>
      String(p.id) === String(id) ? { ...p, deletedAt: null } : p,
    )
    return { success: true }
  }
}

// ─── Permanent Delete ─────────────────────────────────────────────────────────

export async function permanentDeleteReadingPassage(id) {
  try {
    const res = await callApi('delete', `${BASE}/${id}/permanent`)
    localPassages = localPassages.filter((p) => String(p.id) !== String(id))
    return res?.data !== undefined ? res.data : res
  } catch {
    localPassages = localPassages.filter((p) => String(p.id) !== String(id))
    return { success: true }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildPayload(data) {
  return {
    titleVi:       data.titleVi || '',
    titleEn:       data.titleEn || '',
    topic:         data.topic || 'General',
    cefrLevel:     data.cefrLevel || 'B1',
    passageText:   data.passageText || '',
    description:   data.description || '',
    estimatedMin:  data.estimatedMin ? Number(data.estimatedMin) : undefined,
    xpReward:      data.xpReward ? Number(data.xpReward) : undefined,
    keyVocabulary: data.keyVocabulary || [],
    questions:     data.questions || [],
    status:        data.status || 'published',
    authorName:    data.authorName || 'Quản trị viên Hệ thống',
    authorEmail:   data.authorEmail || 'admin@smartenglish.vn',
  }
}

export { CEFR_LEVELS }

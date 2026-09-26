/**
 * grammarLessonApi.js
 * ─────────────────────────────────────────────────────────────────────────────
 * API calls cho quản lý Ngân hàng Bài học Ngữ pháp
 * Backend: content-service  →  /admin/grammar-lessons
 * Hỗ trợ fallback tự động giữa Vite Proxy (8082), Gateway (8080) và in-memory mock store
 * ─────────────────────────────────────────────────────────────────────────────
 */
import axios from 'axios'
import { api } from '@/lib/api'
import { grammarLessons as MOCK_LESSONS, GRAMMAR_TOPICS } from '@/mocks/data/grammar'

const BASE = '/admin/grammar-lessons'

// In-memory mock store initialized from mock data
let localLessons = [...MOCK_LESSONS]

function normalizeLesson(item) {
  if (!item) return item
  const lvl = item.cefrLevel || item.level || 'B1'
  return {
    ...item,
    id: item.id,
    level: lvl,
    cefrLevel: lvl,
    exerciseCount: item.exerciseCount ?? (item.sampleExercises?.length || 0),
    examples: item.examples || [],
    keyRules: item.keyRules || [],
    sampleExercises: item.sampleExercises || [],
  }
}

async function callContentApi(method, path, options = {}) {
  // 1. Ưu tiên gọi qua Vite Proxy (url tương đối, Vite chuyển tiếp sang 8082 không bị chặn CORS)
  try {
    const res = await axios({
      method,
      url: path,
      params: options.params,
      data: options.data,
      headers: options.headers,
    })
    const payload = res?.data
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload.data !== undefined && payload.data !== null ? payload.data : payload
    }
    return payload
  } catch (proxyErr) {
    // 2. Fallback qua Gateway trung tâm (8080)
    try {
      const res = await api[method](path, options)
      return res?.data !== undefined ? res.data : res
    } catch (gatewayErr) {
      console.warn('[grammarLessonApi] Lỗi khi gọi API qua Proxy/Gateway, chuyển sang fallback:', proxyErr?.message)
      throw proxyErr
    }
  }
}

/**
 * Lấy danh sách bài học ngữ pháp có phân trang, tìm kiếm và lọc
 * @param {{ search?, topic?, cefrLevel?, status?, sortBy?, page?, size? }} params
 */
export async function getGrammarLessons(params = {}) {
  const p = {}
  if (params.page !== undefined) p.page = params.page
  if (params.size !== undefined) p.size = params.size
  if (params.sortBy) p.sortBy = params.sortBy
  if (params.search?.trim()) p.search = params.search.trim()
  if (params.topic && params.topic !== 'Tất cả chủ điểm' && params.topic !== 'ALL') {
    p.topic = params.topic
  }
  if (params.cefrLevel && params.cefrLevel !== 'ALL' && params.cefrLevel !== 'Tất cả') {
    p.cefrLevel = params.cefrLevel
  }
  if (params.status && params.status !== 'all') {
    p.status = params.status
  }
  if (params.trash !== undefined) {
    p.trash = Boolean(params.trash)
  }

  try {
    const res = await callContentApi('get', BASE, { params: p })
    const data = res?.data !== undefined ? res.data : res
    if (data && Array.isArray(data.items)) {
      return {
        ...data,
        items: data.items.map(normalizeLesson),
      }
    }
    if (Array.isArray(data)) {
      return {
        items: data.map(normalizeLesson),
        total: data.length,
        page: p.page || 1,
        size: p.size || 8,
        totalPages: Math.ceil(data.length / (p.size || 8)) || 1,
      }
    }
    return data
  } catch (err) {
    // Mock fallback nếu backend chưa kết nối được
    let list = [...localLessons]
    if (p.search) {
      const q = p.search.toLowerCase()
      list = list.filter(item =>
        item.title?.toLowerCase().includes(q) ||
        item.topic?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
      )
    }
    if (p.topic) {
      list = list.filter(item => item.topic === p.topic)
    }
    if (p.cefrLevel) {
      list = list.filter(item => item.level === p.cefrLevel || item.cefrLevel === p.cefrLevel)
    }
    if (p.status) {
      list = list.filter(item => item.status === p.status)
    }

    const page = p.page || 1
    const size = p.size || 8
    const total = list.length
    const totalPages = Math.max(1, Math.ceil(total / size))
    const items = list.slice((page - 1) * size, page * size).map(normalizeLesson)

    return {
      items,
      total,
      page,
      size,
      totalPages,
    }
  }
}

/**
 * Lấy danh sách các chủ điểm ngữ pháp
 */
export async function getGrammarTopics() {
  try {
    const res = await callContentApi('get', `${BASE}/topics`)
    const topics = res?.data !== undefined ? res.data : res
    if (Array.isArray(topics) && topics.length > 0) return topics
    return GRAMMAR_TOPICS.filter(t => t !== 'Tất cả chủ điểm')
  } catch {
    const distinctTopics = Array.from(new Set(localLessons.map(l => l.topic))).filter(Boolean)
    return distinctTopics.length > 0 ? distinctTopics : GRAMMAR_TOPICS.filter(t => t !== 'Tất cả chủ điểm')
  }
}

/**
 * Lấy chi tiết bài học ngữ pháp theo ID
 */
export async function getGrammarLessonById(id) {
  try {
    const res = await callContentApi('get', `${BASE}/${id}`)
    const item = res?.data !== undefined ? res.data : res
    return normalizeLesson(item)
  } catch (err) {
    const found = localLessons.find(item => String(item.id) === String(id))
    if (found) return normalizeLesson(found)
    throw err
  }
}

/**
 * Tạo mới bài học ngữ pháp
 */
export async function createGrammarLesson(data) {
  const payload = {
    title: data.title,
    topic: data.topic,
    cefrLevel: data.cefrLevel || data.level || 'B1',
    description: data.description || '',
    formula: data.formula || '',
    keyRules: Array.isArray(data.keyRules)
      ? data.keyRules
      : typeof data.keyRules === 'string'
      ? data.keyRules.split('\n').map(s => s.trim()).filter(Boolean)
      : [],
    examples: data.examples || [],
    sampleExercises: data.sampleExercises || data.questions || [],
    exerciseCount: (data.sampleExercises || data.questions || []).length,
    status: data.status || 'published',
    authorName: data.authorName || 'Quản trị viên Hệ thống',
    authorEmail: data.authorEmail || 'admin@smartenglish.com',
  }

  try {
    const res = await callContentApi('post', BASE, { data: payload })
    const created = res?.data !== undefined ? res.data : res
    localLessons.unshift(normalizeLesson(created))
    return normalizeLesson(created)
  } catch (err) {
    const localNew = normalizeLesson({
      ...payload,
      id: `gram-${Date.now()}`,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    })
    localLessons.unshift(localNew)
    return localNew
  }
}

/**
 * Cập nhật bài học ngữ pháp theo ID
 */
export async function updateGrammarLesson(id, data) {
  const payload = {
    title: data.title,
    topic: data.topic,
    cefrLevel: data.cefrLevel || data.level || 'B1',
    description: data.description || '',
    formula: data.formula || '',
    keyRules: Array.isArray(data.keyRules)
      ? data.keyRules
      : typeof data.keyRules === 'string'
      ? data.keyRules.split('\n').map(s => s.trim()).filter(Boolean)
      : [],
    examples: data.examples || [],
    sampleExercises: data.sampleExercises || data.questions || [],
    exerciseCount: (data.sampleExercises || data.questions || []).length,
    status: data.status,
    authorName: data.authorName,
    authorEmail: data.authorEmail,
  }

  try {
    const res = await callContentApi('put', `${BASE}/${id}`, { data: payload })
    const updated = res?.data !== undefined ? res.data : res
    localLessons = localLessons.map(l => String(l.id) === String(id) ? normalizeLesson({ ...l, ...updated }) : l)
    return normalizeLesson(updated)
  } catch (err) {
    let updated = null
    localLessons = localLessons.map(l => {
      if (String(l.id) === String(id)) {
        updated = normalizeLesson({
          ...l,
          ...payload,
          updatedAt: new Date().toISOString(),
        })
        return updated
      }
      return l
    })
    return updated || normalizeLesson(payload)
  }
}

/**
 * Toggle trạng thái publish / draft
 */
export async function togglePublishGrammarLesson(id) {
  try {
    const res = await callContentApi('patch', `${BASE}/${id}/publish`)
    const updated = res?.data !== undefined ? res.data : res
    localLessons = localLessons.map(l => String(l.id) === String(id) ? normalizeLesson({ ...l, ...updated }) : l)
    return normalizeLesson(updated)
  } catch (err) {
    let updated = null
    localLessons = localLessons.map(l => {
      if (String(l.id) === String(id)) {
        const nextStatus = l.status === 'published' ? 'draft' : 'published'
        updated = normalizeLesson({ ...l, status: nextStatus, updatedAt: new Date().toISOString() })
        return updated
      }
      return l
    })
    return updated
  }
}

/**
 * Nhân bản bài học ngữ pháp
 */
export async function duplicateGrammarLesson(id, authorInfo = {}) {
  try {
    const res = await callContentApi('post', `${BASE}/${id}/duplicate`, { data: authorInfo })
    const created = res?.data !== undefined ? res.data : res
    localLessons.unshift(normalizeLesson(created))
    return normalizeLesson(created)
  } catch (err) {
    const original = localLessons.find(l => String(l.id) === String(id))
    const duplicated = normalizeLesson({
      ...(original || {}),
      id: `gram-${Date.now()}`,
      title: `${original?.title || 'Bài học'} (Bản sao)`,
      status: 'draft',
      authorName: authorInfo.authorName || 'Quản trị viên Hệ thống',
      authorEmail: authorInfo.authorEmail || 'admin@smartenglish.com',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    })
    localLessons.unshift(duplicated)
    return duplicated
  }
}

/**
 * Xóa bài học ngữ pháp theo ID (xóa mềm - chuyển vào thùng rác)
 */
export async function deleteGrammarLesson(id) {
  try {
    const res = await callContentApi('delete', `${BASE}/${id}`)
    localLessons = localLessons.map(l => String(l.id) === String(id) ? { ...l, deletedAt: new Date().toISOString() } : l)
    return res?.data !== undefined ? res.data : res
  } catch (err) {
    localLessons = localLessons.map(l => String(l.id) === String(id) ? { ...l, deletedAt: new Date().toISOString() } : l)
    return { success: true }
  }
}

/**
 * Khôi phục bài học ngữ pháp từ thùng rác
 */
export async function restoreGrammarLesson(id) {
  try {
    const res = await callContentApi('patch', `${BASE}/${id}/restore`)
    localLessons = localLessons.map(l => String(l.id) === String(id) ? { ...l, deletedAt: null } : l)
    return res?.data !== undefined ? res.data : res
  } catch (err) {
    localLessons = localLessons.map(l => String(l.id) === String(id) ? { ...l, deletedAt: null } : l)
    return { success: true }
  }
}

/**
 * Xóa vĩnh viễn bài học ngữ pháp khỏi cơ sở dữ liệu
 */
export async function permanentDeleteGrammarLesson(id) {
  try {
    const res = await callContentApi('delete', `${BASE}/${id}/permanent`)
    localLessons = localLessons.filter(l => String(l.id) !== String(id))
    return res?.data !== undefined ? res.data : res
  } catch (err) {
    localLessons = localLessons.filter(l => String(l.id) !== String(id))
    return { success: true }
  }
}

/**
 * Lấy số lượng bài học ngữ pháp trong thùng rác
 */
export async function getGrammarTrashCount() {
  try {
    const res = await callContentApi('get', `${BASE}/trash/count`)
    const count = res?.data !== undefined ? res.data : res
    return typeof count === 'number' ? count : (Number(count) || 0)
  } catch (err) {
    const count = localLessons.filter(l => Boolean(l.deletedAt)).length
    return count
  }
}


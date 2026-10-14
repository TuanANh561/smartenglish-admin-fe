/**
 * grammarLessonApi.js
 * ─────────────────────────────────────────────────────────────────────────────
 * API client kết nối trực tiếp tới content-service (/admin/grammar-lessons)
 * Đã kết nối với Database PostgreSQL thật, KHÔNG sử dụng mock data.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import axios from 'axios'
import { api } from '@/lib/api'

const BASE = '/admin/grammar-lessons'

export const DEFAULT_GRAMMAR_TOPICS = [
  'Các thì trong tiếng Anh',
  'Câu điều kiện (Conditionals)',
  'Câu bị động (Passive Voice)',
  'Mệnh đề quan hệ (Relative Clauses)',
  'Động từ khiếm khuyết (Modal Verbs)',
  'Câu gián tiếp (Reported Speech)',
  'Danh động từ & Động từ nguyên mẫu',
  'Mạo từ (Articles a/an/the)',
  'So sánh (Comparisons)',
  'Cụm giới từ & Liên từ',
]

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
  // 1. Ưu tiên gọi qua Vite Proxy
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
      console.error('[grammarLessonApi] Lỗi khi gọi API:', proxyErr?.message || gatewayErr?.message)
      throw proxyErr
    }
  }
}

/**
 * Lấy danh sách bài học ngữ pháp có phân trang, tìm kiếm và lọc
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
    return data || { items: [], total: 0, page: 1, size: 8, totalPages: 1 }
  } catch (err) {
    console.error('[grammarLessonApi] Lỗi getGrammarLessons:', err)
    return {
      items: [],
      total: 0,
      page: p.page || 1,
      size: p.size || 8,
      totalPages: 1,
    }
  }
}

/**
 * Lấy danh sách các chủ điểm ngữ pháp từ database
 */
export async function getGrammarTopics() {
  try {
    const res = await callContentApi('get', `${BASE}/topics`)
    const topics = res?.data !== undefined ? res.data : res
    if (Array.isArray(topics) && topics.length > 0) return topics
    return DEFAULT_GRAMMAR_TOPICS
  } catch (err) {
    console.warn('[grammarLessonApi] Không thể tải danh mục chủ điểm từ backend:', err.message)
    return DEFAULT_GRAMMAR_TOPICS
  }
}

/**
 * Lấy chi tiết bài học ngữ pháp theo ID
 */
export async function getGrammarLessonById(id) {
  const res = await callContentApi('get', `${BASE}/${id}`)
  const item = res?.data !== undefined ? res.data : res
  return normalizeLesson(item)
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

  const res = await callContentApi('post', BASE, { data: payload })
  const created = res?.data !== undefined ? res.data : res
  return normalizeLesson(created)
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

  const res = await callContentApi('put', `${BASE}/${id}`, { data: payload })
  const updated = res?.data !== undefined ? res.data : res
  return normalizeLesson(updated)
}

/**
 * Toggle trạng thái publish / draft
 */
export async function togglePublishGrammarLesson(id) {
  const res = await callContentApi('patch', `${BASE}/${id}/publish`)
  const updated = res?.data !== undefined ? res.data : res
  return normalizeLesson(updated)
}

/**
 * Nhân bản bài học ngữ pháp
 */
export async function duplicateGrammarLesson(id, authorInfo = {}) {
  const res = await callContentApi('post', `${BASE}/${id}/duplicate`, { data: authorInfo })
  const created = res?.data !== undefined ? res.data : res
  return normalizeLesson(created)
}

/**
 * Xóa bài học ngữ pháp theo ID (xóa mềm - chuyển vào thùng rác)
 */
export async function deleteGrammarLesson(id) {
  const res = await callContentApi('delete', `${BASE}/${id}`)
  return res?.data !== undefined ? res.data : res
}

/**
 * Khôi phục bài học ngữ pháp từ thùng rác
 */
export async function restoreGrammarLesson(id) {
  const res = await callContentApi('patch', `${BASE}/${id}/restore`)
  return res?.data !== undefined ? res.data : res
}

/**
 * Xóa vĩnh viễn bài học ngữ pháp khỏi cơ sở dữ liệu
 */
export async function permanentDeleteGrammarLesson(id) {
  const res = await callContentApi('delete', `${BASE}/${id}/permanent`)
  return res?.data !== undefined ? res.data : res
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
    return 0
  }
}

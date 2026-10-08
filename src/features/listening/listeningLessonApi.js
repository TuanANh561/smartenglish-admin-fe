/**
 * listeningLessonApi.js
 * ─────────────────────────────────────────────────────────────────────────────
 * API calls cho Quản lý Ngân hàng Học liệu Bài nghe (Listening Lessons)
 * Backend: content-service → /admin/listening-lessons
 * Trực tiếp kết nối Backend chuẩn, không sử dụng mock/fallback
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { api } from '@/lib/api'

const BASE = '/admin/listening-lessons'

function normalizeLesson(item) {
  if (!item) return item
  const lvl = item.cefrLevel || item.level || 'B1'
  return {
    ...item,
    id: item.id,
    level: lvl,
    cefrLevel: lvl,
    category: item.category || 'CONVERSATION',
    questions: item.questions || [],
    syncedTranscripts: item.syncedTranscripts || [],
    waveform: item.waveform || [8, 16, 12, 22, 15, 9, 20, 14, 25, 11, 18, 13, 7, 19, 10],
    duration: item.duration || '01:00',
    durationSec: item.durationSec || 60,
    accent: item.accent || 'US Accent',
    status: item.status || 'published',
  }
}

/**
 * Lấy danh sách bài nghe có phân trang, tìm kiếm và lọc từ backend
 * @param {{ search?, category?, topic?, cefrLevel?, accent?, status?, sortBy?, page?, size?, trash? }} params
 */
export async function getListeningLessons(params = {}) {
  const p = {}
  if (params.page !== undefined) p.page = params.page
  if (params.size !== undefined) p.size = params.size
  if (params.sortBy) p.sortBy = params.sortBy
  if (params.search?.trim()) p.search = params.search.trim()
  if (params.category && params.category !== 'all' && params.category !== 'ALL') {
    p.category = params.category
  }
  if (params.topic && params.topic !== 'all' && params.topic !== 'ALL') {
    p.topic = params.topic
  }
  if (params.cefrLevel && params.cefrLevel !== 'all' && params.cefrLevel !== 'ALL') {
    p.cefrLevel = params.cefrLevel
  }
  if (params.accent && params.accent !== 'all' && params.accent !== 'ALL') {
    p.accent = params.accent
  }
  if (params.status && params.status !== 'all') {
    p.status = params.status
  }
  if (params.trash !== undefined) {
    p.trash = Boolean(params.trash)
  }

  const res = await api.get(BASE, { params: p })
  const data = res?.data !== undefined ? res.data : res

  if (data?.items) {
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
      size: p.size || 10,
      totalPages: Math.ceil(data.length / (p.size || 10)) || 1,
    }
  }

  return data
}

/**
 * Lấy chi tiết bài nghe theo ID
 */
export async function getListeningLessonById(id) {
  const res = await api.get(`${BASE}/${id}`)
  const data = res?.data !== undefined ? res.data : res
  return normalizeLesson(data)
}

/**
 * Tạo bài nghe mới
 */
export async function createListeningLesson(lessonData, authorInfo = {}) {
  const headers = {}
  if (authorInfo.authorName) headers['X-User-Name'] = authorInfo.authorName
  if (authorInfo.authorEmail) headers['X-User-Email'] = authorInfo.authorEmail

  const res = await api.post(BASE, { data: lessonData, headers })
  const data = res?.data !== undefined ? res.data : res
  return normalizeLesson(data)
}

/**
 * Cập nhật bài nghe
 */
export async function updateListeningLesson(id, lessonData) {
  const res = await api.put(`${BASE}/${id}`, { data: lessonData })
  const data = res?.data !== undefined ? res.data : res
  return normalizeLesson(data)
}

/**
 * Toggle trạng thái xuất bản
 */
export async function toggleListeningPublish(id) {
  const res = await api.patch(`${BASE}/${id}/publish`)
  const data = res?.data !== undefined ? res.data : res
  return normalizeLesson(data)
}

/**
 * Nhân bản bài nghe
 */
export async function duplicateListeningLesson(id, authorInfo = {}) {
  const headers = {}
  if (authorInfo.authorName) headers['X-User-Name'] = authorInfo.authorName
  if (authorInfo.authorEmail) headers['X-User-Email'] = authorInfo.authorEmail

  const res = await api.post(`${BASE}/${id}/duplicate`, { headers })
  const data = res?.data !== undefined ? res.data : res
  return normalizeLesson(data)
}

/**
 * Xóa mềm bài nghe (chuyển vào thùng rác)
 */
export async function deleteListeningLesson(id, authorName = 'Admin') {
  const headers = { 'X-User-Name': authorName }
  return await api.del(`${BASE}/${id}`, { headers })
}

/**
 * Khôi phục bài nghe từ thùng rác
 */
export async function restoreListeningLesson(id) {
  const res = await api.patch(`${BASE}/${id}/restore`)
  const data = res?.data !== undefined ? res.data : res
  return normalizeLesson(data)
}

/**
 * Xóa vĩnh viễn bài nghe
 */
export async function permanentDeleteListeningLesson(id) {
  return await api.del(`${BASE}/${id}/permanent`)
}

/**
 * Lấy số liệu thống kê bài nghe
 */
export async function getListeningStatistics() {
  const res = await api.get(`${BASE}/statistics`)
  const data = res?.data !== undefined ? res.data : res
  return data || { total: 0, published: 0, draft: 0, review: 0, trash: 0 }
}

/**
 * Lấy danh sách topics
 */
export async function getListeningTopics() {
  const res = await api.get(`${BASE}/topics`)
  const data = res?.data !== undefined ? res.data : res
  return Array.isArray(data) ? data : []
}

/**
 * Lấy danh sách categories (TOEIC Parts, Conversations,...)
 */
export async function getListeningCategories() {
  const res = await api.get(`${BASE}/categories`)
  const data = res?.data !== undefined ? res.data : res
  return Array.isArray(data) ? data : []
}

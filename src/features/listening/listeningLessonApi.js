/**
 * listeningLessonApi.js
 * ─────────────────────────────────────────────────────────────────────────────
 * API calls cho Quản lý Ngân hàng Học liệu Bài nghe (Listening Lessons)
 * Backend: content-service → /admin/listening-lessons
 * Hỗ trợ fallback tự động giữa Vite Proxy (8082), Gateway (8080) và in-memory mock store
 * ─────────────────────────────────────────────────────────────────────────────
 */
import axios from 'axios'
import { api } from '@/lib/api'
import { listeningLessons as MOCK_LESSONS } from '@/mocks/data/listening'

const BASE = '/admin/listening-lessons'

// In-memory fallback store initialized with mock data
let localLessons = [...MOCK_LESSONS]

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
      console.warn('[listeningLessonApi] Lỗi khi gọi API qua Proxy/Gateway, chuyển sang fallback:', proxyErr?.message)
      throw proxyErr
    }
  }
}

/**
 * Lấy danh sách bài nghe có phân trang, tìm kiếm và lọc
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

  try {
    const data = await callContentApi('get', BASE, { params: p })
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
        totalPages: 1,
      }
    }
  } catch (err) {
    console.warn('[listeningLessonApi] Fallback sang local in-memory store:', err.message)
  }

  // Local fallback
  let list = localLessons.filter((item) => {
    const isDeleted = Boolean(item.isDeleted)
    if (p.trash ? !isDeleted : isDeleted) return false

    if (p.category && item.category !== p.category) return false
    if (p.topic && item.topic !== p.topic) return false
    if (p.cefrLevel && item.cefrLevel !== p.cefrLevel && item.level !== p.cefrLevel) return false
    if (p.accent && item.accent !== p.accent) return false
    if (p.status && item.status !== p.status) return false

    if (p.search) {
      const q = p.search.toLowerCase()
      const match =
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.topic?.toLowerCase().includes(q) ||
        item.transcript?.toLowerCase().includes(q)
      if (!match) return false
    }
    return true
  })

  const page = p.page || 1
  const size = p.size || 10
  const total = list.length
  const totalPages = Math.max(1, Math.ceil(total / size))
  const start = (page - 1) * size
  const items = list.slice(start, start + size).map(normalizeLesson)

  return { items, total, page, size, totalPages }
}

/**
 * Lấy chi tiết bài nghe theo ID
 */
export async function getListeningLessonById(id) {
  try {
    const data = await callContentApi('get', `${BASE}/${id}`)
    if (data) return normalizeLesson(data)
  } catch (err) {
    console.warn('[listeningLessonApi] Fallback getById:', err.message)
  }

  const found = localLessons.find((l) => String(l.id) === String(id))
  if (found) return normalizeLesson(found)
  throw new Error('Không tìm thấy bài nghe với ID: ' + id)
}

/**
 * Tạo bài nghe mới
 */
export async function createListeningLesson(lessonData, authorInfo = {}) {
  const headers = {}
  if (authorInfo.authorName) headers['X-User-Name'] = authorInfo.authorName
  if (authorInfo.authorEmail) headers['X-User-Email'] = authorInfo.authorEmail

  try {
    const data = await callContentApi('post', BASE, { data: lessonData, headers })
    if (data) return normalizeLesson(data)
  } catch (err) {
    console.warn('[listeningLessonApi] Fallback createLesson:', err.message)
  }

  const newId = Date.now()
  const created = normalizeLesson({
    ...lessonData,
    id: newId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorName: authorInfo.authorName || 'Admin',
    authorEmail: authorInfo.authorEmail || 'admin@smartenglish.vn',
    isDeleted: false,
  })
  localLessons.unshift(created)
  return created
}

/**
 * Cập nhật bài nghe
 */
export async function updateListeningLesson(id, lessonData) {
  try {
    const data = await callContentApi('put', `${BASE}/${id}`, { data: lessonData })
    if (data) return normalizeLesson(data)
  } catch (err) {
    console.warn('[listeningLessonApi] Fallback updateLesson:', err.message)
  }

  const idx = localLessons.findIndex((l) => String(l.id) === String(id))
  if (idx !== -1) {
    localLessons[idx] = normalizeLesson({
      ...localLessons[idx],
      ...lessonData,
      updatedAt: new Date().toISOString(),
    })
    return localLessons[idx]
  }
  throw new Error('Không tìm thấy bài nghe để cập nhật: ' + id)
}

/**
 * Toggle trạng thái xuất bản
 */
export async function toggleListeningPublish(id) {
  try {
    const data = await callContentApi('patch', `${BASE}/${id}/publish`)
    if (data) return normalizeLesson(data)
  } catch (err) {
    console.warn('[listeningLessonApi] Fallback togglePublish:', err.message)
  }

  const idx = localLessons.findIndex((l) => String(l.id) === String(id))
  if (idx !== -1) {
    const current = localLessons[idx]
    const nextStatus = current.status === 'published' ? 'draft' : 'published'
    localLessons[idx] = { ...current, status: nextStatus, updatedAt: new Date().toISOString() }
    return normalizeLesson(localLessons[idx])
  }
  throw new Error('Không tìm thấy bài nghe để đổi trạng thái: ' + id)
}

/**
 * Nhân bản bài nghe
 */
export async function duplicateListeningLesson(id, authorInfo = {}) {
  const headers = {}
  if (authorInfo.authorName) headers['X-User-Name'] = authorInfo.authorName
  if (authorInfo.authorEmail) headers['X-User-Email'] = authorInfo.authorEmail

  try {
    const data = await callContentApi('post', `${BASE}/${id}/duplicate`, { headers })
    if (data) return normalizeLesson(data)
  } catch (err) {
    console.warn('[listeningLessonApi] Fallback duplicateLesson:', err.message)
  }

  const original = localLessons.find((l) => String(l.id) === String(id))
  if (!original) throw new Error('Không tìm thấy bài nghe gốc để nhân bản: ' + id)

  const copy = normalizeLesson({
    ...original,
    id: Date.now(),
    title: original.title + ' (Bản sao)',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorName: authorInfo.authorName || original.authorName,
    authorEmail: authorInfo.authorEmail || original.authorEmail,
    isDeleted: false,
  })
  localLessons.unshift(copy)
  return copy
}

/**
 * Xóa mềm bài nghe (chuyển vào thùng rác)
 */
export async function deleteListeningLesson(id, authorName = 'Admin') {
  const headers = { 'X-User-Name': authorName }
  try {
    await callContentApi('delete', `${BASE}/${id}`, { headers })
    return true
  } catch (err) {
    console.warn('[listeningLessonApi] Fallback deleteLesson:', err.message)
  }

  const idx = localLessons.findIndex((l) => String(l.id) === String(id))
  if (idx !== -1) {
    localLessons[idx] = { ...localLessons[idx], isDeleted: true, deletedAt: new Date().toISOString() }
    return true
  }
  return false
}

/**
 * Khôi phục bài nghe từ thùng rác
 */
export async function restoreListeningLesson(id) {
  try {
    const data = await callContentApi('patch', `${BASE}/${id}/restore`)
    if (data) return normalizeLesson(data)
  } catch (err) {
    console.warn('[listeningLessonApi] Fallback restoreLesson:', err.message)
  }

  const idx = localLessons.findIndex((l) => String(l.id) === String(id))
  if (idx !== -1) {
    localLessons[idx] = { ...localLessons[idx], isDeleted: false, deletedAt: null }
    return normalizeLesson(localLessons[idx])
  }
  throw new Error('Không tìm thấy bài nghe để khôi phục: ' + id)
}

/**
 * Xóa vĩnh viễn bài nghe
 */
export async function permanentDeleteListeningLesson(id) {
  try {
    await callContentApi('delete', `${BASE}/${id}/permanent`)
    return true
  } catch (err) {
    console.warn('[listeningLessonApi] Fallback permanentDeleteLesson:', err.message)
  }

  localLessons = localLessons.filter((l) => String(l.id) !== String(id))
  return true
}

/**
 * Lấy số liệu thống kê bài nghe
 */
export async function getListeningStatistics() {
  try {
    const data = await callContentApi('get', `${BASE}/statistics`)
    if (data) return data
  } catch (err) {
    console.warn('[listeningLessonApi] Fallback getStatistics:', err.message)
  }

  const published = localLessons.filter((l) => !l.isDeleted && l.status === 'published').length
  const draft = localLessons.filter((l) => !l.isDeleted && l.status === 'draft').length
  const trash = localLessons.filter((l) => l.isDeleted).length
  return {
    total: published + draft,
    published,
    draft,
    review: 0,
    trash,
  }
}

/**
 * Lấy danh sách topics
 */
export async function getListeningTopics() {
  try {
    const data = await callContentApi('get', `${BASE}/topics`)
    if (Array.isArray(data) && data.length > 0) return data
  } catch (err) {
    console.warn('[listeningLessonApi] Fallback getTopics:', err.message)
  }
  return [
    'Kinh doanh',
    'Du lịch & Khách sạn',
    'Công việc & Phỏng vấn',
    'Đời sống hàng ngày',
    'Công nghệ & Đổi mới',
    'Học tập & Giáo dục',
  ]
}

/**
 * Lấy danh sách categories (TOEIC Parts, Conversations,...)
 */
export async function getListeningCategories() {
  try {
    const data = await callContentApi('get', `${BASE}/categories`)
    if (Array.isArray(data) && data.length > 0) return data
  } catch (err) {
    console.warn('[listeningLessonApi] Fallback getCategories:', err.message)
  }
  return [
    'TOEIC_PART_1',
    'TOEIC_PART_2',
    'TOEIC_PART_3',
    'TOEIC_PART_4',
    'CONVERSATION',
    'SHORT_TALK',
    'NEWS_PODCAST',
    'DICTATION',
  ]
}

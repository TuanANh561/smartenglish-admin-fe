/**
 * pronunciationLessonApi.js
 * ─────────────────────────────────────────────────────────────────────────────
 * API calls cho quản lý Ngân hàng Bài phát âm IPA
 * Backend: content-service  →  /admin/pronunciation-lessons
 * Hỗ trợ fallback tự động giữa Gateway (8080) và trực tiếp content-service (8082)
 * ─────────────────────────────────────────────────────────────────────────────
 */
import axios from 'axios'
import { api } from '@/lib/api'

const BASE = '/admin/pronunciation-lessons'

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
      console.error('Lỗi khi gọi API bài học phát âm:', proxyErr, gatewayErr)
      throw proxyErr
    }
  }
}

/**
 * Lấy danh sách bài phát âm có phân trang, tìm kiếm và lọc
 * @param {{ search?, category?, cefrLevel?, status?, sortBy?, page?, size? }} params
 */
export async function getPronunciationLessons(params = {}) {
  const p = {}
  if (params.page !== undefined) p.page = params.page
  if (params.size !== undefined) p.size = params.size
  if (params.sortBy) p.sortBy = params.sortBy
  if (params.search?.trim()) p.search = params.search.trim()
  if (params.category && params.category !== 'Tất cả phân loại' && params.category !== 'ALL') {
    p.category = params.category
  }
  if (params.cefrLevel && params.cefrLevel !== 'ALL' && params.cefrLevel !== 'Tất cả') {
    p.cefrLevel = params.cefrLevel
  }
  if (params.status && params.status !== 'all') {
    p.status = params.status
  }

  const res = await callContentApi('get', BASE, { params: p })
  return res?.data !== undefined ? res.data : res
}

/**
 * Lấy chi tiết bài phát âm theo ID
 */
export async function getPronunciationLessonById(id) {
  const res = await callContentApi('get', `${BASE}/${id}`)
  return res?.data !== undefined ? res.data : res
}

/**
 * Tạo mới bài phát âm
 * @param {Object} data  —  PronunciationLessonRequestDTO
 */
export async function createPronunciationLesson(data) {
  const res = await callContentApi('post', BASE, { data })
  return res?.data !== undefined ? res.data : res
}

/**
 * Cập nhật bài phát âm theo ID
 * @param {number} id
 * @param {Object} data  —  PronunciationLessonRequestDTO
 */
export async function updatePronunciationLesson(id, data) {
  const res = await callContentApi('put', `${BASE}/${id}`, { data })
  return res?.data !== undefined ? res.data : res
}

/**
 * Toggle trạng thái published / draft
 */
export async function togglePublishPronunciationLesson(id) {
  const res = await callContentApi('patch', `${BASE}/${id}/publish`)
  return res?.data !== undefined ? res.data : res
}

/**
 * Xóa bài phát âm
 */
export async function deletePronunciationLesson(id) {
  const res = await callContentApi('delete', `${BASE}/${id}`)
  return res?.data !== undefined ? res.data : res
}

/**
 * examApi.js
 * ─────────────────────────────────────────────────────────────────────────────
 * API calls cho quản lý Ngân hàng Bài thi & Bài kiểm tra (Exams & Quizzes)
 * Backend: content-service  →  /admin/exams
 * Đã kết nối với Database PostgreSQL thật, KHÔNG sử dụng mock data.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import axios from 'axios'
import { api } from '@/lib/api'

const BASE = '/admin/exams'

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'ALL']

export const EXAM_CATEGORIES = [
  { value: 'ALL',        label: 'Tất cả thể loại' },
  { value: 'TOEIC_FULL', label: 'TOEIC Full 200 câu' },
  { value: 'TOEIC_MINI', label: 'TOEIC Mini Test' },
  { value: 'PLACEMENT',  label: 'Đề test đầu vào (Placement)' },
  { value: 'GRAMMAR',    label: 'Kiểm tra Ngữ pháp' },
  { value: 'VOCABULARY', label: 'Kiểm tra Từ vựng' },
  { value: 'READING',    label: 'Kiểm tra Đọc hiểu' },
  { value: 'LISTENING',  label: 'Kiểm tra Nghe hiểu' },
  { value: 'GENERAL',    label: 'Bài kiểm tra tổng hợp' },
]

export const getExamCategories = async () => EXAM_CATEGORIES

export function buildExamPayload(data) {
  return {
    title: (data.title || '').trim(),
    description: (data.description || '').trim(),
    category: data.category || 'GENERAL',
    cefrLevel: data.cefrLevel || 'B1',
    durationMinutes: Number(data.durationMinutes) || 120,
    totalQuestions: Number(data.totalQuestions) || (Array.isArray(data.questions) ? data.questions.length : 0),
    passingScore: Number(data.passingScore) || 500,
    xpReward: Number(data.xpReward) || 100,
    sections: Array.isArray(data.sections) ? data.sections : [],
    questions: Array.isArray(data.questions) ? data.questions : [],
    status: data.status || 'published',
    authorName: data.authorName || 'Quản trị viên Hệ thống',
    authorEmail: data.authorEmail || 'admin@smartenglish.vn',
  }
}

function normalizeExam(item) {
  if (!item) return item
  return {
    ...item,
    id: item.id,
    category: item.category || 'GENERAL',
    cefrLevel: item.cefrLevel || 'B1',
    durationMinutes: item.durationMinutes ?? 45,
    totalQuestions: item.totalQuestions ?? (item.questions?.length || 0),
    passingScore: item.passingScore ?? 0,
    xpReward: item.xpReward ?? 50,
    sections: Array.isArray(item.sections) ? item.sections : [],
    questions: Array.isArray(item.questions) ? item.questions : [],
    status: item.status || 'published',
    deletedAt: item.deletedAt || null,
  }
}

async function callApi(method, path, options = {}) {
  // 1. Gọi trực tiếp qua Vite Proxy
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
  } catch (err) {
    // 2. Fallback qua api client (API Gateway)
    try {
      const res = await api[method](path, options)
      return res?.data !== undefined ? res.data : res
    } catch (gatewayErr) {
      console.error('[examApi] Lỗi gọi API:', err?.message || gatewayErr?.message)
      throw err
    }
  }
}

// ─── List / Filter / Pagination ───────────────────────────────────────────────

export async function getExams(params = {}) {
  const p = {}
  if (params.search)    p.search    = params.search
  if (params.category && params.category !== 'ALL') p.category = params.category
  if (params.cefrLevel && params.cefrLevel !== 'ALL' && params.cefrLevel !== 'Tất cả') p.cefrLevel = params.cefrLevel
  if (params.status && params.status !== 'all') p.status = params.status
  if (params.sortBy)    p.sortBy    = params.sortBy
  if (params.page)      p.page      = params.page
  if (params.size)      p.size      = params.size
  if (params.trash !== undefined) p.trash = Boolean(params.trash)

  try {
    const res = await callApi('get', BASE, { params: p })
    const items = (res.items || (Array.isArray(res) ? res : [])).map(normalizeExam)
    return {
      items,
      total:      res.total      ?? items.length,
      page:       res.page       ?? (params.page || 1),
      size:       res.size       ?? (params.size || 8),
      totalPages: res.totalPages ?? 1,
    }
  } catch (err) {
    console.error('[examApi] Lỗi getExams:', err)
    return {
      items: [],
      total: 0,
      page: Number(params.page) || 1,
      size: Number(params.size) || 8,
      totalPages: 1,
    }
  }
}

export async function getExamById(id) {
  const res = await callApi('get', `${BASE}/${id}`)
  return normalizeExam(res)
}

export async function createExam(data) {
  const payload = buildExamPayload(data)
  const res = await callApi('post', BASE, { data: payload })
  return normalizeExam(res)
}

export async function updateExam(id, data) {
  const payload = buildExamPayload(data)
  const res = await callApi('put', `${BASE}/${id}`, { data: payload })
  return normalizeExam(res)
}

export async function deleteExam(id) {
  const res = await callApi('delete', `${BASE}/${id}`)
  return res
}

export async function restoreExam(id) {
  const res = await callApi('patch', `${BASE}/${id}/restore`)
  return res
}

export async function permanentDeleteExam(id) {
  const res = await callApi('delete', `${BASE}/${id}/permanent`)
  return res
}

export async function togglePublishExam(id) {
  const res = await callApi('patch', `${BASE}/${id}/publish`)
  return normalizeExam(res)
}

export async function duplicateExam(id, authorInfo = {}) {
  const res = await callApi('post', `${BASE}/${id}/duplicate`, { data: authorInfo })
  return normalizeExam(res)
}

export async function getExamTrashCount() {
  try {
    const res = await callApi('get', `${BASE}/trash/count`)
    const count = res?.count ?? res?.data ?? res
    return typeof count === 'number' ? count : (Number(count) || 0)
  } catch {
    return 0
  }
}


export async function seedToeic200ExamApi() {
  return createExam({
    title: 'ETS TOEIC Full 200 Questions Simulation Test',
    description: 'Đề thi thử TOEIC chuẩn format quốc tế 200 câu với 2 phần Listening (Part 1-4) và Reading (Part 5-7).',
    category: 'TOEIC_FULL',
    cefrLevel: 'B2',
    durationMinutes: 120,
    totalQuestions: 200,
    passingScore: 650,
    xpReward: 200,
    status: 'published',
  })
}

export async function getExamStats() {
  try {
    const res = await callApi('get', `${BASE}/statistics`)
    return res || { totalExams: 0, publishedCount: 0, draftCount: 0, trashCount: 0 }
  } catch {
    return { totalExams: 0, publishedCount: 0, draftCount: 0, trashCount: 0 }
  }
}

/**
 * examApi.js
 * ─────────────────────────────────────────────────────────────────────────────
 * API calls cho quản lý Ngân hàng Bài thi & Bài kiểm tra (Exams & Quizzes)
 * Backend: content-service  →  /admin/exams
 * Hỗ trợ fallback tự động giữa Vite Proxy (8082), Gateway (8080) và in-memory mock store
 * ─────────────────────────────────────────────────────────────────────────────
 */
import axios from 'axios'

const BASE = '/admin/exams'

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'ALL']

const EXAM_CATEGORIES = [
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

// In-memory mock store cho fallback
let localExams = [
  {
    id: 'exam-mock-1',
    title: 'ETS TOEIC 2024 Practice Test 1 (Mini Test)',
    description: 'Đề thi thử TOEIC rút gọn 30 câu hỏi chọn lọc bao gồm cả Listening và Reading sát format thi thật.',
    category: 'TOEIC_MINI',
    cefrLevel: 'B2',
    durationMinutes: 45,
    totalQuestions: 30,
    passingScore: 550,
    xpReward: 100,
    sections: [
      { id: 1, sectionName: 'LISTENING', partNumber: 1, title: 'Part 1: Photographs' },
      { id: 2, sectionName: 'LISTENING', partNumber: 2, title: 'Part 2: Question-Response' },
      { id: 3, sectionName: 'READING', partNumber: 5, title: 'Part 5: Incomplete Sentences' },
    ],
    questions: Array(5).fill({}),
    status: 'published',
    authorName: 'Quản trị viên Hệ thống',
    authorEmail: 'admin@smartenglish.vn',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: null,
    deletedAt: null,
  },
  {
    id: 'exam-mock-2',
    title: 'Bài Kiểm Tra Đánh Giá Năng Lực Đầu Vào (Placement Test B1-B2)',
    description: 'Bài test toàn diện 40 câu hỏi đánh giá trình độ Ngữ pháp, Từ vựng, Đọc hiểu theo khung CEFR.',
    category: 'PLACEMENT',
    cefrLevel: 'B1',
    durationMinutes: 30,
    totalQuestions: 40,
    passingScore: 70,
    xpReward: 60,
    sections: [
      { id: 1, sectionName: 'GRAMMAR', partNumber: 1, title: 'Phần 1: Ngữ pháp cốt lõi' },
      { id: 2, sectionName: 'VOCABULARY', partNumber: 2, title: 'Phần 2: Từ vựng học thuật' },
    ],
    questions: Array(4).fill({}),
    status: 'published',
    authorName: 'Thầy John Smith',
    authorEmail: 'teacher.john@smartenglish.com',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: null,
    deletedAt: null,
  },
  {
    id: 'exam-mock-3',
    title: 'English Grammar Mastery Quiz (Tenses & Modal Verbs)',
    description: 'Bài trắc nghiệm nhanh 15 phút tập trung vào các thì thông dụng và động từ khuyết thiếu nâng cao.',
    category: 'GRAMMAR',
    cefrLevel: 'A2',
    durationMinutes: 15,
    totalQuestions: 20,
    passingScore: 80,
    xpReward: 30,
    sections: [
      { id: 1, sectionName: 'GRAMMAR', partNumber: 1, title: 'Kiểm tra ngữ pháp' },
    ],
    questions: Array(3).fill({}),
    status: 'published',
    authorName: 'Quản trị viên Hệ thống',
    authorEmail: 'admin@smartenglish.vn',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: null,
    deletedAt: null,
  },
  {
    id: 'exam-mock-4',
    title: 'Full TOEIC 200 Questions Simulation Test 2024',
    description: 'Đề thi thử TOEIC chuẩn format quốc tế 200 câu với đồng hồ đếm ngược 120 phút và bảng quy đổi điểm 10-990.',
    category: 'TOEIC_FULL',
    cefrLevel: 'B2',
    durationMinutes: 120,
    totalQuestions: 200,
    passingScore: 500,
    xpReward: 250,
    sections: [],
    questions: [],
    status: 'draft',
    authorName: 'Quản trị viên Hệ thống',
    authorEmail: 'admin@smartenglish.vn',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: null,
    deletedAt: null,
  },
]

let mockIdCounter = 500

function buildPayload(data) {
  if (!data) return {}
  return {
    title: data.title?.trim() || '',
    description: data.description || '',
    category: data.category || 'TOEIC_FULL',
    cefrLevel: data.cefrLevel || 'B2',
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
  try {
    const res = await axios({ method, url: path, params: options.params, data: options.data })
    const payload = res?.data
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload.data !== undefined && payload.data !== null ? payload.data : payload
    }
    return payload
  } catch (err) {
    console.warn('[examApi] Backend unreachable, using fallback:', err?.message)
    throw err
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
    const items = (res.items || []).map(normalizeExam)
    return {
      items,
      total:      res.total      ?? items.length,
      page:       res.page       ?? (params.page || 1),
      size:       res.size       ?? (params.size || 8),
      totalPages: res.totalPages ?? 1,
    }
  } catch {
    // Local in-memory filtering fallback
    const isTrash = Boolean(params.trash)
    let filtered = localExams.filter((item) => (isTrash ? Boolean(item.deletedAt) : !item.deletedAt))

    if (p.search) {
      const q = p.search.toLowerCase()
      filtered = filtered.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q) ||
          i.category?.toLowerCase().includes(q),
      )
    }

    if (p.category) {
      filtered = filtered.filter((i) => i.category === p.category)
    }

    if (p.cefrLevel) {
      filtered = filtered.filter((i) => i.cefrLevel === p.cefrLevel)
    }

    if (p.status) {
      filtered = filtered.filter((i) => i.status === p.status)
    }

    const page = Number(params.page) || 1
    const size = Number(params.size) || 8
    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / size))
    const start = (page - 1) * size
    const items = filtered.slice(start, start + size).map(normalizeExam)

    return { items, total, page, size, totalPages }
  }
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getExamCategories() {
  try {
    const res = await callApi('get', `${BASE}/categories`)
    const list = Array.isArray(res) ? res : res?.data
    if (Array.isArray(list) && list.length > 0) return list
    return getLocalCategories()
  } catch {
    return getLocalCategories()
  }
}

function getLocalCategories() {
  return Array.from(new Set(localExams.filter((e) => !e.deletedAt).map((e) => e.category))).filter(Boolean)
}

// ─── Trash Count ──────────────────────────────────────────────────────────────

export async function getExamTrashCount() {
  try {
    const res = await callApi('get', `${BASE}/trash/count`)
    const count = res?.data !== undefined ? res.data : res
    return typeof count === 'number' ? count : Number(count) || 0
  } catch {
    return localExams.filter((e) => Boolean(e.deletedAt)).length
  }
}

// ─── Get by ID ────────────────────────────────────────────────────────────────

export async function getExamById(id) {
  try {
    const res = await callApi('get', `${BASE}/${id}`)
    const item = res?.data !== undefined ? res.data : res
    return normalizeExam(item)
  } catch {
    const found = localExams.find((e) => String(e.id) === String(id))
    if (found) return normalizeExam(found)
    throw new Error(`Không tìm thấy bài thi ID=${id}`)
  }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createExam(data) {
  const payload = buildPayload(data)
  try {
    const res = await callApi('post', BASE, { data: payload })
    const created = res?.data !== undefined ? res.data : res
    localExams.unshift(normalizeExam(created))
    return normalizeExam(created)
  } catch {
    const localNew = normalizeExam({
      ...payload,
      id: `exam-local-${++mockIdCounter}`,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      deletedAt: null,
    })
    localExams.unshift(localNew)
    return localNew
  }
}


// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateExam(id, data) {
  const payload = buildPayload(data)
  try {
    const res = await callApi('put', `${BASE}/${id}`, { data: payload })
    const updated = res?.data !== undefined ? res.data : res
    localExams = localExams.map((e) =>
      String(e.id) === String(id) ? normalizeExam({ ...e, ...updated }) : e,
    )
    return normalizeExam(updated)
  } catch {
    let updated = null
    localExams = localExams.map((e) => {
      if (String(e.id) === String(id)) {
        updated = normalizeExam({ ...e, ...payload, updatedAt: new Date().toISOString() })
        return updated
      }
      return e
    })
    return updated || normalizeExam(payload)
  }
}

// ─── Toggle Publish ───────────────────────────────────────────────────────────

export async function togglePublishExam(id) {
  try {
    const res = await callApi('patch', `${BASE}/${id}/publish`)
    const updated = res?.data !== undefined ? res.data : res
    localExams = localExams.map((e) =>
      String(e.id) === String(id) ? normalizeExam({ ...e, ...updated }) : e,
    )
    return normalizeExam(updated)
  } catch {
    let updated = null
    localExams = localExams.map((e) => {
      if (String(e.id) === String(id)) {
        const nextStatus = e.status === 'published' ? 'draft' : 'published'
        updated = normalizeExam({ ...e, status: nextStatus, updatedAt: new Date().toISOString() })
        return updated
      }
      return e
    })
    return updated
  }
}

// ─── Duplicate ────────────────────────────────────────────────────────────────

export async function duplicateExam(id, authorInfo = {}) {
  try {
    const res = await callApi('post', `${BASE}/${id}/duplicate`, { data: authorInfo })
    const created = res?.data !== undefined ? res.data : res
    localExams.unshift(normalizeExam(created))
    return normalizeExam(created)
  } catch {
    const original = localExams.find((e) => String(e.id) === String(id))
    const duplicated = normalizeExam({
      ...(original || {}),
      id: `exam-local-${++mockIdCounter}`,
      title: `${original?.title || 'Bài thi'} (Bản sao)`,
      status: 'draft',
      authorName: authorInfo.authorName || original?.authorName || 'Admin',
      authorEmail: authorInfo.authorEmail || original?.authorEmail || 'admin@smartenglish.vn',
      createdAt: new Date().toISOString(),
      updatedAt: null,
      deletedAt: null,
    })
    localExams.unshift(duplicated)
    return duplicated
  }
}

// ─── Soft Delete (Vào thùng rác) ───────────────────────────────────────────────

export async function deleteExam(id) {
  try {
    const res = await callApi('delete', `${BASE}/${id}`)
    localExams = localExams.map((e) =>
      String(e.id) === String(id) ? { ...e, deletedAt: new Date().toISOString() } : e,
    )
    return res?.data !== undefined ? res.data : res
  } catch {
    localExams = localExams.map((e) =>
      String(e.id) === String(id) ? { ...e, deletedAt: new Date().toISOString() } : e,
    )
    return { success: true }
  }
}

// ─── Restore (Khôi phục) ──────────────────────────────────────────────────────

export async function restoreExam(id) {
  try {
    const res = await callApi('patch', `${BASE}/${id}/restore`)
    localExams = localExams.map((e) =>
      String(e.id) === String(id) ? { ...e, deletedAt: null } : e,
    )
    return res?.data !== undefined ? res.data : res
  } catch {
    localExams = localExams.map((e) =>
      String(e.id) === String(id) ? { ...e, deletedAt: null } : e,
    )
    return { success: true }
  }
}

// ─── Permanent Delete (Xóa vĩnh viễn) ─────────────────────────────────────────

export async function permanentDeleteExam(id) {
  try {
    const res = await callApi('delete', `${BASE}/${id}/permanent`)
    localExams = localExams.filter((e) => String(e.id) !== String(id))
    return res?.data !== undefined ? res.data : res
  } catch {
    localExams = localExams.filter((e) => String(e.id) !== String(id))
    return { success: true }
  }
}

// ─── Seed / Crawl Full TOEIC 200 Questions ───────────────────────────────────

export async function seedToeic200ExamApi() {
  try {
    const res = await callApi('post', `${BASE}/seed-toeic-200`)
    return res?.data !== undefined ? res.data : res
  } catch (err) {
    console.warn('[examApi] Failed to seed TOEIC 200 from backend, using fallback', err)
    const seeded = {
      id: 9999,
      title: 'ETS TOEIC 2024 Practice Test 01 (Full 200 câu)',
      description: 'Mô phỏng 100% định dạng đề thi thật ETS với giải thích chi tiết cả 7 phần: Listening (Part 1 - 4) và Reading (Part 5 - 7).',
      category: 'TOEIC_FULL',
      cefrLevel: 'B2',
      durationMinutes: 120,
      totalQuestions: 200,
      passingScore: 550,
      xpReward: 150,
      status: 'published',
      authorName: 'Quản trị viên Hệ thống',
      authorEmail: 'admin@smartenglish.vn',
      createdAt: new Date().toISOString(),
    }
    localExams.unshift(seeded)
    return seeded
  }
}

export { CEFR_LEVELS, EXAM_CATEGORIES }

/**
 * teacherDashboardApi.js
 * ─────────────────────────────────────────────────────────────────────────────
 * API client cho Teacher Dashboard — kết nối teacher-service qua API Gateway.
 * Lấy dữ liệu THỰC từ DB, không dùng mock.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { api } from '@/lib/api'
import { ENDPOINTS } from '@/lib/endpoints'

/**
 * Lấy danh sách lớp học của giáo viên (theo teacherId từ JWT)
 */
export async function getMyClasses({ page = 0, size = 20, teacherId } = {}) {
  if (teacherId == null) {
    throw new Error('Không xác định được giáo viên đang đăng nhập')
  }
  const res = await api.get(ENDPOINTS.teacher.classes, {
    params: { page, size, teacherId },
  })
  // teacher-service trả về Page<ClassDTO> hoặc List<ClassDTO>
  const payload = res?.data ?? res
  if (payload && Array.isArray(payload.content)) {
    return { classes: payload.content, total: payload.totalElements ?? payload.content.length }
  }
  if (Array.isArray(payload)) {
    return { classes: payload, total: payload.length }
  }
  return { classes: [], total: 0 }
}

/**
 * Lấy quota/thống kê tổng hợp của giáo viên (từ payment-service qua teacher-service)
 */
export async function getMyQuota(teacherId) {
  try {
    const res = await api.get(ENDPOINTS.teacher.quota, {
      params: { teacherId },
    })
    const payload = res?.data ?? res
    if (payload && typeof payload === 'object') {
      return payload.data ?? payload
    }
  } catch {
    return null
  }
  return null
}

/**
 * Lấy danh sách bài tập của một lớp học
 */
export async function getClassAssignments(classId) {
  try {
    const res = await api.get(ENDPOINTS.teacher.assignments, {
      path: { id: classId },
    })
    const payload = res?.data ?? res
    if (Array.isArray(payload)) return payload
    if (payload && Array.isArray(payload.content)) return payload.content
    return []
  } catch {
    return []
  }
}

/**
 * Lấy tất cả bài tập của giáo viên (flatten từ nhiều lớp)
 */
export async function getAllAssignments(classes = []) {
  // Tải đủ tất cả lớp của giáo viên, chia batch 5 để không tạo quá nhiều request đồng thời.
  const allAssignments = []
  for (let index = 0; index < classes.length; index += 5) {
    const batch = classes.slice(index, index + 5)
    const results = await Promise.allSettled(
      batch.map((cls) => getClassAssignments(cls.id))
    )
    allAssignments.push(
      ...results.flatMap((result) => (result.status === 'fulfilled' ? result.value : [])),
    )
  }
  return allAssignments
}

/**
 * Tính toán thống kê dashboard từ danh sách lớp học
 */
export function computeTeacherStats(classes = [], assignments = []) {
  const now = new Date()
  const urgentThreshold = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000) // 2 ngày tới

  const totalClasses = classes.length
  const totalStudents = classes.reduce(
    (sum, cls) => sum + (cls.studentCount ?? cls.currentStudents ?? 0),
    0
  )

  const activeAssignments = assignments.filter(
    (a) => a.status !== 'CLOSED' && a.status !== 'CANCELLED'
  ).length

  const urgentDeadlines = assignments.filter((a) => {
    if (!a.dueDate || a.status === 'CLOSED') return false
    const due = new Date(a.dueDate)
    return due > now && due <= urgentThreshold
  }).length

  return { totalClasses, totalStudents, activeAssignments, urgentDeadlines }
}

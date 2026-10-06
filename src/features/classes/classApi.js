import { api } from '../../lib/api'
import { ENDPOINTS } from '../../lib/endpoints'

/**
 * Teacher Class API client
 * Connects to teacher-service via API Gateway
 */

export const getTeacherClasses = ({ teacherId, status, search, page = 0, size = 20 } = {}) =>
  api.get(ENDPOINTS.teacher.classes, {
    params: { teacherId, status, search, page, size },
  })

export const getClassDetail = (classId) =>
  api.get(ENDPOINTS.teacher.classDetail, {
    path: { id: classId },
  })

export const createClass = (data) =>
  api.post(ENDPOINTS.teacher.classes, {
    data,
  })

export const updateClass = (classId, data) =>
  api.put(ENDPOINTS.teacher.classDetail, {
    path: { id: classId },
    data,
  })

export const deleteClass = (classId) =>
  api.del(ENDPOINTS.teacher.classDetail, {
    path: { id: classId },
  })

export const getClassMembers = (classId) =>
  api.get(ENDPOINTS.teacher.classMembers, {
    path: { id: classId },
  })

export const addMember = (classId, data) =>
  api.post(ENDPOINTS.teacher.classMembers, {
    path: { id: classId },
    data,
  })

export const removeMember = (classId, userId) =>
  api.del(ENDPOINTS.teacher.removeMember, {
    path: { id: classId, userId },
  })

export const getClassAssignments = (classId) =>
  api.get(ENDPOINTS.teacher.assignments, {
    path: { id: classId },
  })

export const createAssignment = (classId, data, { teacherId } = {}) =>
  api.post(ENDPOINTS.teacher.assignments, {
    path: { id: classId },
    params: teacherId ? { teacherId } : undefined,
    data,
  })

export const submitAssignment = (assignmentId, data) =>
  api.post('/api/v1/teacher/classes/assignments/{assignmentId}/submit', {
    path: { assignmentId },
    data,
  })

export const getAssignmentSubmissions = (assignmentId, teacherId) =>
  api.get('/api/v1/teacher/classes/assignments/{assignmentId}/submissions', {
    path: { assignmentId },
    params: teacherId ? { teacherId } : undefined,
  })

export const getMySubmission = (assignmentId, studentId) =>
  api.get('/api/v1/teacher/classes/assignments/{assignmentId}/my-submission', {
    path: { assignmentId },
    params: { studentId },
  })

export const gradeSubmission = (submissionId, data, teacherId) =>
  api.put('/api/v1/teacher/classes/assignments/submissions/{submissionId}/grade', {
    path: { submissionId },
    params: teacherId ? { teacherId } : undefined,
    data,
  })

export const getTeacherQuotaStatus = (teacherId) =>
  api.get(ENDPOINTS.teacher.quota, {
    params: { teacherId },
  })

import { api } from '../../lib/api'
import { ENDPOINTS } from '../../lib/endpoints'

/**
 * Teacher Class API client
 * Connects to teacher-service via API Gateway
 */

export const getTeacherClasses = ({ teacherId, status, search, page = 0, size = 20 } = {}) =>
  api.get(ENDPOINTS.teacher.classes, {
    params: {
      ...(teacherId ? { teacherId } : {}),
      ...(status ? { status } : {}),
      ...(search ? { search } : {}),
      page,
      size,
    },
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

export const createAssignment = (classId, data) =>
  api.post(ENDPOINTS.teacher.assignments, {
    path: { id: classId },
    data,
  })

export const submitAssignment = (assignmentId, data) =>
  api.post('/api/v1/teacher/classes/assignments/{assignmentId}/submit', {
    path: { assignmentId },
    data,
  })

export const getAssignmentSubmissions = (assignmentId) =>
  api.get('/api/v1/teacher/classes/assignments/{assignmentId}/submissions', {
    path: { assignmentId },
  })

export const getMySubmission = (assignmentId) =>
  api.get('/api/v1/teacher/classes/assignments/{assignmentId}/my-submission', {
    path: { assignmentId },
  })

export const gradeSubmission = (submissionId, data) =>
  api.put('/api/v1/teacher/classes/assignments/submissions/{submissionId}/grade', {
    path: { submissionId },
    data,
  })

export const getTeacherQuotaStatus = () =>
  api.get(ENDPOINTS.teacher.quota)

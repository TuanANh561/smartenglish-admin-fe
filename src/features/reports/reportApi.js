/**
 * reportApi.js
 * ─────────────────────────────────────────────────────────────────────────────
 * API calls kết nối trực tiếp 100% tới social-service (/admin/reports & /social/reports)
 * Quản lý Báo cáo vi phạm cộng đồng (Trust & Safety / Content Moderation)
 * KHÔNG sử dụng bất kỳ Mock Data hay Fake Data nào.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import axios from 'axios'

const BASE_URL = '/admin/reports'

function getHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('se_admin_token') : null
  const headers = { 'Content-Type': 'application/json' }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

export async function getAdminReports(params = {}) {
  const res = await axios.get(BASE_URL, {
    params,
    headers: getHeaders(),
  })
  return {
    items: res.data?.data || [],
    total: res.data?.total || 0,
    page: res.data?.page || 1,
    size: res.data?.size || 10,
    totalPages: res.data?.totalPages || 1,
  }
}

export async function getAdminReportStats() {
  const res = await axios.get(`${BASE_URL}/stats`, {
    headers: getHeaders(),
  })
  return res.data?.data || {
    pendingCount: 0,
    resolvedCount: 0,
    violationRate: 0,
    totalReports: 0,
  }
}

export async function getAdminReportById(id) {
  const res = await axios.get(`${BASE_URL}/${id}`, {
    headers: getHeaders(),
  })
  return res.data?.data
}

export async function resolveAdminReport(id, { action, note }) {
  const res = await axios.put(`${BASE_URL}/${id}/resolve`, { action, note }, {
    headers: getHeaders(),
  })
  return res.data
}

export async function bulkResolveAdminReports({ reportIds, action, note }) {
  const res = await axios.post(`${BASE_URL}/bulk-action`, { reportIds, action, note }, {
    headers: getHeaders(),
  })
  return res.data
}

export async function submitPublicReport(payload) {
  const res = await axios.post('/social/reports', payload, {
    headers: getHeaders(),
  })
  return res.data
}

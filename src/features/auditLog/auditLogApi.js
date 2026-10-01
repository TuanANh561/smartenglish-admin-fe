/**
 * auditLogApi.js
 * ─────────────────────────────────────────────────────────────────────────────
 * API client kết nối trực tiếp với Backend (auth-service:8081)
 * Endpoint: /admin/audit-logs
 * 100% sử dụng dữ liệu Backend thật, không sử dụng mock hay fake data.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import axios from 'axios'
import { api } from '@/lib/api'

const BASE = '/admin/audit-logs'

/**
 * Gọi API Nhật ký hoạt động qua Backend thật:
 * 1. Gọi trực tiếp qua Vite Proxy (/admin/audit-logs -> auth-service:8081)
 * 2. Gọi qua API Gateway trung tâm (8080) nếu chạy môi trường production
 */
async function callAuditApi(method, path, options = {}) {
  try {
    const res = await axios({
      method,
      url: path,
      params: options.params,
      data: options.data,
      headers: options.headers,
      timeout: 10000,
    })
    const payload = res?.data
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload.data !== undefined && payload.data !== null ? payload.data : payload
    }
    return payload
  } catch (proxyErr) {
    // Fallback qua API Gateway trung tâm (8080)
    const res = await api[method](path, options)
    const payload = res?.data !== undefined ? res.data : res
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload.data !== undefined && payload.data !== null ? payload.data : payload
    }
    return payload
  }
}

/**
 * Lấy danh sách nhật ký hoạt động từ Backend với phân trang và bộ lọc
 */
export async function getAuditLogs({
  page = 1,
  size = 10,
  dateRange = 'all',
  userRole = 'all',
  actionType = 'all',
  severity = 'all',
  search = '',
} = {}) {
  const params = {
    page,
    size,
    dateRange,
    userRole,
    actionType,
    severity,
    search: search?.trim() || undefined,
  }

  const data = await callAuditApi('get', BASE, { params })

  if (data && Array.isArray(data.items)) {
    return {
      items: data.items,
      total: data.total ?? data.items.length,
      page: data.page ?? page,
      size: data.size ?? size,
      totalPages: data.totalPages ?? Math.max(1, Math.ceil((data.total || data.items.length) / size)),
    }
  }

  if (Array.isArray(data)) {
    return {
      items: data,
      total: data.length,
      page,
      size,
      totalPages: Math.max(1, Math.ceil(data.length / size)),
    }
  }

  return {
    items: [],
    total: 0,
    page,
    size,
    totalPages: 1,
  }
}

/**
 * Lấy chi tiết một bản ghi nhật ký hoạt động từ Backend theo ID
 */
export async function getAuditLogById(id) {
  return await callAuditApi('get', `${BASE}/${id}`)
}

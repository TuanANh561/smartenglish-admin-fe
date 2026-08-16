import { api } from '../../lib/api'
import { ENDPOINTS } from '../../lib/endpoints'

/** Tham số động truyền qua `path`, tham số query truyền qua `params`. */

export const getUsers = ({ page = 1, size = 10, search, role, plan, sortBy, sortDir } = {}) =>
  api.get(ENDPOINTS.users.list, { params: { page, size, search, role, plan, sortBy, sortDir } })

export const getUser = (id) => api.get(ENDPOINTS.users.detail, { path: { id } })

export const updateUser = (id, data) => api.patch(ENDPOINTS.users.update, { path: { id }, data })

export const lockUser = (id) => api.post(ENDPOINTS.users.lock, { path: { id } })

export const unlockUser = (id) => api.post(ENDPOINTS.users.unlock, { path: { id } })

import { api } from '@/lib/api'
import { ENDPOINTS } from '@/lib/endpoints'

export const getVocabTopics = () => api.get(ENDPOINTS.words.topics)

export const getTrashCount = () => api.get(ENDPOINTS.words.trashCount)

export const getVocabList = (params) => api.get(ENDPOINTS.words.list, { params })

export const autoImportWord = (word) =>
  api.post(ENDPOINTS.words.autoImport, null, { params: { word } })

export const softDeleteWord = (id) =>
  api.del(ENDPOINTS.words.remove, { path: { id } })

export const restoreWord = (id) =>
  api.patch(ENDPOINTS.words.restore, null, { path: { id } })

export const permanentDeleteWord = (id) =>
  api.del(ENDPOINTS.words.permanentRemove, { path: { id } })


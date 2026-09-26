import { api, http } from '@/lib/api'

const DIRECT_AI_PRACTICE_URL = 'http://localhost:8084'

/**
 * Gọi API với cơ chế tự động fallback giữa API Gateway (8080) và Direct Service (8084)
 */
async function callApiWithFallback(method, path, options = {}) {
  try {
    // 1. Thử gọi qua API Gateway
    return await api[method](path, options)
  } catch (err) {
    // 2. Nếu Gateway lỗi kết nối, thử gọi trực tiếp vào ai-practice-service (8084)
    if (err.message?.includes('Network Error') || err.message?.includes('status 502') || !err.status) {
      try {
        const fullUrl = `${DIRECT_AI_PRACTICE_URL}${path}`
        const res = await http.request({
          method,
          url: fullUrl,
          params: options.params,
          data: options.data,
          headers: options.headers,
        })
        return res?.data !== undefined ? res.data : res
      } catch (fallbackErr) {
        throw fallbackErr
      }
    }
    throw err
  }
}

/**
 * Lấy danh sách kịch bản Luyện nói & Roleplay có phân trang và bộ lọc
 */
export async function getSpeakingScenarios(params = {}) {
  const cleanParams = {}
  if (params.page !== undefined) cleanParams.page = params.page
  if (params.size !== undefined) cleanParams.size = params.size
  if (params.cefrLevel && params.cefrLevel !== 'ALL' && params.cefrLevel !== 'Tất cả') {
    cleanParams.cefrLevel = params.cefrLevel
  }
  if (params.category && params.category !== 'Tất cả phân loại' && params.category !== 'ALL') {
    cleanParams.category = params.category
  }
  if (params.search?.trim()) {
    cleanParams.search = params.search.trim()
  }

  return await callApiWithFallback('get', '/ai-practice/admin/scenarios', { params: cleanParams })
}

/**
 * Lấy chi tiết kịch bản luyện nói theo ID
 */
export async function getSpeakingScenarioById(id) {
  return await callApiWithFallback('get', `/ai-practice/admin/scenarios/${id}`)
}

/**
 * Tạo mới kịch bản luyện nói
 */
export async function createSpeakingScenario(data) {
  return await callApiWithFallback('post', '/ai-practice/admin/scenarios', { data })
}

/**
 * Cập nhật kịch bản luyện nói
 */
export async function updateSpeakingScenario(id, data) {
  return await callApiWithFallback('put', `/ai-practice/admin/scenarios/${id}`, { data })
}

/**
 * Xóa kịch bản luyện nói
 */
export async function deleteSpeakingScenario(id) {
  return await callApiWithFallback('delete', `/ai-practice/admin/scenarios/${id}`)
}

/**
 * Trợ lý Gemini AI tự động sinh kịch bản theo prompt
 */
export async function generateScenarioWithAi(topicPrompt, cefrLevel = 'B1', category = 'Giao tiếp') {
  return await callApiWithFallback('post', '/ai-practice/admin/scenarios/generate-ai', {
    data: {
      topicPrompt,
      cefrLevel,
      category,
    },
  })
}

/**
 * Test thử phản hồi đàm thoại hội thoại AI Roleplay theo lượt (dùng cho Simulator trên Admin)
 */
export async function chatRoleplayTurn(scenarioId, userText, sessionId = null) {
  return await callApiWithFallback('post', '/ai-practice/speaking/roleplay/chat', {
    data: {
      scenarioId,
      sessionId,
      userText,
    },
  })
}

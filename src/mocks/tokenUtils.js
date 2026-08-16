/**
 * Token JWT giả — dùng để tập dượt luồng access/refresh token trước khi có backend thật.
 *
 * KHÔNG có chữ ký thật (mock không cần xác thực chữ ký, việc đó luôn do backend làm).
 * Chỉ mã hoá phần payload dạng base64 để phía client giải mã, đọc hạn dùng (exp),
 * y hệt cách một JWT thật được dùng ở phía frontend.
 */

const FAKE_HEADER = 'mock'
const FAKE_SIGNATURE = 'mocksig'

export function createMockToken(user, ttlSeconds, type = 'access') {
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    sub: user.id,
    role: user.role,
    type,
    iat: now,
    exp: now + ttlSeconds,
  }
  return `${FAKE_HEADER}.${btoa(JSON.stringify(payload))}.${FAKE_SIGNATURE}`
}

export function decodeMockToken(token) {
  if (!token || typeof token !== 'string') return null
  const [, payloadPart] = token.split('.')
  if (!payloadPart) return null
  try {
    return JSON.parse(atob(payloadPart))
  } catch {
    return null
  }
}

export function isTokenExpired(payload) {
  if (!payload?.exp) return true
  return Math.floor(Date.now() / 1000) >= payload.exp
}

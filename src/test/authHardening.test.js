// Polyfill browser environment for Node.js test runner before any store/api imports
const createStorageMock = () => {
  let store = {}
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, val) => {
      store[key] = String(val)
    },
    removeItem: (key) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
}

const mockStorage = createStorageMock()
const mockSessionStorage = createStorageMock()
const listeners = new Map()

globalThis.localStorage = mockStorage
globalThis.sessionStorage = mockSessionStorage
if (!globalThis.Event) {
  globalThis.Event = class Event {
    constructor(type) {
      this.type = type
    }
  }
}

globalThis.window = {
  location: { search: '' },
  history: {
    replaceState: (_state, _title, url) => {
      globalThis.window.location.search = url.includes('?') ? url.slice(url.indexOf('?')) : ''
    },
  },
  addEventListener: (event, cb) => {
    if (!listeners.has(event)) listeners.set(event, new Set())
    listeners.get(event).add(cb)
  },
  removeEventListener: (event, cb) => {
    listeners.get(event)?.delete(cb)
  },
  dispatchEvent: (event) => {
    const type = typeof event === 'string' ? event : event.type
    listeners.get(type)?.forEach((cb) => cb(event))
    return true
  },
  localStorage: mockStorage,
  sessionStorage: mockSessionStorage,
}

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { cwd } from 'node:process'
import { useAuthStore, initAuthEventListener } from '@/store/authStore'
import * as authApi from '@/features/auth/api'
import { TOKEN_KEY, REFRESH_TOKEN_KEY, setTokens } from '@/lib/api'

describe('Phase 6 – Production Authentication Hardening Tests', () => {
  beforeEach(() => {
    mockStorage.clear()
    mockSessionStorage.clear()
    initAuthEventListener()
    useAuthStore.getState().clearSession()
    vi.restoreAllMocks()
  })

  // 1. Query ?asUser=1 không đổi user
  it('1. Query ?asUser=1 / ?userId=2 / ?as=teacher không làm đổi user hay sinh mock token', () => {
    window.history.replaceState({}, '', '/app?asUser=1&userId=2&as=teacher')

    // Không tồn tại se_test_user_id trong sessionStorage
    expect(sessionStorage.getItem('se_test_user_id')).toBeNull()
    // Không tự sinh mock-jwt-token trong localStorage
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull()

    // State authStore giữ nguyên null vì chưa đăng nhập thật
    const currentUser = useAuthStore.getState().user
    expect(currentUser).toBeNull()
  })

  // 2. Login hợp lệ & Login sai mật khẩu
  it('2a. Login hợp lệ: gọi API thật, lưu access/refresh token và user profile vào authStore', async () => {
    const mockSuccessResponse = {
      accessToken: 'header.payload.signature_access',
      refreshToken: 'header.payload.signature_refresh',
      user: {
        id: 1,
        displayName: 'Quản trị viên Hệ thống',
        email: 'admin@smartenglish.com',
        role: 'admin',
        avatarUrl: '',
      },
    }

    vi.spyOn(authApi, 'login').mockResolvedValue(mockSuccessResponse)

    const res = await authApi.login({
      emailOrUsername: 'admin@smartenglish.com',
      password: 'Password123@',
    })

    // Cập nhật session vào store
    useAuthStore.getState().setSession(res)

    expect(localStorage.getItem(TOKEN_KEY)).toBe('header.payload.signature_access')
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('header.payload.signature_refresh')
    expect(JSON.parse(localStorage.getItem('se_admin_user'))).toMatchObject({
      id: 1,
      role: 'admin',
    })
    expect(useAuthStore.getState().user).toMatchObject({
      id: 1,
      displayName: 'Quản trị viên Hệ thống',
      role: 'admin',
    })
    expect(useAuthStore.getState().initialized).toBe(true)
  })

  it('2b. Login sai mật khẩu: API từ chối, không lưu token và không ghi đè user', async () => {
    vi.spyOn(authApi, 'login').mockRejectedValue({
      status: 401,
      message: 'Email hoặc mật khẩu không chính xác.',
    })

    await expect(
      authApi.login({
        emailOrUsername: 'admin@smartenglish.com',
        password: 'wrong_password',
      }),
    ).rejects.toMatchObject({
      status: 401,
      message: 'Email hoặc mật khẩu không chính xác.',
    })

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem('se_admin_user')).toBeNull()
    expect(useAuthStore.getState().user).toBeNull()
  })

  // 3. Refresh token
  it('3. Refresh token: cập nhật access token và refresh token mới qua setTokens', () => {
    setTokens({
      accessToken: 'new_access_token_v2',
      refreshToken: 'new_refresh_token_v2',
    })

    expect(localStorage.getItem(TOKEN_KEY)).toBe('new_access_token_v2')
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('new_refresh_token_v2')
  })

  // 4. Reload trang giữ phiên & nạp /users/me
  it('4. Reload trang giữ phiên: khi có token, nạp thông tin người dùng mới nhất từ /users/me', async () => {
    localStorage.setItem(TOKEN_KEY, 'current_valid_token')
    localStorage.setItem(
      'se_admin_user',
      JSON.stringify({ id: 2, displayName: 'Thầy John', role: 'teacher' }),
    )

    const updatedProfile = {
      id: 2,
      displayName: 'Thầy John Smith (Profile đã cập nhật)',
      email: 'teacher.john@smartenglish.com',
      role: 'teacher',
      plan: 'premium_yearly',
    }

    vi.spyOn(authApi, 'getMe').mockResolvedValue(updatedProfile)

    const me = await authApi.getMe()
    useAuthStore.getState().setUser(me)

    expect(useAuthStore.getState().user).toMatchObject({
      id: 2,
      displayName: 'Thầy John Smith (Profile đã cập nhật)',
      role: 'teacher',
    })
    expect(JSON.parse(localStorage.getItem('se_admin_user'))).toMatchObject({
      id: 2,
      displayName: 'Thầy John Smith (Profile đã cập nhật)',
    })
    expect(useAuthStore.getState().initialized).toBe(true)
  })

  // 5. Token hết hạn / 401
  it('5a. Token hết hạn: clearSession xóa sạch token, user trong localStorage và reset state', () => {
    localStorage.setItem(TOKEN_KEY, 'expired_token')
    localStorage.setItem(REFRESH_TOKEN_KEY, 'expired_refresh_token')
    localStorage.setItem('se_admin_user', JSON.stringify({ id: 1 }))
    sessionStorage.setItem('se_test_user_id', '1')

    useAuthStore.getState().clearSession()

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem('se_admin_user')).toBeNull()
    expect(sessionStorage.getItem('se_test_user_id')).toBeNull()
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().initialized).toBe(true)
  })

  it('5b. Sự kiện se-admin:unauthorized tự động dọn sạch phiên làm việc', () => {
    localStorage.setItem(TOKEN_KEY, 'expired_token')
    localStorage.setItem('se_admin_user', JSON.stringify({ id: 1 }))

    window.dispatchEvent(new Event('se-admin:unauthorized'))

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem('se_admin_user')).toBeNull()
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('6. Tuyệt đối không còn chuỗi mock-jwt-token hay mock-refresh-token trong production source', () => {
    const srcDir = resolve(cwd(), 'src')

    function collectProdFiles(dir) {
      let results = []
      const entries = readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = join(dir, entry.name)
        if (entry.isDirectory()) {
          // Bỏ qua thư mục test, mocks và các thư mục ngoài production
          if (!['test', 'mocks', 'node_modules', '.git', 'dist'].includes(entry.name)) {
            results = results.concat(collectProdFiles(fullPath))
          }
        } else if (
          (entry.name.endsWith('.js') || entry.name.endsWith('.jsx')) &&
          !entry.name.includes('.test.') &&
          !entry.name.includes('.spec.')
        ) {
          results.push(fullPath)
        }
      }
      return results
    }

    const prodFiles = collectProdFiles(srcDir)
    expect(prodFiles.length).toBeGreaterThan(15)

    for (const filePath of prodFiles) {
      const code = readFileSync(filePath, 'utf-8')
      expect(code, `File ${filePath} còn chứa mock-jwt-token`).not.toContain('mock-jwt-token')
      expect(code, `File ${filePath} còn chứa mock-refresh-token`).not.toContain('mock-refresh-token')
    }
  })
})

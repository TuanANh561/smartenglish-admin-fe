import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { TOKEN_KEY } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

const hasStoredToken = () => {
  try {
    return Boolean(window.localStorage.getItem(TOKEN_KEY))
  } catch {
    return false
  }
}

/**
 * Bọc trang đăng nhập: trình duyệt đã có phiên (tab khác đang đăng nhập) thì vào thẳng dashboard.
 * Mỗi máy chỉ một phiên — không cho đăng nhập tài khoản thứ hai đè lên phiên đang chạy ở tab khác.
 * Chỉ kiểm tra lúc mở trang, để luồng đăng nhập + OTP tự điều hướng sau khi thành công.
 */
export default function GuestOnlyRoute({ children }) {
  const user = useAuthStore((s) => s.user)
  const [hasSessionOnEnter] = useState(() => Boolean(user) && hasStoredToken())

  if (hasSessionOnEnter) {
    return <Navigate to="/app" replace />
  }
  return children
}

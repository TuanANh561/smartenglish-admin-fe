import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas p-6 text-center">
      <Compass size={18} strokeWidth={1.75} className="text-ink-muted" />
      <h1 className="text-2xl font-semibold text-navy-700">Không tìm thấy trang</h1>
      <p className="text-sm text-ink-muted">
        Đường dẫn bạn truy cập không tồn tại hoặc đã bị thay đổi.
      </p>
      <Link
        to="/"
        className="mt-3 inline-flex h-10 items-center justify-center rounded-lg bg-navy-700 px-4 text-sm font-medium text-white hover:bg-navy-800"
      >
        Về trang Dashboard
      </Link>
    </div>
  )
}

export default NotFound

import { Lock } from 'lucide-react'

/** Bọc phần cài đặt chưa được hiện thực: vẫn xem trước được nhưng khoá thao tác. */
export default function ComingSoonSection({ children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-lg bg-[#FEF3C7] px-3 py-2 text-sm text-[#A16207]">
        <Lock size={16} strokeWidth={1.75} />
        <span>Sắp ra mắt</span>
      </div>
      <div className="pointer-events-none select-none opacity-60" aria-disabled="true">
        {children}
      </div>
    </div>
  )
}

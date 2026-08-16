import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

function Modal({ open, onClose, title, children, className }) {
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        className={cn(
          'w-full max-w-md rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]',
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          {title && <h3 className="text-base font-semibold text-navy-700">{title}</h3>}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="ml-auto rounded-full p-1 text-ink-muted hover:bg-canvas hover:text-ink"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal

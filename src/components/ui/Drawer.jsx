import { useEffect, useState } from 'react'
import { Maximize2, Minimize2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const SIZE_CLASSES = {
  sm: 'max-w-[380px]',
  default: 'max-w-[460px]',
  md: 'max-w-[540px]',
  lg: 'max-w-2xl', // 672px
  xl: 'max-w-3xl', // 768px
  '2xl': 'max-w-4xl', // 896px
  '3xl': 'max-w-5xl', // 1024px
  full: 'max-w-full',
}

function Drawer({ open, onClose, title, children, className, size = 'default', allowFullscreen = true }) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (!open) {
      setIsFullscreen(false)
      return
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const targetSizeClass = isFullscreen ? 'max-w-full' : (SIZE_CLASSES[size] || SIZE_CLASSES.default)

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-[1px] transition-opacity duration-200"
      onClick={() => onClose?.()}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        className={cn(
          'flex h-full w-full flex-col overflow-y-auto bg-white p-5 shadow-2xl transition-[max-width] duration-300 ease-in-out custom-scrollbar',
          targetSizeClass,
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
          {title && <h3 className="text-base font-bold text-navy-800 line-clamp-1">{title}</h3>}
          <div className="ml-auto flex items-center gap-1 shrink-0">
            {allowFullscreen && (
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                aria-label={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
                title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Phóng to toàn màn hình'}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer transition-colors"
              >
                {isFullscreen ? <Minimize2 size={16} strokeWidth={2} /> : <Maximize2 size={16} strokeWidth={2} />}
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onClose?.()
              }}
              aria-label="Đóng"
              title="Đóng (Esc)"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer transition-colors"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">{children}</div>
      </div>
    </div>
  )
}

export default Drawer

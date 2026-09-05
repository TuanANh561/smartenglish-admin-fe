import { cn } from '@/lib/utils'

const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
}

function Avatar({ src, name = '', size = 'md', status, className }) {
  const initial = name.trim().charAt(0).toUpperCase()

  return (
    <span className={cn('relative inline-flex shrink-0', SIZE_CLASSES[size], className)}>
      {src ? (
        <img src={src} alt={name} className="h-full w-full rounded-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center rounded-full bg-brand-200 font-semibold text-navy-700">
          {initial}
        </span>
      )}
      {status === 'online' && (
        <span className="absolute bottom-0 right-0 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#15803D] opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-[#15803D]" />
        </span>
      )}
    </span>
  )
}

export default Avatar

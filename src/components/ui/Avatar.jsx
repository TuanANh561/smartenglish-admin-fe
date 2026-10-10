import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

const SIZE_CLASSES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-14 w-14 text-lg',
}

export function sanitizeAvatarUrl(url) {
  if (!url || typeof url !== 'string') return null
  let s = url.trim()
  // Strip markdown [url](url) format
  const mdMatch = s.match(/\((https?:\/\/[^\s)]+)\)/) || s.match(/(https?:\/\/[^\s\])]+)/)
  if (mdMatch) s = mdMatch[1]
  if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:') || s.startsWith('/')) {
    return s
  }
  return null
}

const STATUS_DOT_SIZES = {
  xs: 'h-2 w-2 border',
  sm: 'h-2.5 w-2.5 border-[1.5px]',
  md: 'h-3.5 w-3.5 border-2',
  lg: 'h-4 w-4 border-2',
  xl: 'h-4.5 w-4.5 border-2',
}

function Avatar({ src, name = '', size = 'md', status, className }) {
  const [hasError, setHasError] = useState(false)
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || 'U'
  const validSrc = sanitizeAvatarUrl(src)

  useEffect(() => {
    setHasError(false)
  }, [src])

  return (
    <span className={cn('relative inline-flex shrink-0 select-none rounded-full', SIZE_CLASSES[size] || SIZE_CLASSES.md, className)}>
      {validSrc && !hasError ? (
        <img
          src={validSrc}
          alt={name}
          onError={() => setHasError(true)}
          className="h-full w-full rounded-full object-cover border border-slate-200/60"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-200 font-bold text-brand-800 border border-brand-300/60 shadow-2xs">
          {initial}
        </span>
      )}
      {status === 'online' && (
        <span
          className={cn(
            'absolute bottom-0 right-0 aspect-square rounded-full border-white bg-emerald-500 shadow-xs z-10 block shrink-0',
            STATUS_DOT_SIZES[size] || STATUS_DOT_SIZES.md
          )}
          title="Đang hoạt động"
        />
      )}
    </span>
  )
}

export default Avatar

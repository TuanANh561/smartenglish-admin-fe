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
        <span className="absolute bottom-0 right-0 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#15803D] opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-[#15803D]" />
        </span>
      )}
    </span>
  )
}

export default Avatar

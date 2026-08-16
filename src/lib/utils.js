import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNowStrict } from 'date-fns'
import { vi } from 'date-fns/locale'

export function cn(...inputs) {
  return twMerge(clsx(...inputs))
}

export function formatCurrency(value, { compact = false } = {}) {
  if (compact && Math.abs(value) >= 1_000_000) {
    const million = Math.round((value / 1_000_000) * 10) / 10
    return `${million}Mđ`
  }
  return `${value.toLocaleString('vi-VN')}đ`
}

export function formatNumber(value) {
  return value.toLocaleString('en-US')
}

export function formatDate(value, pattern = 'dd/MM/yyyy') {
  return format(new Date(value), pattern, { locale: vi })
}

export function formatRelativeTime(value) {
  return `${formatDistanceToNowStrict(new Date(value), { locale: vi })} trước`
}

export function formatPercent(value) {
  const rounded = Math.round(value * 10) / 10
  return `${rounded}%`
}

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
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
  if (!value) return '—'
  try {
    const d = new Date(value)
    if (isNaN(d.getTime())) return '—'
    return format(d, pattern, { locale: vi })
  } catch {
    return '—'
  }
}

export function formatRelativeTime(value, fallback) {
  if (!value) return fallback !== undefined ? fallback : 'Vừa xong'
  if (value === 'Vừa xong') return 'Vừa xong'
  try {
    const d = new Date(value)
    if (isNaN(d.getTime())) return fallback !== undefined ? fallback : String(value)
    const now = new Date()
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000)

    if (diffSec < 15 && diffSec >= -5) return 'Vừa xong'
    if (diffSec < 60 && diffSec >= 0) return `${diffSec} giây trước`
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60 && diffMin >= 0) return `${diffMin} phút trước`
    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24 && diffHour >= 0) return `${diffHour} giờ trước`
    const diffDay = Math.floor(diffHour / 24)
    if (diffDay === 1) return 'Hôm qua'
    if (diffDay < 7 && diffDay >= 0) return `${diffDay} ngày trước`
    const diffWeek = Math.floor(diffDay / 7)
    if (diffWeek < 5 && diffWeek >= 0) return `${diffWeek} tuần trước`
    const diffMonth = Math.floor(diffDay / 30)
    if (diffMonth < 12 && diffMonth >= 0) return `${diffMonth} tháng trước`
    const diffYear = Math.floor(diffDay / 365)
    return `${diffYear} năm trước`
  } catch {
    return fallback !== undefined ? fallback : 'Vừa xong'
  }
}

export function formatPercent(value) {
  const rounded = Math.round(value * 10) / 10
  return `${rounded}%`
}

export function maskEmail(email) {
  if (!email || typeof email !== 'string' || !email.includes('@')) return '••••••••'
  const [name, domain] = email.split('@')
  if (name.length <= 2) return `${name.charAt(0)}***@${domain}`
  return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`
}

export function maskIdentityCard(card) {
  if (!card) return '••••••••••••'
  const str = String(card).trim()
  if (str.length <= 4) return '••••••••••••'
  return `${str.slice(0, 4)}******${str.slice(-2)}`
}

export function maskPhone(phone) {
  if (!phone) return '••••••••••'
  const str = String(phone).trim()
  if (str.length <= 4) return '••••••••••'
  return `${str.slice(0, 3)}****${str.slice(-3)}`
}


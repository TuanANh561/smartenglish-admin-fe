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


import { describe, expect, it } from 'vitest'
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
  formatRelativeTime,
} from './utils'

describe('formatCurrency', () => {
  it('rút gọn theo triệu', () => {
    expect(formatCurrency(45200000, { compact: true })).toBe('45.2Mđ')
  })

  it('hiển thị đầy đủ với dấu chấm ngăn nghìn', () => {
    expect(formatCurrency(299000)).toBe('299.000đ')
  })

  it('rút gọn dưới 1 triệu thì trả về dạng đầy đủ', () => {
    expect(formatCurrency(299000, { compact: true })).toBe('299.000đ')
  })
})

describe('formatNumber', () => {
  it('ngăn cách nghìn bằng dấu phẩy', () => {
    expect(formatNumber(28400)).toBe('28,400')
  })
})

describe('formatDate', () => {
  it('định dạng ngày/tháng/năm mặc định', () => {
    expect(formatDate('2026-08-16T00:00:00')).toBe('16/08/2026')
  })

  it('dùng pattern tuỳ chỉnh', () => {
    expect(formatDate('2026-08-16T00:00:00', 'dd MMMM yyyy')).toBe('16 tháng 08 2026')
  })
})

describe('formatRelativeTime', () => {
  it('vài phút trước', () => {
    const value = new Date(Date.now() - 2 * 60 * 1000)
    expect(formatRelativeTime(value)).toBe('2 phút trước')
  })

  it('vài ngày trước', () => {
    const value = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    expect(formatRelativeTime(value)).toBe('3 ngày trước')
  })
})

describe('formatPercent', () => {
  it('làm tròn 1 chữ số thập phân', () => {
    expect(formatPercent(8.3)).toBe('8.3%')
  })

  it('số nguyên không thêm .0', () => {
    expect(formatPercent(20)).toBe('20%')
  })
})

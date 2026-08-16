import Papa from 'papaparse'
import { formatDate } from '@/lib/utils'

const BOM = '﻿'

/**
 * Xuất `rows` ra file CSV tải về máy.
 * `columns`: [{ key, label, value? }] — `label` là tiêu đề cột tiếng Việt,
 * `value(row)` tuỳ chọn để tự định dạng giá trị, mặc định lấy `row[key]`.
 */
export function exportCsv(rows, columns, domain) {
  const data = rows.map((row) =>
    Object.fromEntries(
      columns.map((col) => [col.label, col.value ? col.value(row) : (row[col.key] ?? '')]),
    ),
  )

  const csv = Papa.unparse(data)
  // BOM bắt buộc để Excel đọc đúng tiếng Việt có dấu.
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${domain}-${formatDate(new Date(), 'yyyy-MM-dd')}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

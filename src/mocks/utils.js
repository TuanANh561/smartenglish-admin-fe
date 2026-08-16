/** Cắt trang + tìm kiếm + lọc + sắp xếp trên mảng, trả đúng shape mà API thật sẽ trả. */
export function paginate(
  rows,
  { page = 1, size = 10, search, searchFields = [], filters = {}, sortBy, sortDir = 'asc' } = {},
) {
  let result = rows

  const keyword = search?.trim().toLowerCase()
  if (keyword && searchFields.length) {
    result = result.filter((row) =>
      searchFields.some((field) => String(row[field] ?? '').toLowerCase().includes(keyword)),
    )
  }

  for (const [field, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '' || value === 'all') continue
    result = result.filter((row) => row[field] === value)
  }

  if (sortBy) {
    const dir = sortDir === 'desc' ? -1 : 1
    result = [...result].sort((a, b) => {
      const va = a[sortBy]
      const vb = b[sortBy]
      if (va == null && vb == null) return 0
      if (va == null) return dir
      if (vb == null) return -dir
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir
      return String(va).localeCompare(String(vb), 'vi') * dir
    })
  }

  const total = result.length
  const start = (page - 1) * size

  return {
    items: structuredClone(result.slice(start, start + size)),
    total,
    page,
    size,
    totalPages: Math.max(1, Math.ceil(total / size)),
  }
}

/** Ngày lùi `n` ngày so với hôm nay, dạng 'YYYY-MM-DD'. */
export function daysAgo(n) {
  const date = new Date()
  date.setDate(date.getDate() - n)
  return date.toISOString().slice(0, 10)
}

/** Thời điểm lùi `n` phút, dạng ISO. */
export function minutesAgo(n) {
  return new Date(Date.now() - n * 60_000).toISOString()
}

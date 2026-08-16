/** Cắt trang + tìm kiếm + lọc trên mảng, trả đúng shape mà API thật sẽ trả. */
export function paginate(rows, { page = 1, size = 10, search, searchFields = [], filters = {} } = {}) {
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

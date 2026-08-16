import { useMemo, useState } from 'react'

/**
 * Gom trạng thái page/size/search/sorting/filters của một bảng dữ liệu.
 * `params` trả về đúng object để truyền thẳng vào hàm api của feature
 * (vd `getUsers(dataTable.params)`), không cần feature tự ghép tham số.
 */
export function useDataTable({ initialSize = 10, initialFilters = {} } = {}) {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(initialSize)
  const [search, setSearchState] = useState('')
  const [sorting, setSortingState] = useState([])
  const [filters, setFiltersState] = useState(initialFilters)

  const params = useMemo(() => {
    const sort = sorting[0]
    return {
      page,
      size,
      search: search || undefined,
      sortBy: sort?.id,
      sortDir: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
      ...filters,
    }
  }, [page, size, search, sorting, filters])

  const setSearch = (value) => {
    setSearchState(value)
    setPage(1)
  }

  const setFilter = (key, value) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const setSorting = (updaterOrValue) => {
    setSortingState((prev) => (typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue))
    setPage(1)
  }

  return {
    page,
    size,
    search,
    sorting,
    filters,
    params,
    setPage,
    setSize,
    setSearch,
    setFilter,
    setSorting,
  }
}

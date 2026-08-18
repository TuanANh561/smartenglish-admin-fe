import { Download, Plus, Upload, Play, Pencil, Trash2 } from 'lucide-react'
import { useState, useMemo } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Pagination from '@/components/ui/Pagination'
import { vocabularies } from '@/mocks/data/vocabulary'
import { vocabularyColumns } from './columns'

const PAGE_SIZE = 10

function VocabularyPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState(new Set())

  // Lọc dữ liệu theo tìm kiếm
  const filtered = useMemo(() => {
    if (!search.trim()) return vocabularies
    const keyword = search.toLowerCase()
    return vocabularies.filter(
      (v) =>
        v.word.toLowerCase().includes(keyword) ||
        v.vietnameseMeaning.toLowerCase().includes(keyword) ||
        v.pronunciation.toLowerCase().includes(keyword),
    )
  }, [search])

  const total = filtered.length
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const start = (page - 1) * PAGE_SIZE
  const pageData = filtered.slice(start, start + PAGE_SIZE)

  const allSelected = pageData.length > 0 && pageData.every((v) => selectedIds.has(v.id))
  const someSelected = pageData.some((v) => selectedIds.has(v.id))

  const handleSelectAll = (checked) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      pageData.forEach((v) => newSelected.add(v.id))
    } else {
      pageData.forEach((v) => newSelected.delete(v.id))
    }
    setSelectedIds(newSelected)
  }

  const handleSelectRow = (id, checked) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

  return (
    <main className="flex-1 bg-canvas p-6 space-y-5">
      <Card>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-line">
          <div className="flex-1 min-w-xs">
            <Input
              placeholder="Tìm kiếm từ vựng, ý nghĩa..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full max-w-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" icon={Upload}>
              Import file Excel/CSV
            </Button>
            <Button size="sm" variant="secondary" icon={Download}>
              Export dữ liệu
            </Button>
            <Button size="sm" icon={Plus}>
              Thêm từ mới
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas border-b border-line">
              <tr>
                <th className="w-10 px-4 py-2">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-line text-brand-500"
                  />
                </th>
                {vocabularyColumns.map((col) => (
                  <th
                    key={col.accessorKey}
                    className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-muted"
                  >
                    {typeof col.header === 'function' ? col.header() : col.header}
                  </th>
                ))}
                <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Audio
                </th>
                <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={vocabularyColumns.length + 3} className="px-4 py-6 text-center text-ink-muted">
                    Chưa có từ vựng nào khớp với tìm kiếm
                  </td>
                </tr>
              ) : (
                pageData.map((vocab) => (
                  <tr key={vocab.id} className="hover:bg-canvas transition-colors">
                    <td className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(vocab.id)}
                        onChange={(e) => handleSelectRow(vocab.id, e.target.checked)}
                        className="h-4 w-4 rounded border-line text-brand-500"
                      />
                    </td>
                    {vocabularyColumns.map((col) => (
                      <td key={`${vocab.id}-${col.accessorKey}`} className="px-4 py-3">
                        {col.cell({ getValue: () => vocab[col.accessorKey], row: { original: vocab } })}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <button className="text-ink-muted hover:text-brand-500 transition-colors">
                        <Play size={18} strokeWidth={1.75} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="text-ink-muted hover:text-brand-500 transition-colors">
                          <Pencil size={18} strokeWidth={1.75} />
                        </button>
                        <button className="text-ink-muted hover:text-red-600 transition-colors">
                          <Trash2 size={18} strokeWidth={1.75} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 px-5 pb-4 pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line">
          <p className="text-xs text-ink-muted">
            Hiển thị <strong>{total === 0 ? 0 : start + 1}</strong>-<strong>{Math.min(start + PAGE_SIZE, total)}</strong> trong tổng số{' '}
            <strong>{total}</strong> từ vựng
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </Card>
    </main>
  )
}

export default VocabularyPage

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
    <div className="space-y-4">
      {/* Table card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-100">
          <div className="flex-1 min-w-[260px] max-w-md">
            <div className="relative flex items-center">
              <Search size={18} className="pointer-events-none absolute left-3 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm từ vựng, ý nghĩa, phiên âm..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" icon={Upload}>
              Import Excel/CSV
            </Button>
            <Button size="sm" variant="secondary" icon={Download}>
              Xuất dữ liệu
            </Button>
            <Button size="sm" icon={Plus}>
              Thêm từ mới
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="w-12 px-6 py-3.5">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                </th>
                {vocabularyColumns.map((col) => (
                  <th
                    key={col.accessorKey}
                    className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    {typeof col.header === 'function' ? col.header() : col.header}
                  </th>
                ))}
                <th className="px-6 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                  Audio
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={vocabularyColumns.length + 3} className="px-6 py-8 text-center text-sm text-slate-400">
                    Chưa có từ vựng nào khớp với tìm kiếm
                  </td>
                </tr>
              ) : (
                pageData.map((vocab) => (
                  <tr key={vocab.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="w-12 px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(vocab.id)}
                        onChange={(e) => handleSelectRow(vocab.id, e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                    </td>
                    {vocabularyColumns.map((col) => (
                      <td key={`${vocab.id}-${col.accessorKey}`} className="px-6 py-4 text-sm">
                        {col.cell({ getValue: () => vocab[col.accessorKey], row: { original: vocab } })}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-center">
                      <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-colors cursor-pointer" title="Phát âm thanh">
                        <Play size={16} strokeWidth={2} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 text-slate-400">
                        <button className="rounded-lg p-1.5 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer" title="Sửa">
                          <Pencil size={16} strokeWidth={1.75} />
                        </button>
                        <button className="rounded-lg p-1.5 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer" title="Xóa">
                          <Trash2 size={16} strokeWidth={1.75} />
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
          <p className="text-xs text-slate-500">
            Hiển thị <strong>{total === 0 ? 0 : start + 1}</strong>-<strong>{Math.min(start + PAGE_SIZE, total)}</strong> trong tổng số{' '}
            <strong>{total}</strong> từ vựng
          </p>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  )
}

export default VocabularyPage

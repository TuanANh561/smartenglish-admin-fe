import { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Dropdown chọn Chủ đề có ô tìm kiếm, xóa nhanh và hỗ trợ nhập chủ đề mới tự do.
 */
export function TopicSelect({ value, onChange, dbTopics = [] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef(null)

  // Danh sách chủ đề chuẩn hóa từ CSDL
  const topicList = useMemo(() => {
    return dbTopics.map((t) => ({
      id: t.id,
      name: t.nameVi || t.nameEn,
      nameEn: t.nameEn,
      wordCount: t.wordCount,
    }))
  }, [dbTopics])

  // Lọc chủ đề theo từ khóa tìm kiếm
  const filteredTopics = useMemo(() => {
    if (!query.trim()) return topicList
    const q = query.toLowerCase()
    return topicList.filter(
      (t) => t.name.toLowerCase().includes(q) || (t.nameEn && t.nameEn.toLowerCase().includes(q))
    )
  }, [topicList, query])

  // Click outside để đóng dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (topicName) => {
    onChange(topicName)
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">Chủ đề</label>
      <div className="relative flex items-center">
        <input
          type="text"
          value={isOpen ? query : value}
          onChange={(e) => {
            if (!isOpen) setIsOpen(true)
            setQuery(e.target.value)
            onChange(e.target.value)
          }}
          onFocus={() => {
            setQuery(value || '')
            setIsOpen(true)
          }}
          placeholder="Tìm hoặc chọn chủ đề..."
          className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-3.5 pr-16 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('')
                setQuery('')
              }}
              className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Xóa chủ đề"
            >
              <X size={13} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            title="Mở danh sách chủ đề"
          >
            <ChevronDown size={15} className={cn('transition-transform duration-200', isOpen && 'rotate-180')} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-56 overflow-y-auto select-scrollbar pr-1 rounded-xl border border-line bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100">
          {filteredTopics.length > 0 ? (
            filteredTopics.map((t) => {
              const isSelected = value === t.name
              return (
                <button
                  key={t.id || t.name}
                  type="button"
                  onClick={() => handleSelect(t.name)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg transition-colors cursor-pointer',
                    isSelected
                      ? 'bg-brand-50 text-brand-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50 font-medium'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate">{t.name}</span>
                    {t.nameEn && <span className="text-[11px] text-slate-400 truncate">({t.nameEn})</span>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && <Check size={14} className="text-brand-600" />}
                  </div>
                </button>
              )
            })
          ) : (
            <div className="px-3 py-2 text-center text-xs text-slate-400">
              Không tìm thấy chủ đề sẵn có. Nhấn ra ngoài để lưu chủ đề &quot;{query}&quot;.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TopicSelect

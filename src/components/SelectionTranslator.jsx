import { useCallback, useEffect, useRef, useState } from 'react'
import { Languages, Loader2, X } from 'lucide-react'
import { rawHttp } from '@/lib/api'

const MAX_LENGTH = 300
// Chữ có dấu tiếng Việt → không phải đoạn tiếng Anh cần dịch
const VIETNAMESE_CHARS = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i

function isEditable(node) {
  const el = node?.nodeType === 1 ? node : node?.parentElement
  return Boolean(el?.closest('input, textarea, select, [contenteditable="true"], [data-no-translate]'))
}

/**
 * Bôi đen một từ/cụm từ tiếng Anh ở bất kỳ trang nào → hiện nút "Dịch" cạnh vùng chọn.
 * Bỏ qua ô nhập liệu để không cản trở việc soạn nội dung.
 */
export default function SelectionTranslator() {
  const [selection, setSelection] = useState(null) // { text, x, y }
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const boxRef = useRef(null)

  const close = useCallback(() => {
    setSelection(null)
    setResult(null)
    setError('')
    setLoading(false)
  }, [])

  useEffect(() => {
    const onMouseUp = (event) => {
      if (boxRef.current?.contains(event.target)) return
      // đợi trình duyệt cập nhật vùng chọn sau khi nhả chuột
      setTimeout(() => {
        const sel = window.getSelection()
        const text = sel?.toString().replace(/\s+/g, ' ').trim() ?? ''
        if (!text || !sel.rangeCount || isEditable(sel.anchorNode)) return
        if (text.length > MAX_LENGTH || !/[A-Za-z]/.test(text) || VIETNAMESE_CHARS.test(text)) return
        const rect = sel.getRangeAt(0).getBoundingClientRect()
        if (!rect.width && !rect.height) return
        setResult(null)
        setError('')
        setSelection({
          text,
          x: Math.min(Math.max(rect.left + rect.width / 2, 160), window.innerWidth - 160),
          y: rect.bottom + 8,
        })
      }, 0)
    }
    const onMouseDown = (event) => {
      if (!boxRef.current?.contains(event.target)) close()
    }
    const onKey = (event) => event.key === 'Escape' && close()

    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', close, true)
    return () => {
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', close, true)
    }
  }, [close])

  const translate = async () => {
    if (!selection) return
    setLoading(true)
    setError('')
    try {
      const res = await rawHttp.post('/content/translate', { text: selection.text }, { timeout: 20000 })
      const data = res.data?.data ?? res.data
      if (!data?.translation) throw new Error('Chưa dịch được lúc này')
      setResult(data)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Chưa dịch được lúc này')
    } finally {
      setLoading(false)
    }
  }

  if (!selection) return null

  const flipUp = selection.y > window.innerHeight - 180

  return (
    <div
      ref={boxRef}
      data-no-translate
      className="fixed z-[70] w-[300px] -translate-x-1/2 rounded-xl border border-line bg-white p-3 text-sm text-ink shadow-[0_8px_24px_rgba(16,24,40,0.12)]"
      style={flipUp ? { left: selection.x, bottom: window.innerHeight - selection.y + 40 } : { left: selection.x, top: selection.y }}
    >
      <div className="flex items-start gap-2">
        <p className="flex-1 line-clamp-2 font-semibold text-navy-700">{selection.text}</p>
        <button type="button" onClick={close} aria-label="Đóng" className="text-ink-muted hover:text-ink cursor-pointer">
          <X size={16} strokeWidth={1.75} />
        </button>
      </div>

      {result ? (
        <div className="mt-2 space-y-1">
          {result.ipa ? (
            <p className="text-xs text-ink-muted">
              {result.ipa}
              {result.partOfSpeech ? ` · ${result.partOfSpeech}` : ''}
            </p>
          ) : null}
          <p className="font-medium text-ink">{result.translation}</p>
          {result.note ? <p className="text-xs text-ink-muted">{result.note}</p> : null}
        </div>
      ) : error ? (
        <p className="mt-2 text-xs text-[#B91C1C]">{error}</p>
      ) : (
        <button
          type="button"
          onClick={translate}
          disabled={loading}
          className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-60 cursor-pointer"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Languages size={14} strokeWidth={1.75} />}
          Dịch
        </button>
      )}
    </div>
  )
}

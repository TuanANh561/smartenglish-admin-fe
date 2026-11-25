import { useRef, useState } from 'react'
import { FileJson, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'

/** Đọc JSON: chấp nhận mảng, hoặc đối tượng có `items` / `data`, hoặc một đối tượng lẻ. */
export function parseJsonItems(text) {
  const parsed = JSON.parse(text)
  if (Array.isArray(parsed)) return parsed
  if (Array.isArray(parsed?.items)) return parsed.items
  if (Array.isArray(parsed?.data)) return parsed.data
  if (parsed && typeof parsed === 'object') return [parsed]
  throw new Error('File JSON phải là một mảng các mục.')
}

/**
 * Nhập học liệu hàng loạt từ JSON.
 * Quản trị viên: thêm thẳng vào kho. Giáo viên: mỗi mục thành một yêu cầu chờ duyệt.
 *
 * @param validate (item) => chuỗi lỗi hoặc null
 * @param toPayload (item) => dữ liệu gửi lên máy chủ
 * @param create (payload) => Promise
 */
function JsonImportModal({ open, onClose, title, sample, titleOf, validate, toPayload, create, onDone }) {
  const role = String(useAuthStore((s) => s.user?.role) || '').toLowerCase()
  const isTeacher = role === 'teacher'
  const fileRef = useRef(null)
  const [text, setText] = useState('')
  const [items, setItems] = useState(null)
  const [parseError, setParseError] = useState('')
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(0)

  const reset = () => {
    setText('')
    setItems(null)
    setParseError('')
    setDone(0)
  }

  const close = () => {
    if (running) return
    reset()
    onClose?.()
  }

  const parse = (raw) => {
    setText(raw)
    if (!raw.trim()) {
      setItems(null)
      setParseError('')
      return
    }
    try {
      const list = parseJsonItems(raw)
      setItems(list.map((item) => ({ item, error: validate?.(item) ?? null })))
      setParseError('')
    } catch (e) {
      setItems(null)
      setParseError(e instanceof SyntaxError ? 'JSON không hợp lệ: ' + e.message : e.message)
    }
  }

  const onFile = async (file) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.json')) {
      toast.error('Chỉ hỗ trợ file .json')
      return
    }
    parse(await file.text())
  }

  const valid = (items ?? []).filter((r) => !r.error)

  const run = async () => {
    setRunning(true)
    setDone(0)
    let ok = 0
    const failed = []
    for (const row of valid) {
      try {
        await create(toPayload ? toPayload(row.item) : row.item)
        ok++
      } catch (e) {
        failed.push(`${titleOf(row.item) || 'Mục không tên'}: ${e?.message || 'lỗi'}`)
      }
      setDone((d) => d + 1)
    }
    setRunning(false)
    if (ok > 0) {
      toast.success(
        isTeacher
          ? `Đã gửi ${ok} yêu cầu. Học liệu sẽ được thêm sau khi quản trị viên duyệt.`
          : `Đã nhập ${ok} mục vào kho.`,
        { duration: 6000 },
      )
    }
    if (failed.length > 0) toast.error(`${failed.length} mục lỗi. ${failed.slice(0, 2).join('; ')}`, { duration: 8000 })
    onDone?.()
    reset()
    onClose?.()
  }

  const downloadSample = () => {
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mau-nhap.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Modal open={open} onClose={close} title={title} className="max-w-2xl">
      <div className="space-y-4">
        <p className="text-sm text-ink-muted">
          {isTeacher
            ? 'Mỗi mục trong file sẽ thành một yêu cầu chờ quản trị viên duyệt.'
            : 'Các mục hợp lệ sẽ được thêm thẳng vào kho.'}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" icon={Upload} onClick={() => fileRef.current?.click()} disabled={running}>
            Chọn file .json
          </Button>
          <Button size="sm" variant="secondary" icon={FileJson} onClick={downloadSample} disabled={running}>
            Tải file mẫu
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              onFile(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </div>

        <textarea
          value={text}
          onChange={(e) => parse(e.target.value)}
          rows={6}
          disabled={running}
          placeholder="Hoặc dán nội dung JSON vào đây"
          className="w-full rounded-lg border border-line px-3 py-2 font-mono text-xs text-ink focus:border-brand-500 focus:outline-none"
        />

        {parseError && <p className="text-sm text-[#B91C1C]">{parseError}</p>}

        {items && (
          <div className="max-h-64 overflow-y-auto rounded-lg border border-line">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-canvas text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th className="w-10 px-3 py-2">#</th>
                  <th className="px-3 py-2">Tiêu đề</th>
                  <th className="w-40 px-3 py-2">Kiểm tra</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((row, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-ink-muted">{i + 1}</td>
                    <td className="truncate px-3 py-2 text-ink">{titleOf(row.item) || 'Không có tiêu đề'}</td>
                    <td className="px-3 py-2">
                      {row.error ? <Badge tone="danger">{row.error}</Badge> : <Badge tone="success">Hợp lệ</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
          <span className="text-sm text-ink-muted">
            {running ? `Đang xử lý ${done}/${valid.length}...` : items ? `${valid.length}/${items.length} mục hợp lệ` : ''}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={close} disabled={running}>
              Đóng
            </Button>
            <Button onClick={run} loading={running} disabled={valid.length === 0}>
              {isTeacher ? `Gửi duyệt ${valid.length || ''} mục` : `Nhập ${valid.length || ''} mục`}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default JsonImportModal

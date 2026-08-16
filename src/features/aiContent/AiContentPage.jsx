import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  BookOpen,
  CheckCheck,
  ClipboardList,
  Filter,
  MessageSquareQuote,
  Pencil,
  X,
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import StatTile from '@/components/ui/StatTile'
import Tabs from '@/components/ui/Tabs'
import Textarea from '@/components/ui/Textarea'
import MiniBarChart from '@/components/charts/MiniBarChart'
import { formatNumber } from '@/lib/utils'
import { AI_PROMPT_CONFIG, aiContentItems } from '@/mocks/data/aiContent'

const TABS = [
  { value: 'vocab', label: 'New Vocab' },
  { value: 'example', label: 'Examples' },
  { value: 'exam', label: 'Exams' },
]

const TYPE_ICON = { vocab: BookOpen, phrase: MessageSquareQuote, exam: ClipboardList }

function confidenceTone(score) {
  if (score >= 90) return 'success'
  if (score >= 80) return 'info'
  if (score >= 70) return 'warning'
  return 'danger'
}

function AiContentPage() {
  const [activeTab, setActiveTab] = useState('vocab')
  const [items, setItems] = useState(aiContentItems)
  const [editingItem, setEditingItem] = useState(null)
  const [editText, setEditText] = useState('')
  const [temperature, setTemperature] = useState(AI_PROMPT_CONFIG.temperature)
  const [topP, setTopP] = useState(AI_PROMPT_CONFIG.topP)

  const pendingItems = useMemo(() => items.filter((item) => item.status === 'pending'), [items])
  const visibleItems = useMemo(
    () => pendingItems.filter((item) => item.type === activeTab),
    [pendingItems, activeTab],
  )

  const updateStatus = (id, status) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)))
    toast.success(status === 'approved' ? 'Đã duyệt nội dung' : 'Đã từ chối nội dung')
  }

  const handleBulkApprove = () => {
    setItems((prev) =>
      prev.map((item) => (item.type === activeTab && item.status === 'pending' ? { ...item, status: 'approved' } : item)),
    )
    toast.success('Đã duyệt tất cả nội dung trong tab này')
  }

  const openEdit = (item) => {
    setEditingItem(item)
    setEditText(item.definition)
  }

  const saveEdit = () => {
    setItems((prev) =>
      prev.map((item) => (item.id === editingItem.id ? { ...item, definition: editText } : item)),
    )
    toast.success('Đã lưu thay đổi')
    setEditingItem(null)
  }

  return (
    <main className="flex-1 bg-canvas p-6">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
        {/* LEFT — nội dung chờ duyệt */}
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Badge tone="danger">{pendingItems.length} mục đang chờ duyệt</Badge>
            <div className="flex items-center gap-2">
              <Button variant="secondary" icon={Filter}>
                Lọc
              </Button>
              <Button icon={CheckCheck} onClick={handleBulkApprove}>
                Duyệt tất cả (Bulk)
              </Button>
            </div>
          </div>

          <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} />

          {visibleItems.length === 0 ? (
            <EmptyState title="Không còn nội dung chờ duyệt" description="Mọi mục trong tab này đã được xử lý." />
          ) : (
            <div className="space-y-4">
              {visibleItems.map((item) => {
                const Icon = TYPE_ICON[item.icon]
                return (
                  <Card key={item.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                          <Icon size={18} strokeWidth={1.75} />
                        </span>
                        <div>
                          <h3 className="text-base font-semibold text-navy-700">{item.title}</h3>
                          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                            {item.typeLabel}
                          </p>
                        </div>
                      </div>
                      <Badge tone={confidenceTone(item.confidenceScore)}>
                        Độ tin cậy {item.confidenceScore}%
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                          Định nghĩa
                        </p>
                        <p className="mt-1 text-sm text-ink">{item.definition}</p>
                      </div>

                      {item.chartData && (
                        <div className="rounded-lg bg-canvas p-3">
                          <MiniBarChart data={item.chartData} height={64} />
                        </div>
                      )}

                      {item.context && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                            Ngữ cảnh (AI sinh)
                          </p>
                          <p className="mt-1 text-sm italic text-ink-muted">"{item.context}"</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center gap-2 border-t border-line pt-4">
                      <Button className="flex-1" onClick={() => updateStatus(item.id, 'approved')}>
                        Duyệt
                      </Button>
                      <Button variant="secondary" className="flex-1" icon={Pencil} onClick={() => openEdit(item)}>
                        Sửa
                      </Button>
                      <Button
                        variant="danger"
                        aria-label="Từ chối"
                        onClick={() => updateStatus(item.id, 'rejected')}
                      >
                        <X size={18} strokeWidth={1.75} />
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* RIGHT — AI Prompt Control, sticky */}
        <div className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <Card>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-navy-700">Cấu hình AI Prompt</h2>
              <Badge tone="neutral">{AI_PROMPT_CONFIG.model}</Badge>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                System Content Engine
              </p>
              <div className="mt-2 max-h-56 overflow-y-auto rounded-lg bg-navy-900 p-3">
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-brand-200">
                  {AI_PROMPT_CONFIG.systemPrompt}
                </pre>
              </div>
              <Button className="mt-3" fullWidth>
                Cập nhật System Prompt
              </Button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <StatTile
                label="Lượt gọi API / ngày"
                value={formatNumber(AI_PROMPT_CONFIG.dailyApiCalls)}
              />
              <StatTile label="Token sử dụng (24h)" value={`${AI_PROMPT_CONFIG.tokenUsage24h}M`} tone="info" />
            </div>

            <div className="mt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Tham số
              </p>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink">Temperature</span>
                    <span className="font-medium text-navy-700">{temperature.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(event) => setTemperature(Number(event.target.value))}
                    className="mt-1.5 w-full accent-brand-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink">Top P</span>
                    <span className="font-medium text-navy-700">{topP.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={topP}
                    onChange={(event) => setTopP(Number(event.target.value))}
                    className="mt-1.5 w-full accent-brand-500"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Modal open={Boolean(editingItem)} onClose={() => setEditingItem(null)} title={`Sửa: ${editingItem?.title ?? ''}`}>
        <Textarea
          label="Định nghĩa / nội dung"
          value={editText}
          onChange={(event) => setEditText(event.target.value)}
          rows={5}
        />
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setEditingItem(null)}>
            Huỷ
          </Button>
          <Button onClick={saveEdit}>Lưu thay đổi</Button>
        </div>
      </Modal>
    </main>
  )
}

export default AiContentPage

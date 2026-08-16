import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  LayoutGrid,
  LayoutList,
  Mic,
  Pencil,
  Play,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import Select from '@/components/ui/Select'
import { cn } from '@/lib/utils'
import {
  LISTENING_ACCENTS,
  LISTENING_TOPICS,
  listeningLessons,
} from '@/mocks/data/listening'

const STATUS_META = {
  ready: { label: 'Bản chép lời sẵn sàng', tone: 'info', Icon: CheckCircle2 },
  review: { label: 'Cần kiểm tra lại', tone: 'warning', Icon: AlertTriangle },
}

function Waveform({ bars }) {
  const max = Math.max(...bars)
  return (
    <svg viewBox={`0 0 ${bars.length * 8} 40`} className="h-10 w-full" preserveAspectRatio="none">
      {bars.map((value, index) => (
        <rect
          key={index}
          x={index * 8}
          y={40 - (value / max) * 36}
          width={5}
          height={(value / max) * 36}
          rx={1.5}
          fill={index % 3 === 0 ? '#1B3A57' : '#29A8E8'}
        />
      ))}
    </svg>
  )
}

function ListeningPage() {
  const [topic, setTopic] = useState('all')
  const [accent, setAccent] = useState('all')
  const [view, setView] = useState('grid')

  const filtered = useMemo(() => {
    return listeningLessons.filter((item) => {
      const matchTopic = topic === 'all' || item.topic === topic
      const matchAccent = accent === 'all' || item.accent === accent
      return matchTopic && matchAccent
    })
  }, [topic, accent])

  return (
    <main className="flex-1 bg-canvas p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div />
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={Upload}>
            Tải lên hàng loạt
          </Button>
          <Button icon={Mic}>Thêm bài nghe mới</Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-48">
            <option value="all">Tất cả chủ đề</option>
            {LISTENING_TOPICS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Select value={accent} onChange={(e) => setAccent(e.target.value)} className="w-48">
            <option value="all">Tất cả giọng đọc</option>
            {LISTENING_ACCENTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>

          <div className="ml-auto flex items-center gap-1 rounded-lg border border-line p-1">
            <button
              type="button"
              aria-label="Xem dạng lưới"
              onClick={() => setView('grid')}
              className={cn(
                'rounded-md p-1.5',
                view === 'grid' ? 'bg-navy-700 text-white' : 'text-ink-muted hover:bg-canvas',
              )}
            >
              <LayoutGrid size={18} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              aria-label="Xem dạng danh sách"
              onClick={() => setView('list')}
              className={cn(
                'rounded-md p-1.5',
                view === 'list' ? 'bg-navy-700 text-white' : 'text-ink-muted hover:bg-canvas',
              )}
            >
              <LayoutList size={18} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState title="Không có bài nghe phù hợp" description="Thử đổi chủ đề hoặc giọng đọc." />
      ) : (
        <div
          className={cn(
            'grid gap-5',
            view === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1',
          )}
        >
          {filtered.map((item) => {
            const status = STATUS_META[item.status]
            return (
              <Card key={item.id} className="flex flex-col overflow-hidden p-0">
                <div className="relative flex items-center justify-center bg-canvas px-4 py-6">
                  <Badge tone={status.tone} className="absolute right-3 top-3 gap-1">
                    <status.Icon size={12} strokeWidth={1.75} />
                    {status.label}
                  </Badge>
                  <Waveform bars={item.waveform} />
                  <button
                    type="button"
                    aria-label={`Nghe thử ${item.title}`}
                    className="absolute inline-flex h-10 w-10 items-center justify-center rounded-full bg-navy-700 text-white shadow-[0_1px_2px_rgba(16,24,40,0.2)] hover:bg-navy-800"
                  >
                    <Play size={18} strokeWidth={1.75} fill="currentColor" />
                  </button>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone="neutral">{item.level}</Badge>
                    <Badge tone="neutral">{item.accent}</Badge>
                  </div>
                  <h3 className="mt-3 line-clamp-2 text-base font-semibold text-navy-700">
                    {item.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{item.description}</p>

                  <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                    <span className="flex items-center gap-1.5 text-sm text-ink-muted">
                      <Clock size={16} strokeWidth={1.75} />
                      {item.duration}
                    </span>
                    <div className="flex items-center gap-3 text-ink-muted">
                      <button aria-label="Sửa bài nghe" className="hover:text-brand-500">
                        <Pencil size={16} strokeWidth={1.75} />
                      </button>
                      <button aria-label="Xem bản chép lời" className="hover:text-brand-500">
                        <FileText size={16} strokeWidth={1.75} />
                      </button>
                      <button aria-label="Xoá bài nghe" className="hover:text-[#B91C1C]">
                        <Trash2 size={16} strokeWidth={1.75} />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}

          <button
            type="button"
            className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-line bg-transparent p-5 text-center hover:border-brand-500"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-ink-muted">
              <Plus size={22} strokeWidth={1.75} />
            </span>
            <span className="text-base font-semibold text-navy-700">Tải lên bài nghe mới</span>
            <span className="text-sm text-ink-muted">Hỗ trợ MP3, WAV, M4A tối đa 50MB</span>
          </button>
        </div>
      )}
    </main>
  )
}

export default ListeningPage

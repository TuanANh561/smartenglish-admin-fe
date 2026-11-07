import { Activity, Eye, EyeOff, Plus, Trash2 } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function AiKeyPoolCard({
  apiKeyPool = [],
  showKeyMap = {},
  setShowKeyMap,
  isTestingKey,
  handleTestKey,
  handleSetActiveKey,
  handleDeleteKey,
  onAddKeyClick,
}) {
  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Khóa kết nối AI</span>
            <span className="rounded-full bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 font-semibold">
              {apiKeyPool.length} khóa
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Thêm khóa API cho Google Gemini, Groq hoặc OpenRouter để luân chuyển dự phòng khi cần.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddKeyClick}
          className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-3.5 py-2 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <Plus size={14} />
          <span>Thêm khóa AI</span>
        </button>
      </div>

      <div className="space-y-3">
        {apiKeyPool.map((k) => {
          const isRevealed = showKeyMap[k.id]
          const isActive = k.status === 'ACTIVE'
          const isTesting = isTestingKey === k.id

          return (
            <div
              key={k.id}
              className={`rounded-xl border p-4 transition-all ${
                isActive ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {k.provider}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{k.label}</span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isActive ? 'ĐANG DÙNG' : 'DỰ PHÒNG'}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <code className="text-xs font-mono text-slate-600">
                      {isRevealed ? k.keyMasked : `${k.keyMasked?.slice(0, 6) || ''}••••••••${k.keyMasked?.slice(-4) || ''}`}
                    </code>
                    <button
                      type="button"
                      onClick={() => setShowKeyMap((p) => ({ ...p, [k.id]: !p[k.id] }))}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                      title={isRevealed ? 'Ẩn mã khóa' : 'Hiện mã khóa'}
                    >
                      {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <span className="text-[11px] text-slate-400 font-mono ml-2">
                      Mô hình: {k.model || 'Tự động'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                  {k.lastLatencyMs && (
                    <span className="text-[11px] text-emerald-600 font-bold font-mono">
                      ⚡ {k.lastLatencyMs}ms
                    </span>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Activity}
                    loading={isTesting}
                    onClick={() => handleTestKey(k)}
                    className="text-xs py-1 px-2.5"
                  >
                    Kiểm tra
                  </Button>
                  {!isActive && (
                    <button
                      type="button"
                      onClick={() => handleSetActiveKey(k)}
                      className="rounded-lg border border-slate-200 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                    >
                      Dùng chính
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteKey(k.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                    title="Xóa khóa này"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}


import { Plus, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Switch from '@/components/ui/Switch'
import { formatCurrency } from '@/lib/utils'
import CurrencyInput from './CurrencyInput'

export default function ClassBundlesTab({
  classBundles,
  onAddBundle,
  onUpdateBundle,
  onDeleteBundle,
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span className="text-xs font-bold text-navy-700 uppercase tracking-wide">
            Bảng giá mua sỉ license theo lớp ({classBundles.length})
          </span>
        </div>
        <Button icon={Plus} size="sm" onClick={onAddBundle}>
          Thêm Gói Sỉ Mới
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {classBundles.map((bundle) => (
          <Card key={bundle.id} className="space-y-3.5 border-2 border-line hover:border-brand-500 transition-all">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-ink-muted uppercase">Tên gói sỉ</label>
                <Input
                  value={bundle.title}
                  onChange={(e) => onUpdateBundle(bundle.id, 'title', e.target.value)}
                  className="font-bold text-navy-700 text-sm mt-0.5"
                />
              </div>
              <button
                type="button"
                onClick={() => onDeleteBundle(bundle.id)}
                className="p-1.5 text-ink-muted hover:text-red-500 rounded-lg hover:bg-red-50 cursor-pointer mt-3.5"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-ink-muted uppercase">Số học viên</label>
                <Input
                  type="number"
                  value={bundle.minStudents}
                  onChange={(e) => onUpdateBundle(bundle.id, 'minStudents', Number(e.target.value))}
                  className="text-xs font-bold mt-0.5"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-ink-muted uppercase">Chiết khấu (%)</label>
                <Input
                  type="number"
                  value={bundle.discountPercent}
                  onChange={(e) => onUpdateBundle(bundle.id, 'discountPercent', Number(e.target.value))}
                  className="text-xs font-bold text-emerald-600 mt-0.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 rounded-xl bg-slate-50/80 p-3 border border-slate-200/80">
              <div>
                <label className="text-[10px] font-bold text-ink-muted uppercase">Giá gốc (đ)</label>
                <CurrencyInput
                  value={bundle.originalPrice}
                  onChange={(val) => onUpdateBundle(bundle.id, 'originalPrice', val)}
                  className="text-xs text-slate-400 line-through mt-0.5"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block font-medium">
                  {formatCurrency(bundle.originalPrice)}
                </span>
              </div>
              <div>
                <label className="text-[10px] font-bold text-ink-muted uppercase">Giá ưu đãi (đ)</label>
                <CurrencyInput
                  value={bundle.discountedPrice}
                  onChange={(val) => onUpdateBundle(bundle.id, 'discountedPrice', val)}
                  className="text-xs font-bold text-brand-600 mt-0.5"
                />
                <span className="text-[10px] font-bold text-emerald-600 mt-0.5 block">
                  {formatCurrency(bundle.discountedPrice)}
                </span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-ink-muted uppercase">Áp dụng cho</label>
              <Input
                value={bundle.idealFor}
                onChange={(e) => onUpdateBundle(bundle.id, 'idealFor', e.target.value)}
                className="text-xs mt-0.5"
              />
            </div>

            <div className="pt-3 border-t border-line flex items-center justify-between">
              <span className="text-xs font-medium text-ink-muted">Mở bán:</span>
              <Switch
                checked={bundle.isActive}
                onChange={(checked) => onUpdateBundle(bundle.id, 'isActive', checked)}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

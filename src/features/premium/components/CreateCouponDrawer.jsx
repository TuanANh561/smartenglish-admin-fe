import { Plus } from 'lucide-react'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

export default function CreateCouponDrawer({
  isOpen,
  onClose,
  onSubmit,
  code,
  setCode,
  description,
  setDescription,
  percent,
  setPercent,
  maxUses,
  setMaxUses,
  validUntil,
  setValidUntil,
  target,
  setTarget,
}) {
  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Tạo Mã Ưu Đãi Mới"
      className="max-w-[420px]"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-[11px] font-bold uppercase text-ink-muted">
            Mã Voucher *
          </label>
          <Input
            placeholder="VD: SUMMER26"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 font-mono uppercase font-bold text-navy-700"
            required
          />
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase text-ink-muted">
            Mô tả chiến dịch
          </label>
          <Input
            placeholder="VD: Ưu đãi 20% đầu năm học"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold uppercase text-ink-muted">
              Giảm (%) *
            </label>
            <Input
              type="number"
              placeholder="20"
              min="1"
              max="100"
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
              className="mt-1 font-bold text-emerald-600"
              required
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase text-ink-muted">
              Số lượt tối đa
            </label>
            <Input
              type="number"
              placeholder="500"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              className="mt-1 font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold uppercase text-ink-muted">
              Đối tượng
            </label>
            <Select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="mt-1 text-xs"
            >
              <option value="all">Toàn sàn</option>
              <option value="teacher">Giáo viên</option>
              <option value="student">Học viên</option>
            </Select>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase text-ink-muted">
              Hạn dùng
            </label>
            <Input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="mt-1 text-xs"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-3.5 border-t border-line">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button type="submit" variant="primary" fullWidth icon={Plus}>
            Tạo Mã
          </Button>
        </div>
      </form>
    </Drawer>
  )
}

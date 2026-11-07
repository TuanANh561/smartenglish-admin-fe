import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'

export default function ExamGeneralInfoCard({
  form,
  onChangeField,
  examCategories = [],
  cefrLevels = [],
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 text-brand-700 text-xs font-bold">
          1
        </span>
        Thông tin cấu hình bài thi
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Tên bài thi *
          </label>
          <Input
            value={form.title}
            onChange={onChangeField('title')}
            placeholder="VD: TOEIC Test 1"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Thể loại bài thi
          </label>
          <Select value={form.category} onChange={onChangeField('category')}>
            {examCategories
              .filter((c) => c.value !== 'ALL')
              .map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Cấp độ CEFR
          </label>
          <Select value={form.cefrLevel} onChange={onChangeField('cefrLevel')}>
            {cefrLevels.map((l) => (
              <option key={l} value={l}>
                Cấp độ {l}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Thời gian làm bài (phút)
          </label>
          <Input
            type="number"
            min={1}
            max={300}
            value={form.durationMinutes}
            onChange={onChangeField('durationMinutes')}
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Điểm đạt yêu cầu
          </label>
          <Input
            type="number"
            min={0}
            value={form.passingScore}
            onChange={onChangeField('passingScore')}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Điểm thưởng (XP)
          </label>
          <Input
            type="number"
            min={0}
            max={1000}
            value={form.xpReward}
            onChange={onChangeField('xpReward')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Mô tả bài thi
          </label>
          <Textarea
            rows={2}
            autoResize
            value={form.description}
            onChange={onChangeField('description')}
            placeholder="Mô tả tóm tắt nội dung, cấu trúc và đối tượng bài thi..."
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Trạng thái đề thi
          </label>
          <Select value={form.status} onChange={onChangeField('status')}>
            <option value="published">Đang hoạt động</option>
            <option value="draft">Bản nháp</option>
          </Select>
        </div>
      </div>
    </div>
  )
}


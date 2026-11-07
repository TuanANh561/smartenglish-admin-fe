import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { VIETNAM_BANKS } from '../settingsConstants'

export default function TeacherBankingTab({
  settings,
  onUpdateField,
}) {
  const banking = settings?.banking || {
    bankName: 'Vietcombank',
    accountNumber: '',
    accountHolder: '',
    branch: '',
    accountType: 'personal',
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-3">
        <h3 className="text-base font-bold text-navy-800">
          Thông tin Tài khoản nhận tiền
        </h3>
        <p className="text-xs text-ink-muted mt-0.5">
          Thiết lập tài khoản ngân hàng để nhận doanh thu giảng dạy và đối soát định kỳ.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 p-6 bg-white shadow-xs space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Ngân hàng thụ hưởng
            </label>
            <Select
              value={banking.bankName || 'Vietcombank'}
              onChange={(e) => onUpdateField('banking', 'bankName', e.target.value)}
              className="text-xs font-semibold"
            >
              {VIETNAM_BANKS.map((b) => (
                <option key={b.code} value={b.name}>
                  {b.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Số tài khoản ngân hàng
            </label>
            <Input
              value={banking.accountNumber || ''}
              onChange={(e) => onUpdateField('banking', 'accountNumber', e.target.value)}
              placeholder="Ví dụ: 1029384756"
              className="font-mono text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Tên chủ tài khoản (Viết hoa không dấu)
            </label>
            <Input
              value={banking.accountHolder || ''}
              onChange={(e) => onUpdateField('banking', 'accountHolder', e.target.value.toUpperCase())}
              placeholder="Ví dụ: NGUYEN VAN A"
              className="font-mono text-xs uppercase"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Chi nhánh ngân hàng
            </label>
            <Input
              value={banking.branch || ''}
              onChange={(e) => onUpdateField('banking', 'branch', e.target.value)}
              placeholder="Ví dụ: Chi nhánh Ba Đình, Hà Nội"
              className="text-xs"
            />
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
          <p className="font-semibold text-slate-700">Lưu ý khi cung cấp thông tin tài khoản:</p>
          <p className="mt-1 leading-relaxed">
            Tên chủ tài khoản ngân hàng phải trùng khớp với tên trên Căn cước công dân hoặc hồ sơ giảng viên đã được duyệt để đảm bảo việc đối soát và chuyển tiền diễn ra chính xác.
          </p>
        </div>
      </div>
    </div>
  )
}

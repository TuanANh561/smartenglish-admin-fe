import { FileText, Mail, Phone, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

/**
 * Modal hiển thị chi tiết hồ sơ & tệp minh chứng bằng cấp của giáo viên ứng tuyển
 */
export default function TeacherProofModal({ registration, onClose }) {
  if (!registration) return null

  const proofFiles = Array.isArray(registration.proofFiles) ? registration.proofFiles : []

  return (
    <Modal
      open={Boolean(registration)}
      onClose={onClose}
      title={`Tệp Minh Chứng: ${registration.fullName}`}
      className="max-w-lg"
    >
      <div className="space-y-4 text-xs">
        {/* Khối thông tin tóm tắt ứng viên */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
          <p className="font-bold text-slate-900 text-xs">{registration.fullName}</p>
          <p className="text-slate-600">{registration.education}</p>
          <p className="text-brand-600 font-bold">{registration.certificateType}</p>

          <div className="pt-1.5 border-t border-slate-200/60 space-y-1 text-slate-600">
            <p className="flex items-center gap-1.5">
              <Mail size={12} className="text-slate-400 shrink-0" />
              <span>Email: {registration.email}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-slate-400 shrink-0" />
              <span>Số CCCD: {registration.identityCard}</span>
            </p>
            {registration.phone && (
              <p className="flex items-center gap-1.5">
                <Phone size={12} className="text-slate-400 shrink-0" />
                <span>SĐT: {registration.phone}</span>
              </p>
            )}
          </div>
        </div>

        {/* Danh sách tệp minh chứng đính kèm */}
        <div>
          <h4 className="font-bold text-slate-700 uppercase tracking-wider mb-2 text-[11px]">
            Danh sách tệp minh chứng đính kèm ({proofFiles.length})
          </h4>

          <div className="space-y-2">
            {proofFiles.length === 0 ? (
              <p className="text-slate-400 italic py-2">Không có tệp đính kèm</p>
            ) : (
              proofFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText size={18} className="text-red-500 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800">{file.name}</p>
                      <p className="text-[11px] text-slate-400">{file.size || 'Tệp tài liệu'}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.success(`Đang mở xem tệp: ${file.name}`)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700 text-[11px] cursor-pointer transition-colors"
                  >
                    Xem tệp
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <Button size="sm" variant="secondary" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  )
}

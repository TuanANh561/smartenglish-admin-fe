import { useState } from 'react'
import {
  FileText,
  Mail,
  Phone,
  ShieldCheck,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Award,
  BookOpen,
  Calendar,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { maskEmail, maskIdentityCard, maskPhone } from '@/lib/utils'

/**
 * Modal hiển thị chi tiết hồ sơ & tệp minh chứng bằng cấp của giáo viên ứng tuyển
 */
export default function TeacherProofModal({
  registration,
  onClose,
  onApprove,
  onReject,
}) {
  const [previewingFile, setPreviewingFile] = useState(null)

  if (!registration) return null

  const proofFiles = Array.isArray(registration.proofFiles) ? registration.proofFiles : []

  const isImage = (file) => {
    if (!file) return false
    const type = file.type || ''
    const name = file.name || ''
    return (
      type.startsWith('image/') ||
      name.endsWith('.jpg') ||
      name.endsWith('.jpeg') ||
      name.endsWith('.png') ||
      name.endsWith('.webp')
    )
  }

  const handleDownload = (file) => {
    if (file.dataUrl) {
      const a = document.createElement('a')
      a.href = file.dataUrl
      a.download = file.name || 'minh-chung'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      toast.success(`Đang tải về: ${file.name}`)
    } else {
      toast.info(`Tệp minh chứng: ${file.name}`)
    }
  }

  return (
    <Modal
      open={Boolean(registration)}
      onClose={onClose}
      title={`Hồ Sơ & Minh Chứng: ${registration.fullName}`}
      className="max-w-2xl"
    >
      <div className="space-y-4 text-xs">
        {/* Khối thông tin chi tiết ứng viên */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm">{registration.fullName}</h4>
            {registration.status === 'pending' && (
              <span className="bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded text-[11px] border border-amber-200">
                Chờ duyệt
              </span>
            )}
            {registration.status === 'approved' && (
              <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                Đã duyệt
              </span>
            )}
            {registration.status === 'rejected' && (
              <span className="bg-red-100 text-red-800 font-semibold px-2 py-0.5 rounded text-[11px] border border-red-200">
                Đã từ chối
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
            <p className="flex items-center gap-1.5">
              <BookOpen size={13} className="text-brand-600 shrink-0" />
              <span><strong>Học vấn:</strong> {registration.education}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Award size={13} className="text-brand-600 shrink-0" />
              <span><strong>Chứng chỉ:</strong> {registration.certificateType}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Mail size={13} className="text-slate-400 shrink-0" />
              <span><strong>Email:</strong> {maskEmail(registration.email)}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-slate-400 shrink-0" />
              <span><strong>Số CCCD:</strong> {maskIdentityCard(registration.identityCard)}</span>
            </p>
            {registration.phone && (
              <p className="flex items-center gap-1.5">
                <Phone size={13} className="text-slate-400 shrink-0" />
                <span><strong>SĐT:</strong> {maskPhone(registration.phone)}</span>
              </p>
            )}
            <p className="flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400 shrink-0" />
              <span><strong>Kinh nghiệm:</strong> {registration.experienceYears || 0} năm</span>
            </p>
          </div>

          {registration.specialty && (
            <div className="pt-1.5 border-t border-slate-200/70 text-slate-600">
              <strong>Chuyên môn giảng dạy:</strong> {registration.specialty}
            </div>
          )}

          {registration.note && (
            <div className="pt-1.5 border-t border-slate-200/70 text-slate-600 italic">
              <strong>Ghi chú trước đó:</strong> {registration.note}
            </div>
          )}
        </div>

        {/* Danh sách tệp minh chứng đính kèm */}
        <div>
          <h4 className="font-bold text-slate-700 uppercase tracking-wider mb-2 text-[11px]">
            Tệp minh chứng bằng cấp & căn cước ({proofFiles.length})
          </h4>

          <div className="space-y-2">
            {proofFiles.length === 0 ? (
              <p className="text-slate-400 italic py-2 text-center">Không có tệp đính kèm nào</p>
            ) : (
              proofFiles.map((file, idx) => {
                const canPreview = isImage(file) && file.dataUrl
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isImage(file) ? (
                        <div className="h-9 w-9 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center shrink-0 overflow-hidden">
                          {file.dataUrl ? (
                            <img
                              src={file.dataUrl}
                              alt={file.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <FileText size={18} className="text-brand-600" />
                          )}
                        </div>
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                          <FileText size={18} className="text-red-500" />
                        </div>
                      )}
                      <div className="truncate">
                        <p className="font-bold text-slate-800 truncate">{file.name}</p>
                        <p className="text-[11px] text-slate-400">{file.size || 'Tệp tài liệu'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {canPreview && (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewingFile(previewingFile?.name === file.name ? null : file)
                          }
                          className="px-2.5 py-1 rounded-lg border border-brand-200 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-[11px] cursor-pointer transition-colors flex items-center gap-1"
                        >
                          <Eye size={12} />
                          <span>Xem ảnh</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDownload(file)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700 text-[11px] cursor-pointer transition-colors flex items-center gap-1"
                      >
                        <Download size={12} />
                        <span>Tải về</span>
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Khung phóng to xem ảnh nếu người dùng bấm xem */}
        {previewingFile && previewingFile.dataUrl && (
          <div className="rounded-xl border border-slate-200 bg-slate-900 p-2 text-center space-y-1">
            <div className="flex items-center justify-between text-white text-[11px] px-2 py-1">
              <span className="font-semibold truncate">{previewingFile.name}</span>
              <button
                type="button"
                onClick={() => setPreviewingFile(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕ Đóng xem trước
              </button>
            </div>
            <img
              src={previewingFile.dataUrl}
              alt={previewingFile.name}
              className="max-h-72 w-auto mx-auto rounded object-contain"
            />
          </div>
        )}

        {/* Nút hành động */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {registration.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  icon={CheckCircle2}
                  onClick={() => {
                    onApprove?.(registration)
                    onClose()
                  }}
                >
                  Phê duyệt hồ sơ
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-red-600 hover:bg-red-50 hover:border-red-200"
                  icon={XCircle}
                  onClick={() => {
                    onReject?.(registration)
                    onClose()
                  }}
                >
                  Từ chối hồ sơ
                </Button>
              </>
            )}
          </div>

          <Button size="sm" variant="secondary" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  )
}

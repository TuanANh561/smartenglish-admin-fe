import { useState } from 'react'
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Mail,
  Phone,
  ShieldCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'
import TeacherProofModal from './TeacherProofModal'
import { maskEmail, maskIdentityCard, maskPhone } from '@/lib/utils'

/**
 * Tab 2: Quản lý và phê duyệt hồ sơ đăng ký của Giáo viên
 */
export default function TeacherApprovalTab({
  registrations = [],
  isLoading = false,
  onApprove,
  onReject,
}) {
  const [selectedProofReg, setSelectedProofReg] = useState(null)

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 size={18} className="text-brand-600" />
            Danh Sách Hồ Sơ Đăng Ký Giáo Viên Chờ Quản Trị Viên Phê Duyệt
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Kiểm tra thông tin chuyên môn và tệp minh chứng bằng cấp/CCCD để quyết định phê duyệt tài khoản Giáo Viên.
          </p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase">
              <tr>
                <th className="p-3">Giáo viên ứng tuyển</th>
                <th className="p-3">Học vấn & Trình độ</th>
                <th className="p-3">Chứng chỉ Tiếng Anh</th>
                <th className="p-3">Kinh nghiệm & Chuyên môn</th>
                <th className="p-3 text-center">Tệp minh chứng</th>
                <th className="p-3 text-center">Trạng thái</th>
                <th className="p-3 text-right">Thao tác phê duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                      <span>Đang tải danh sách hồ sơ giáo viên từ máy chủ...</span>
                    </div>
                  </td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    Chưa có hồ sơ đăng ký nào
                  </td>
                </tr>
              ) : (
                registrations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900 text-xs">{item.fullName}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Mail size={12} className="text-slate-400 shrink-0" />
                          <span>{maskEmail(item.email)}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <ShieldCheck size={12} className="text-slate-400 shrink-0" />
                          <span>CCCD: {maskIdentityCard(item.identityCard)}</span>
                        </p>
                        {item.phone && (
                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Phone size={12} className="text-slate-400 shrink-0" />
                            <span>SĐT: {maskPhone(item.phone)}</span>
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="p-3 font-medium text-slate-700 max-w-xs">
                      {item.education}
                    </td>

                    <td className="p-3 font-bold text-brand-700 whitespace-nowrap">
                      {item.certificateType}
                    </td>

                    <td className="p-3 text-slate-600">
                      <span className="font-semibold text-slate-800 block">
                        {item.experienceYears} năm kinh nghiệm
                      </span>
                      <span className="text-[11px] text-slate-500">{item.specialty}</span>
                    </td>

                    <td className="p-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedProofReg(item)}
                        className="inline-flex items-center gap-1 bg-brand-50 hover:bg-brand-100 text-brand-700 px-2.5 py-1 rounded-lg font-bold border border-brand-200 transition-colors cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>Xem {item.proofFiles?.length ?? 0} file</span>
                      </button>
                    </td>

                    <td className="p-3 text-center whitespace-nowrap">
                      {item.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full font-semibold border border-amber-200">
                          <Clock size={12} /> Chờ duyệt
                        </span>
                      )}
                      {item.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
                          <CheckCircle2 size={12} /> Đã duyệt
                        </span>
                      )}
                      {item.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-0.5 rounded-full font-semibold border border-red-200">
                          <XCircle size={12} /> Từ chối
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-right whitespace-nowrap">
                      {item.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onApprove?.(item.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg font-semibold text-[11px] cursor-pointer transition-colors shadow-2xs"
                          >
                            Duyệt & Cấp quyền
                          </button>
                          <button
                            type="button"
                            onClick={() => onReject?.(item.id)}
                            className="bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 px-2.5 py-1 rounded-lg font-semibold text-[11px] cursor-pointer transition-colors"
                          >
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Hoàn tất</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal xem tệp minh chứng */}
      <TeacherProofModal
        registration={selectedProofReg}
        onClose={() => setSelectedProofReg(null)}
      />
    </div>
  )
}

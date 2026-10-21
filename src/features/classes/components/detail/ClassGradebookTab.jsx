import { useState, useEffect } from 'react'
import { Award, Search, FileSpreadsheet, Lock, Crown, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'
import { useAuthStore } from '@/store/authStore'
import { getTeacherQuotaStatus } from '../../classApi'
import { ProgressBar, ScoreBadge, StudentAvatar } from '../ClassSharedComponents'

export default function ClassGradebookTab({ cls, members = [], assignments = [] }) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [search, setSearch] = useState('')
  const [isPremium, setIsPremium] = useState(false)
  const [showPaywallModal, setShowPaywallModal] = useState(false)

  const userRole = (user?.role || '').toLowerCase()
  const isAdmin = userRole === 'admin' || userRole === 'role_admin'
  const canExport = isAdmin || isPremium

  useEffect(() => {
    if (isAdmin) {
      setIsPremium(true)
      return
    }
    getTeacherQuotaStatus()
      .then((res) => {
        if (res && res.isPremium) {
          setIsPremium(true)
        }
      })
      .catch(() => {})
  }, [isAdmin])

  const filtered = members.filter((s) => {
    const name = (s.userName || s.name || '').toLowerCase()
    const email = (s.userEmail || s.email || '').toLowerCase()
    const q = search.toLowerCase()
    return name.includes(q) || email.includes(q)
  })

  const handleExport = () => {
    if (!canExport) {
      setShowPaywallModal(true)
      return
    }

    if (!filtered || filtered.length === 0) {
      toast.error('Không có dữ liệu học viên trong bảng điểm để xuất')
      return
    }

    // Xuất file Microsoft Excel (.xlsx) chuẩn Unicode
    try {
      const className = cls?.name || 'Lop_hoc'
      const totalAssignments = Math.max(assignments.length, 1)

      const aoaData = [
        ['BẢNG ĐIỂM CHI TIẾT HỌC VIÊN'],
        ['Lớp học:', className],
        ['Mã lớp:', cls?.code || '—'],
        ['Thời gian xuất:', new Date().toLocaleString('vi-VN')],
        [],
        [
          'STT',
          'Họ và tên học viên',
          'Email',
          'Điểm trung bình',
          'Tiến độ hoàn thành',
          'Bài tập đã nộp',
          'Xếp loại',
        ],
        ...filtered.map((s, idx) => {
          const name = s.userName || s.name || `Học viên #${s.userId || s.id}`
          const email = s.userEmail || s.email || ''
          const score = s.avgScore != null ? Number(s.avgScore) : 'Chưa có'
          const progress = s.progress != null ? `${s.progress}%` : '0%'
          const submittedCount = Math.round(((s.progress || 0) / 100) * totalAssignments)
          const rating =
            s.avgScore == null
              ? 'Chưa đánh giá'
              : s.avgScore >= 8.5
                ? 'Xuất sắc'
                : s.avgScore >= 7.0
                  ? 'Khá'
                  : s.avgScore >= 5.0
                    ? 'Trung bình'
                    : 'Yếu'

          return [
            idx + 1,
            name,
            email,
            score,
            progress,
            `${submittedCount}/${totalAssignments}`,
            rating,
          ]
        }),
      ]

      const worksheet = XLSX.utils.aoa_to_sheet(aoaData)

      // Căn chỉnh độ rộng cột Excel
      worksheet['!cols'] = [
        { wch: 6 },  // STT
        { wch: 28 }, // Họ tên
        { wch: 30 }, // Email
        { wch: 18 }, // Điểm TB
        { wch: 20 }, // Tiến độ
        { wch: 18 }, // Bài tập đã nộp
        { wch: 16 }, // Xếp loại
      ]

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Bang_Diem')

      // Chuẩn hóa tên file sang ASCII an toàn cho hệ thống tệp tin Windows (tránh bị Chromium lưu dưới dạng UUID không đuôi)
      const asciiName = className
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-zA-Z0-9_\-\s]/g, '')
        .trim()
        .replace(/\s+/g, '_') || 'Lop_hoc'

      const fileName = `Bang_Diem_${asciiName}.xlsx`

      // Chuyển workbook sang binary buffer và tạo Blob chuẩn Microsoft Excel (.xlsx)
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
      })

      // Kích hoạt tải về qua thẻ <a> được gắn tường minh vào DOM để trình duyệt nhận diện chính xác đuôi .xlsx
      const blobUrl = window.URL.createObjectURL(blob)
      const downloadLink = document.createElement('a')
      downloadLink.style.display = 'none'
      downloadLink.href = blobUrl
      downloadLink.download = fileName
      downloadLink.setAttribute('download', fileName)
      document.body.appendChild(downloadLink)
      downloadLink.click()

      setTimeout(() => {
        if (document.body.contains(downloadLink)) {
          document.body.removeChild(downloadLink)
        }
        window.URL.revokeObjectURL(blobUrl)
      }, 5000)

      toast.success(`Đã xuất file Excel: ${fileName}`)
    } catch (err) {
      console.error('Lỗi xuất Excel:', err)
      toast.error('Lỗi khi xuất file Excel: ' + (err?.message || 'Không thể tạo file'))
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3 flex-1">
          <Search size={16} className="shrink-0 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm học viên trong bảng điểm..."
            className="w-full max-w-sm text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <FileSpreadsheet size={14} className="text-emerald-600" />
            <span>Xuất Excel</span>
            {!canExport && (
              <span className="rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 border border-amber-200 flex items-center gap-0.5">
                <Lock size={10} /> PRO
              </span>
            )}
          </button>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-500 border-l border-slate-200 pl-3">
            <Award size={16} className="text-amber-500" />
            <span>Kết quả học tập</span>
          </div>
        </div>
      </div>

      {/* Paywall Modal for Export Feature */}
      {showPaywallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 mb-4">
              <Crown size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Tính năng dành cho Teacher Pro</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Tính năng <strong>Xuất bảng điểm chi tiết (Excel .xlsx)</strong> và phân tích kết quả học viên chỉ có trên gói <strong>Teacher Pro</strong> và <strong>School & Center</strong>.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPaywallModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPaywallModal(false)
                  navigate('/app/goi-dich-vu')
                }}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles size={14} />
                <span>Nâng cấp ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grade Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/40 text-xs font-bold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-3.5">HỌC VIÊN</th>
              <th className="px-6 py-3.5 text-center">ĐIỂM TRUNG BÌNH</th>
              <th className="px-6 py-3.5">TIẾN ĐỘ HOÀN THÀNH</th>
              <th className="px-6 py-3.5 text-center">BÀI TẬP ĐÃ NỘP</th>
              <th className="px-6 py-3.5 text-center">XẾP LOẠI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-slate-400">
                  Chưa có dữ liệu điểm cho học viên trong lớp
                </td>
              </tr>
            ) : (
              filtered.map((student) => {
                const sObj = {
                  id: student.userId || student.id,
                  name: student.userName || student.name || `Học viên #${student.userId}`,
                  email: student.userEmail || student.email || '',
                  avatarUrl: student.userAvatar || student.avatarUrl,
                  avatarColor: student.avatarColor || '#2563eb',
                  initials: (student.userName || student.name || 'H').slice(0, 2).toUpperCase(),
                  avgScore: student.avgScore ?? null,
                  progress: student.progress ?? 0,
                }
                const score = sObj.avgScore
                const rating =
                  score == null
                    ? 'Chưa đánh giá'
                    : score >= 8.5
                      ? 'Xuất sắc'
                      : score >= 7.0
                        ? 'Khá'
                        : score >= 5.0
                          ? 'Trung bình'
                          : 'Yếu'
                const ratingColor =
                  score == null
                    ? 'text-slate-500 bg-slate-100'
                    : score >= 8.5
                      ? 'text-emerald-700 bg-emerald-50'
                      : score >= 7.0
                        ? 'text-blue-700 bg-blue-50'
                        : score >= 5.0
                          ? 'text-amber-700 bg-amber-50'
                          : 'text-red-700 bg-red-50'

                return (
                  <tr key={sObj.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <StudentAvatar student={sObj} />
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{sObj.name}</p>
                          <p className="font-mono text-xs text-slate-500 mt-0.5">
                            {sObj.email || '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ScoreBadge score={score} />
                    </td>
                    <td className="px-6 py-4">
                      <ProgressBar value={sObj.progress} />
                    </td>
                    <td className="px-6 py-4 text-center text-xs font-semibold text-slate-700">
                      {Math.round((sObj.progress / 100) * Math.max(assignments.length, 1))} /{' '}
                      {Math.max(assignments.length, 1)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${ratingColor}`}>
                        {rating}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

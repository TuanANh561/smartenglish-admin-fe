import { CheckCircle2 } from 'lucide-react'
import Card from '@/components/ui/Card'
import { formatNumber, maskEmail } from '@/lib/utils'

/**
 * Tab Tổng Quan Khóa Học (CourseOverviewTab)
 */
export default function CourseOverviewTab({ course }) {
  if (!course) return null

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-8 space-y-5">
        <Card className="p-5 space-y-3 border border-line">
          <h3 className="text-sm font-bold text-navy-700 uppercase tracking-wide">
            Mô tả khóa học
          </h3>
          <p className="text-xs text-ink leading-relaxed">
            {course.description || course.descriptionVi || 'Khóa học cung cấp kiến thức toàn diện và thực tế.'}
          </p>
        </Card>

        <Card className="p-5 space-y-3 border border-line">
          <h3 className="text-sm font-bold text-navy-700 uppercase tracking-wide">
            Mục tiêu đạt được sau khóa học
          </h3>
          <ul className="space-y-2 text-xs text-ink">
            {(course.objectives || [
              'Nắm vững hệ thống từ vựng & cấu trúc ngữ pháp cốt lõi',
              'Tự tin giao tiếp và phản xạ tự nhiên trong tình huống thực tế',
              'Hoàn thành đầy đủ các bài tập tương tác và bài kiểm tra đánh giá',
            ]).map((obj, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="lg:col-span-4 space-y-4">
        <Card className="p-5 space-y-3 border border-line">
          <h3 className="text-sm font-bold text-navy-700 uppercase tracking-wide">
            Đối tượng phù hợp
          </h3>
          <ul className="space-y-2 text-xs text-ink-muted">
            {(course.targetAudience || [
              'Học viên muốn nâng cao vốn từ vựng và phản xạ giao tiếp',
              'Người đi làm cần sử dụng tiếng Anh trong môi trường làm việc',
              'Học viên chuẩn bị cho các kỳ thi chứng chỉ chuẩn quốc tế',
            ]).map((aud, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0 mt-1.5" />
                <span>{aud}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5 space-y-3 border border-line">
          <h3 className="text-sm font-bold text-navy-700 uppercase tracking-wide">
            Thông số khóa học
          </h3>
          <div className="divide-y divide-line text-xs">
            <div className="py-2 flex items-center justify-between">
              <span className="text-ink-muted">Tổng số chương:</span>
              <strong className="text-navy-700">{course.chapters?.length || 1} chương</strong>
            </div>
            <div className="py-2 flex items-center justify-between">
              <span className="text-ink-muted">Tổng số bài học:</span>
              <strong className="text-navy-700">{course.lessonCount || 0} bài</strong>
            </div>
            <div className="py-2 flex items-center justify-between">
              <span className="text-ink-muted">Ngày cập nhật:</span>
              <strong className="text-navy-700">{course.updatedAt || '14/09/2026'}</strong>
            </div>
          </div>
        </Card>
      </div>

      {/* Thống kê hiệu quả học tập */}
      <div className="lg:col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4 border border-line bg-gradient-to-br from-white to-slate-50">
          <span className="text-xs font-semibold text-ink-muted">Tỷ lệ hoàn thành</span>
          <p className="text-2xl font-bold text-navy-800 mt-1">74.2%</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            ↗ +5.8% so với tháng trước
          </p>
        </Card>

        <Card className="p-4 border border-line bg-gradient-to-br from-white to-slate-50">
          <span className="text-xs font-semibold text-ink-muted">Điểm bài tập trung bình</span>
          <p className="text-2xl font-bold text-brand-600 mt-1">8.4 / 10</p>
          <p className="text-[11px] text-ink-muted mt-1">Dựa trên 1,420 lượt làm bài</p>
        </Card>

        <Card className="p-4 border border-line bg-gradient-to-br from-white to-slate-50">
          <span className="text-xs font-semibold text-ink-muted">Mức độ hài lòng</span>
          <p className="text-2xl font-bold text-amber-500 mt-1">4.8 ★</p>
          <p className="text-[11px] text-ink-muted mt-1">98% phản hồi tích cực</p>
        </Card>
      </div>

      {/* Danh sách học viên tham gia */}
      <div className="lg:col-span-12">
        <Card className="p-0 overflow-hidden border border-line shadow-xs">
          <div className="p-4 border-b border-line flex items-center justify-between bg-slate-50/70">
            <div>
              <h3 className="font-bold text-sm text-navy-800">
                Danh sách học viên đã đăng ký ({formatNumber(course.studentCount || 0)})
              </h3>
              <p className="text-[11px] text-ink-muted">
                Theo dõi tiến độ học tập và điểm số thực hành của học viên
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-bold uppercase text-ink-muted border-b border-line">
                <tr>
                  <th className="px-4 py-3">Học viên</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3 text-center">Tiến độ</th>
                  <th className="px-4 py-3 text-center">Điểm TB</th>
                  <th className="px-4 py-3">Ngày tham gia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-white">
                {[
                  { name: 'Nguyễn Anh Tuấn', email: 'tuan.na@gmail.com', progress: 85, score: 8.8, date: '12/10/2026' },
                  { name: 'Trần Thị Lan', email: 'lan.tt@gmail.com', progress: 60, score: 7.5, date: '14/10/2026' },
                  { name: 'Lê Hoàng Nam', email: 'nam.lh@gmail.com', progress: 100, score: 9.2, date: '05/10/2026' },
                  { name: 'Đinh Thuỳ Dung', email: 'dung.dt@gmail.com', progress: 40, score: 6.8, date: '16/10/2026' },
                ].map((st, i) => (
                  <tr key={i} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-semibold text-navy-800">{st.name}</td>
                    <td className="px-4 py-3 font-mono text-ink-muted">{maskEmail(st.email)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="space-y-1">
                        <span className="font-bold text-navy-800">{st.progress}%</span>
                        <div className="h-1.5 w-16 mx-auto rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${st.progress}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-brand-600">{st.score}</td>
                    <td className="px-4 py-3 text-ink-muted">{st.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

import { BookOpen, CheckCircle2, GraduationCap, Layers, ShieldCheck, Users } from 'lucide-react'
import Card from '@/components/ui/Card'
import { formatNumber } from '@/lib/utils'

/**
 * Thống kê nhanh danh sách khóa học và chương trình học
 */
export default function CourseStats({ courses = [] }) {
  const totalCourses = courses.length
  const systemCourses = courses.filter(
    (c) => c.createdBy === 1 || c.courseType === 'STRUCTURED' || c.authorName === 'Hệ thống',
  ).length
  const teacherCourses = totalCourses - systemCourses
  const publishedCourses = courses.filter((c) => c.status === 'published' || c.isPublished).length
  const totalLessons = courses.reduce(
    (acc, c) => acc + (Number(c.lessonCount) || Number(c.totalLessons) || 0),
    0,
  )

  const stats = [
    {
      label: 'Tổng chương & khóa học',
      value: totalCourses,
      icon: Layers,
      color: 'text-brand-600 bg-brand-50 border-brand-100',
    },
    {
      label: 'Lộ trình Hệ thống',
      value: systemCourses,
      icon: ShieldCheck,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      label: 'Khóa học Giảng viên',
      value: teacherCourses,
      icon: GraduationCap,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      label: 'Tổng số bài học (Units)',
      value: totalLessons,
      icon: BookOpen,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((item, idx) => {
        const Icon = item.icon
        return (
          <Card key={idx} className="p-3.5 flex items-center gap-3.5 border border-line">
            <div className={`p-2.5 rounded-xl border ${item.color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-ink-muted">{item.label}</p>
              <p className="text-xl font-bold text-navy-800 leading-tight">
                {formatNumber(item.value)}
              </p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

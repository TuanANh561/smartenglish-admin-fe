import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Copy,
  ExternalLink,
  GraduationCap,
  Shield,
  Users,
  Layers,
  ArrowRight,
} from 'lucide-react'
import { LEVEL_COLOR, formatTeacherName } from '../../classConstants'
import { fetchCoursesApi } from '@/features/courses/courseApi'
import { getHydratedCoursesForClass } from '../../classCourseHelper'

export default function ClassOverviewTab({
  cls,
  members = [],
  assignments = [],
  copied,
  onCopyCode,
  onSwitchTab,
}) {
  const navigate = useNavigate()
  const levelStyle = LEVEL_COLOR[cls.cefrTarget || cls.level] ?? LEVEL_COLOR.B1
  const studentCount = members.length > 0 ? members.length : cls.studentCount || 0
  const assignmentCount = assignments.length > 0 ? assignments.length : cls.assignmentCount || 0

  const [courses, setCourses] = useState([])

  useEffect(() => {
    let isMounted = true
    const loadClassCourses = async () => {
      try {
        const all = await fetchCoursesApi()
        if (isMounted) {
          const hydrated = getHydratedCoursesForClass(cls?.id, cls, all)
          setCourses(hydrated)
        }
      } catch (err) {
        if (isMounted) {
          const fallback = getHydratedCoursesForClass(cls?.id, cls, [])
          setCourses(fallback)
        }
      }
    }
    loadClassCourses()
    return () => {
      isMounted = false
    }
  }, [cls?.id, cls?.courseId])

  const formatDate = (d) => {
    if (!d) return 'Chưa thiết lập'
    try {
      return new Date(d).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return d
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Sĩ số học viên</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users size={18} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{studentCount}</span>
            <span className="text-xs text-slate-400">/ {cls.maxStudents || 30} tối đa</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Bài tập đã giao</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <BookOpen size={18} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{assignmentCount}</span>
            <span className="text-xs text-slate-400">bài tập</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Trình độ CEFR</span>
            <span
              className="flex h-8 px-2.5 items-center justify-center rounded-lg text-xs font-bold"
              style={{ backgroundColor: levelStyle.bg, color: levelStyle.text }}
            >
              {cls.cefrTarget || cls.level || 'B1'}
            </span>
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-800">
            {cls.cefrTarget === 'A1' || cls.cefrTarget === 'A2'
              ? 'Sơ cấp (Beginner)'
              : cls.cefrTarget === 'B1' || cls.cefrTarget === 'B2'
                ? 'Trung cấp (Intermediate)'
                : 'Cao cấp (Advanced)'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Mã tham gia lớp</span>
            <button
              type="button"
              onClick={onCopyCode}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  <span className="text-emerald-600">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Sao chép</span>
                </>
              )}
            </button>
          </div>
          <p className="mt-2 font-mono text-xl font-bold tracking-wider text-brand-600">
            {cls.joinCode || 'CHƯA CÓ'}
          </p>
        </div>
      </div>

      {/* Khối Khóa học giáo trình áp dụng cho lớp — Nổi bật & Đầy đủ */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <GraduationCap size={16} />
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              Khóa học/Giáo trình áp dụng cho lớp ({courses.length} khóa học)
            </h4>
          </div>
          {onSwitchTab && (
            <button
              type="button"
              onClick={() => onSwitchTab('courses')}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline cursor-pointer"
            >
              <span>Xem chi tiết & Quản lý giáo trình</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>

        {courses.length === 0 ? (
          <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200/80 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-400 border border-slate-200">
                <BookOpen size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">Lớp học tự do (Chưa gán khóa học giáo trình)</p>
                <p className="text-[11px] text-slate-400">
                  Gắn khóa học giúp học viên học theo lộ trình bài bản và giáo viên dễ dàng giao bài tập.
                </p>
              </div>
            </div>
            {onSwitchTab && (
              <button
                type="button"
                onClick={() => onSwitchTab('courses')}
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors cursor-pointer"
              >
                + Gán khóa học
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {courses.map((c) => {
              const cLevelKey = c.cefrLevelMin || c.level || 'B1'
              const cLevelStyle = LEVEL_COLOR[cLevelKey] ?? LEVEL_COLOR.B1
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 p-3.5 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        c.thumbnail ||
                        c.thumbnailUrl ||
                        'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=80'
                      }
                      alt=""
                      className="h-14 w-18 shrink-0 rounded-lg object-cover border border-slate-200 shadow-2xs"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <span
                          className="px-1.5 py-0.2 rounded text-[10px] font-bold"
                          style={{ backgroundColor: cLevelStyle.bg, color: cLevelStyle.text }}
                        >
                          {cLevelKey}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">#{c.id}</span>
                        {c.authorName && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            &bull; GV: {c.authorName}
                          </span>
                        )}
                      </div>
                      <h5
                        className="truncate text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors"
                        title={c.title || c.titleVi}
                      >
                        {c.title || c.titleVi}
                      </h5>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Layers size={11} className="text-slate-400" />
                          <span>{c.lessonCount || 2} bài học</span>
                        </span>
                        {c.durationHours && <span>&bull; {c.durationHours}</span>}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/app/hoc-lieu/khoa-hoc/${c.id}`)}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50/60 hover:bg-brand-100/80 px-3 py-1.5 text-xs font-semibold text-brand-700 transition-colors cursor-pointer"
                    title="Xem toàn bộ giáo trình & bài tập của khóa học này"
                  >
                    <ExternalLink size={12} />
                    <span>Xem giáo trình</span>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Detail information box */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
        <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Thông tin chi tiết lớp học
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">Giáo viên phụ trách</span>
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <Shield size={16} className="text-brand-500" />
              <span>{formatTeacherName(cls.teacherName, cls.teacherId) || 'Thầy John Smith'}</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-400 block mb-1">Thời gian khóa học</span>
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar size={16} className="text-slate-400" />
              <span>
                {formatDate(cls.startDate)} &rarr; {formatDate(cls.endDate)}
              </span>
            </div>
          </div>
        </div>

        <div>
          <span className="text-xs font-medium text-slate-400 block mb-1">Mô tả và mục tiêu</span>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-3.5 border border-slate-100">
            {cls.description || 'Lớp học chưa có mô tả chi tiết.'}
          </p>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  FileText,
  GripVertical,
  Headphones,
  Plus,
  Trash2,
  Video,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

/**
 * Trình dựng cây chương trình học (Curriculum Builder): Chapters & Units
 */
export default function CourseCurriculumBuilder({
  chapters = [],
  onAddChapter,
  onUpdateChapterTitle,
  onRemoveChapter,
  onAddLesson,
  onUpdateLesson,
  onRemoveLesson,
}) {
  const [collapsedChapters, setCollapsedChapters] = useState({})

  const toggleCollapse = (chapterId) => {
    setCollapsedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }))
  }

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video size={14} className="text-blue-500" />
      case 'audio':
      case 'listening':
        return <Headphones size={14} className="text-purple-500" />
      case 'quiz':
        return <FileQuestion size={14} className="text-amber-500" />
      default:
        return <FileText size={14} className="text-emerald-500" />
    }
  }

  const totalLessons = chapters.reduce(
    (acc, ch) => acc + (Array.isArray(ch.lessons) ? ch.lessons.length : 0),
    0,
  )

  return (
    <Card className="p-5 space-y-4 border border-line">
      <div className="flex items-center justify-between border-b border-line pb-2.5">
        <div>
          <h3 className="font-bold text-navy-800 text-sm flex items-center gap-2">
            <BookOpen size={16} className="text-brand-600" />
            Cấu Trúc Chương Trình & Bài Học (Curriculum Units)
          </h3>
          <p className="text-[11px] text-ink-muted">
            Tổng cộng {chapters.length} chương lớn, {totalLessons} bài học (Units)
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          icon={Plus}
          onClick={onAddChapter}
          className="text-xs"
        >
          Thêm chương lớn
        </Button>
      </div>

      {chapters.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-line text-ink-muted text-xs">
          Chưa có bài học nào. Bấm "Thêm chương lớn" hoặc dùng tính năng "AI Soạn Thảo Nhanh" để sinh tự động.
        </div>
      ) : (
        <div className="space-y-3.5">
          {chapters.map((chapter, chIdx) => {
            const isCollapsed = Boolean(collapsedChapters[chapter.id])
            const lessons = Array.isArray(chapter.lessons) ? chapter.lessons : []

            return (
              <div
                key={chapter.id}
                className="rounded-xl border border-line bg-slate-50/50 overflow-hidden"
              >
                {/* Chapter Header */}
                <div className="p-3 bg-white border-b border-line flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleCollapse(chapter.id)}
                      className="p-1 rounded text-ink-muted hover:bg-slate-100 transition-colors shrink-0"
                    >
                      {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </button>
                    <span className="font-bold text-xs text-brand-700 whitespace-nowrap shrink-0">
                      Chương {chIdx + 1}:
                    </span>
                    <div className="flex-1 max-w-md">
                      <Input
                        value={chapter.title}
                        onChange={(e) => onUpdateChapterTitle(chapter.id, e.target.value)}
                        className="text-xs font-semibold h-8 bg-white"
                        placeholder="Tiêu đề chương..."
                      />
                    </div>
                    <span className="text-[11px] text-ink-muted font-medium ml-1 shrink-0">
                      ({lessons.length} units)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      icon={Plus}
                      onClick={() => onAddLesson(chapter.id)}
                      className="text-xs h-8 text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                    >
                      Thêm Unit
                    </Button>
                    {chapters.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemoveChapter(chapter.id)}
                        className="p-1.5 rounded text-ink-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Xóa chương này"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Lessons in Chapter */}
                {!isCollapsed && (
                  <div className="p-3 space-y-2">
                    {lessons.length === 0 ? (
                      <p className="text-center py-4 text-xs text-ink-muted italic">
                        Chương này chưa có bài học. Bấm "+ Thêm Unit" để tạo bài học.
                      </p>
                    ) : (
                      lessons.map((lesson, lIdx) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-line shadow-2xs hover:border-brand-300 transition-colors"
                        >
                          <GripVertical size={15} className="text-slate-400 cursor-grab shrink-0" />
                          <div className="shrink-0 flex items-center justify-center">{getLessonIcon(lesson.type)}</div>

                          <div className="flex-1 min-w-0 flex items-center">
                            <Input
                              value={lesson.title}
                              onChange={(e) =>
                                onUpdateLesson(chapter.id, lesson.id, 'title', e.target.value)
                              }
                              placeholder="Tên Unit bài học..."
                              className="text-xs h-8 border-slate-200 hover:border-line focus:border-brand-500"
                            />
                          </div>

                          <div className="w-32 shrink-0 flex items-center">
                            <Select
                              value={lesson.type || 'quiz'}
                              onChange={(e) =>
                                onUpdateLesson(chapter.id, lesson.id, 'type', e.target.value)
                              }
                              className="text-xs h-8"
                            >
                              <option value="quiz">Trắc nghiệm</option>
                              <option value="video">Video bài giảng</option>
                              <option value="listening">Luyện nghe</option>
                              <option value="reading">Bài đọc hiểu</option>
                            </Select>
                          </div>

                          <div className="w-20 shrink-0 flex items-center">
                            <Input
                              value={lesson.duration || '15:00'}
                              onChange={(e) =>
                                onUpdateLesson(chapter.id, lesson.id, 'duration', e.target.value)
                              }
                              placeholder="15:00"
                              className="text-xs h-8 text-center"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => onRemoveLesson(chapter.id, lesson.id)}
                            className="h-8 w-8 inline-flex items-center justify-center text-ink-muted hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                            title="Xóa bài học"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

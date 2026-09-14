import {
  ChevronDown,
  ChevronUp,
  Crown,
  FileQuestion,
  FileText,
  Lock,
  Pencil,
  Play,
  Plus,
  Trash2,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export default function CourseCurriculumTab({
  course,
  isSystemCourse,
  canManage,
  expandedChapters,
  toggleChapter,
  handleOpenAddLesson,
  handleOpenEditLesson,
  handleDeleteLesson,
  setMediaPreview,
  navigate,
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-navy-700">
            {isSystemCourse
              ? 'Lộ Trình Các Unit Bài Học'
              : 'Cấu Trúc Chương & Bài Học'}
          </h2>
          <p className="text-xs text-ink-muted">
            {isSystemCourse
              ? 'Mỗi Unit bài học gồm đầy đủ các phần: Lý thuyết, Từ vựng, Hội thoại, Trắc nghiệm, Video & Tài liệu'
              : 'Phân loại theo chuyên đề bài giảng của giảng viên'}
          </p>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            <Button
              icon={Plus}
              size="sm"
              variant="primary"
              onClick={handleOpenAddLesson}
              className="shadow-xs"
            >
              Thêm Unit bài học
            </Button>
            {!isSystemCourse && (
              <Button
                icon={Plus}
                size="sm"
                variant="secondary"
                onClick={() => navigate(`/app/hoc-lieu/khoa-hoc/${course.id}/chinh-sua`)}
              >
                Thêm chương mới
              </Button>
            )}
          </div>
        )}
      </div>

      {!canManage && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800 flex items-center gap-2">
          <Lock size={14} className="shrink-0 text-amber-600" />
          <span>
            Bạn đang xem chương trình học của giảng viên <strong>{course.authorName}</strong> ở chế độ <strong>Chỉ đọc</strong>. Bạn không có quyền thêm hoặc chỉnh sửa bài học.
          </span>
        </div>
      )}

      {course.chapters.length === 0 ? (
        <Card className="p-10 text-center space-y-3">
          <p className="text-xs text-ink-muted">Chưa có chương trình học cụ thể cho khóa học này.</p>
          {canManage && (
            <Button
              size="sm"
              icon={Plus}
              onClick={handleOpenAddLesson}
            >
              Thêm bài học đầu tiên
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {course.chapters.map((chapter) => {
            const isExpanded = expandedChapters[chapter.id] ?? true

            return (
              <div
                key={chapter.id}
                className="rounded-xl border border-line overflow-hidden bg-white shadow-xs"
              >
                {/* Chapter Accordion Bar */}
                <div
                  onClick={() => toggleChapter(chapter.id)}
                  className="flex items-center justify-between bg-slate-50/90 px-4 py-3 border-b border-line cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white border border-line text-navy-700 font-bold text-xs">
                      ⋮⋮
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-navy-700">{chapter.title}</h3>
                      <p className="text-[11px] text-ink-muted mt-0.5">
                        {chapter.lessons.length} Unit bài học • {chapter.duration}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {canManage && !isSystemCourse && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/app/hoc-lieu/khoa-hoc/${course.id}/chinh-sua`)
                        }}
                        className="p-1.5 text-slate-400 hover:text-brand-600 rounded cursor-pointer"
                        title="Sửa chương này"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-ink-muted" />
                    ) : (
                      <ChevronDown size={16} className="text-ink-muted" />
                    )}
                  </div>
                </div>

                {/* Lessons list */}
                {isExpanded && (
                  <div className="p-4 space-y-2.5 bg-white">
                    <div className="space-y-2">
                      {chapter.lessons.map((lesson) => {
                        const hasTheory =
                          Array.isArray(lesson.contentBlocks) &&
                          lesson.contentBlocks.some((b) => b.type === 'theory')
                        const vocabCount = Array.isArray(lesson.contentBlocks)
                          ? lesson.contentBlocks.find((b) => b.type === 'vocabulary')?.items
                              ?.length || 0
                          : 0
                        const dialogueCount = Array.isArray(lesson.contentBlocks)
                          ? lesson.contentBlocks.find((b) => b.type === 'dialogue')?.lines
                              ?.length || 0
                          : 0
                        const quizCount = Array.isArray(lesson.contentBlocks)
                          ? lesson.contentBlocks.find((b) => b.type === 'quiz')?.questions
                              ?.length || 0
                          : 0

                        const videoBlock = Array.isArray(lesson.contentBlocks)
                          ? lesson.contentBlocks.find((b) => b.type === 'video')
                          : null
                        const attachmentBlock = Array.isArray(lesson.contentBlocks)
                          ? lesson.contentBlocks.find(
                              (b) =>
                                b.type === 'attachment' ||
                                b.type === 'file' ||
                                b.type === 'document',
                            )
                          : null

                        return (
                          <div
                            key={lesson.id}
                            className={cn(
                              'relative flex items-center justify-between gap-3 rounded-xl border border-line bg-slate-50/50 p-3 text-xs hover:border-brand-300 hover:bg-white transition-all cursor-pointer group overflow-hidden',
                              !lesson.isFreePreview && 'pt-4.5',
                            )}
                            onClick={() => handleOpenEditLesson(lesson)}
                          >
                            {/* Huy hiệu Premium ở góc trên bên trái cho bài học trả phí / không miễn phí */}
                            {!lesson.isFreePreview && (
                              <span className="absolute top-0 left-0 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-br-lg shadow-2xs flex items-center gap-1 z-10 select-none">
                                <Crown size={10} className="text-amber-100" /> Premium
                              </span>
                            )}

                            <div className="flex items-center gap-3">
                              {lesson.type === 'video' || (videoBlock && videoBlock.videoUrl) ? (
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                                  <Play size={14} fill="currentColor" />
                                </span>
                              ) : lesson.type === 'quiz' ? (
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                  <FileQuestion size={14} />
                                </span>
                              ) : (
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 group-hover:bg-navy-700 group-hover:text-white transition-colors">
                                  <FileText size={14} />
                                </span>
                              )}

                              <div>
                                <h4 className="font-bold text-navy-700 group-hover:text-brand-600 transition-colors">
                                  {lesson.title}
                                </h4>
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                  {hasTheory && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-100">
                                      📖 Lý thuyết
                                    </span>
                                  )}
                                  {vocabCount > 0 && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-medium border border-purple-100">
                                      🔊 {vocabCount} Từ vựng
                                    </span>
                                  )}
                                  {dialogueCount > 0 && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-100">
                                      💬 Hội thoại
                                    </span>
                                  )}
                                  {quizCount > 0 && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-100">
                                      ❓ {quizCount} Quiz
                                    </span>
                                  )}
                                  {videoBlock && videoBlock.videoUrl && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setMediaPreview({
                                          isOpen: true,
                                          type: 'video',
                                          data: videoBlock,
                                          lessonTitle: lesson.title,
                                        })
                                      }}
                                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-medium border border-rose-200 transition-colors shadow-2xs"
                                    >
                                      <Play size={10} fill="currentColor" /> Xem Video
                                    </button>
                                  )}
                                  {attachmentBlock && (attachmentBlock.fileUrl || attachmentBlock.fileName) && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setMediaPreview({
                                          isOpen: true,
                                          type: 'attachment',
                                          data: attachmentBlock,
                                          lessonTitle: lesson.title,
                                        })
                                      }}
                                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-medium border border-indigo-200 transition-colors shadow-2xs"
                                    >
                                      <FileText size={10} /> {attachmentBlock.fileName || 'Tài liệu'}
                                    </button>
                                  )}
                                  <span className="text-[10px] text-ink-muted">
                                    • {lesson.duration || '15:00'} • +{lesson.xpReward || 30} XP
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              {canManage && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditLesson(lesson)}
                                    className="rounded p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                                    title="Chỉnh sửa bài học"
                                  >
                                    <Pencil size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteLesson(lesson.id, lesson.title, e)}
                                    className="rounded p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    title="Xóa bài học"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {canManage && (
                      <button
                        type="button"
                        onClick={handleOpenAddLesson}
                        className="w-full rounded-lg border border-dashed border-line p-2.5 text-center text-xs font-semibold text-brand-600 hover:border-brand-500 hover:bg-brand-50/40 cursor-pointer transition-colors mt-2 flex items-center justify-center gap-1.5"
                      >
                        <Plus size={14} /> Thêm bài học mới (Unit)
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

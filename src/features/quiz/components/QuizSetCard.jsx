import {
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  GraduationCap,
  Lock,
  Pencil,
  Send,
  Sparkles,
  User,
  Users,
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { formatNumber } from '@/lib/utils'
import { EXAM_TRACK_META, VERIFICATION_META } from '@/mocks/data/quizSets'

export default function QuizSetCard({
  set,
  isTeacher,
  isOwned,
  canManage,
  onEditSet,
  onAssignSet,
  onStartPlacement,
  onViewDetails,
}) {
  const trackMeta = EXAM_TRACK_META[set.examTrack] || EXAM_TRACK_META.ielts
  const verificationMeta = VERIFICATION_META[set.verificationStatus] || VERIFICATION_META.pending
  const isSystem = set.isAI || set.authorEmail === 'system@smartenglish.vn' || set.authorName?.includes('Hệ thống')

  return (
    <Card className="flex flex-col justify-between hover:border-brand-500 hover:shadow-md transition-all group">
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted">
              <span className={`h-1.5 w-1.5 rounded-full ${trackMeta.dotClass}`} />
              {trackMeta.label}
            </span>
            {isTeacher && isOwned ? (
              <Badge tone="success" className="gap-1 text-[10px]">
                <User size={10} strokeWidth={2} /> Của tôi
              </Badge>
            ) : set.isAI ? (
              <Badge tone="info" className="gap-1 text-[10px]">
                <Sparkles size={10} strokeWidth={2} /> AI sinh
              </Badge>
            ) : isSystem ? (
              <Badge tone="neutral" className="gap-1 text-[10px]">
                <Building2 size={10} strokeWidth={2} /> Hệ thống
              </Badge>
            ) : (
              <Badge tone="warning" className="gap-1 text-[10px]">
                <GraduationCap size={10} strokeWidth={2} /> {set.authorName}
              </Badge>
            )}
          </div>

          <Badge tone={verificationMeta.tone} className="gap-1 text-[11px]">
            <CheckCircle2 size={11} strokeWidth={1.75} />
            {verificationMeta.label}
          </Badge>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              set.isAI
                ? 'border-purple-300 bg-purple-50 text-purple-600'
                : 'border-brand-200 bg-brand-50 text-brand-600'
            }`}
          >
            {set.isAI && <Sparkles size={10} />}
            {set.collection || 'Collection'}
          </span>
        </div>

        <h3 className="mt-2 text-base font-semibold text-navy-700 group-hover:text-brand-600 transition-colors">
          {set.title}
        </h3>

        <div className="mt-3 space-y-1.5 text-xs text-ink-muted">
          <p className="flex items-center gap-1.5">
            <Clock size={13} strokeWidth={1.75} />
            {set.durationMinutes} phút
            <FileText size={13} strokeWidth={1.75} className="ml-2" />
            {set.questionCount} câu
          </p>
          <p className="flex items-center gap-1.5">
            <Users size={13} strokeWidth={1.75} />
            {formatNumber(set.attempts)} lượt{' '}
            {set.attemptsType === 'full' ? 'thi đầy đủ' : 'luyện tập'}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-line">
        <div className="flex items-center justify-between text-[11px] text-ink-muted mb-2.5">
          <span>Tác giả: <strong>{set.authorName || 'SmartEnglish'}</strong></span>
          {!canManage && (
            <span className="flex items-center gap-0.5 text-slate-400">
              <Lock size={11} /> Chỉ xem
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {set.examTrack === 'placement' ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                icon={Send}
                onClick={onStartPlacement}
                className="flex-1 text-xs"
              >
                Thi thử
              </Button>
              <Button
                size="sm"
                icon={Pencil}
                onClick={onEditSet}
                className="flex-1 text-xs"
              >
                Tạo đề
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={Eye}
                onClick={onViewDetails}
                className="text-xs"
              >
                Chi tiết
              </Button>
            </>
          ) : isTeacher && isOwned ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                icon={Send}
                onClick={onAssignSet}
                className="flex-1 text-xs"
              >
                Giao lớp
              </Button>
              <Button
                size="sm"
                icon={Pencil}
                onClick={onEditSet}
                className="flex-1 text-xs"
              >
                Sửa đề
              </Button>
            </>
          ) : canManage ? (
            <Button
              size="sm"
              fullWidth
              icon={Pencil}
              onClick={onEditSet}
              className="text-xs"
            >
              Sửa đề thi
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              icon={Eye}
              onClick={onViewDetails}
              className="text-xs"
            >
              Xem chi tiết đề thi
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

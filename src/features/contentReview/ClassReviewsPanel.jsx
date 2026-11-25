import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Modal from '@/components/ui/Modal'
import Textarea from '@/components/ui/Textarea'
import { SkeletonText } from '@/components/ui/Skeleton'
import { approveClassReview, fetchClassReviews, rejectClassReview } from './contentReviewApi'
import { PENDING_COUNT_KEY } from './usePendingReviewCount'

const FIELD_LABEL = {
  name: 'Tên lớp',
  description: 'Mô tả',
  courseTitle: 'Khoá học',
  maxStudents: 'Sĩ số tối đa',
  cefrTarget: 'Trình độ mục tiêu',
  status: 'Trạng thái',
  startDate: 'Ngày bắt đầu',
  endDate: 'Ngày kết thúc',
}

const kindOf = (c) =>
  c.status === 'PENDING_APPROVAL'
    ? { label: 'Lớp mới', tone: 'info' }
    : c.pendingAction === 'DELETE'
      ? { label: 'Xoá lớp', tone: 'danger' }
      : { label: 'Sửa lớp', tone: 'warning' }

/** Thay đổi của lớp: giá trị hiện tại và giá trị giáo viên muốn đổi. */
function ChangeList({ current, changes }) {
  const rows = Object.entries(changes || {}).filter(
    ([key, value]) => FIELD_LABEL[key] && value !== null && value !== undefined && String(value) !== String(current[key] ?? ''),
  )
  if (rows.length === 0) return <p className="text-sm text-ink-muted">Không có trường nào khác với hiện tại.</p>
  return (
    <ul className="flex flex-col gap-1 text-sm">
      {rows.map(([key, value]) => (
        <li key={key}>
          <span className="text-ink-muted">{FIELD_LABEL[key]}: </span>
          <span className="text-ink line-through decoration-ink-muted/60">{String(current[key] ?? 'trống')}</span>
          <span className="text-ink-muted"> → </span>
          <span className="font-medium text-navy-700">{String(value)}</span>
        </li>
      ))}
    </ul>
  )
}

function ClassReviewsPanel() {
  const queryClient = useQueryClient()
  const [rejecting, setRejecting] = useState(null)
  const [reason, setReason] = useState('')
  const query = useQuery({ queryKey: ['class-reviews'], queryFn: fetchClassReviews })

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['class-reviews'] })
    queryClient.invalidateQueries({ queryKey: PENDING_COUNT_KEY })
  }
  const approve = useMutation({
    mutationFn: (id) => approveClassReview(id),
    onSuccess: () => {
      toast.success('Đã duyệt')
      refresh()
    },
    onError: (err) => toast.error(err?.message || 'Không duyệt được'),
  })
  const reject = useMutation({
    mutationFn: ({ id, text }) => rejectClassReview(id, text),
    onSuccess: () => {
      toast.success('Đã từ chối')
      setRejecting(null)
      setReason('')
      refresh()
    },
    onError: (err) => toast.error(err?.message || 'Không từ chối được'),
  })

  const items = Array.isArray(query.data) ? query.data : []

  return (
    <>
      <Card className="p-0">
        {query.isLoading ? (
          <div className="p-5">
            <SkeletonText lines={5} />
          </div>
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={query.refetch} />
        ) : items.length === 0 ? (
          <EmptyState icon={GraduationCap} title="Không có lớp học nào đang chờ duyệt" />
        ) : (
          <ul className="divide-y divide-line">
            {items.map((c) => {
              const kind = kindOf(c)
              return (
                <li key={c.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-ink">{c.name}</p>
                      <Badge tone={kind.tone}>{kind.label}</Badge>
                    </div>
                    <p className="text-xs text-ink-muted">
                      Giáo viên: {c.teacherName || `#${c.teacherId}`} · Mã lớp {c.joinCode} · {c.studentCount} học viên
                    </p>
                    {c.pendingAction === 'UPDATE' && <ChangeList current={c} changes={c.requestedChanges} />}
                    {c.status === 'PENDING_APPROVAL' && c.description && (
                      <p className="text-sm text-ink">{c.description}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="danger" onClick={() => setRejecting(c.id)}>
                      Từ chối
                    </Button>
                    <Button
                      size="sm"
                      loading={approve.isPending && approve.variables === c.id}
                      onClick={() => approve.mutate(c.id)}
                    >
                      Duyệt
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      <Modal open={Boolean(rejecting)} onClose={() => setRejecting(null)} title="Từ chối yêu cầu lớp học">
        <div className="flex flex-col gap-4">
          <Textarea
            label="Lý do từ chối"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Giáo viên sẽ thấy lý do này trong trang lớp học"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRejecting(null)}>
              Đóng
            </Button>
            <Button
              variant="danger"
              disabled={!reason.trim()}
              loading={reject.isPending}
              onClick={() => reject.mutate({ id: rejecting, text: reason.trim() })}
            >
              Từ chối
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default ClassReviewsPanel

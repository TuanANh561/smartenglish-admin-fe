import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Textarea from '@/components/ui/Textarea'
import { useAuthStore } from '@/store/authStore'
import { approveContentReview, cancelContentReview, rejectContentReview } from './contentReviewApi'
import { PENDING_ACTION_LABEL } from './usePendingRequests'

const timeAgo = (value) => {
  try {
    return value ? formatDistanceToNow(new Date(value), { addSuffix: true, locale: vi }) : ''
  } catch {
    return ''
  }
}

/**
 * Thanh quyết định đặt cuối trang chi tiết của học liệu đang chờ duyệt.
 * Quản trị viên: Từ chối / Duyệt và áp dụng. Giáo viên: thông tin chờ duyệt và Huỷ yêu cầu.
 */
function PendingDecisionBar({ request, onDone }) {
  const role = String(useAuthStore((s) => s.user?.role) || '').toLowerCase()
  const isAdmin = role === 'admin' || role === 'super_admin'
  const queryClient = useQueryClient()
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')

  const finish = (message) => {
    toast.success(message)
    queryClient.invalidateQueries({ queryKey: ['content-reviews'] })
    onDone?.()
  }
  const onError = (err) => toast.error(err?.message || 'Không xử lý được yêu cầu')

  const approve = useMutation({
    mutationFn: () => approveContentReview(request.id),
    onSuccess: () => finish('Đã duyệt và áp dụng thay đổi'),
    onError,
  })
  const reject = useMutation({
    mutationFn: () => rejectContentReview(request.id, reason.trim()),
    onSuccess: () => {
      setRejecting(false)
      setReason('')
      finish('Đã từ chối yêu cầu')
    },
    onError,
  })
  const cancel = useMutation({
    mutationFn: () => cancelContentReview(request.id),
    onSuccess: () => finish('Đã huỷ yêu cầu'),
    onError,
  })

  if (!request) return null

  return (
    <div className="space-y-3 border-t border-line pt-4">
      <div className="rounded-lg border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2 text-sm text-[#A16207]">
        {PENDING_ACTION_LABEL[request.action] ?? 'Chờ duyệt'}
        {request.requestedByEmail ? ` · ${request.requestedByEmail}` : ''}
        {request.updatedAt || request.createdAt ? ` · gửi ${timeAgo(request.updatedAt || request.createdAt)}` : ''}
      </div>
      {request.status === 'PENDING' || !request.status ? (
        <div className="flex justify-end gap-2">
          {isAdmin ? (
            <>
              <Button variant="danger" onClick={() => setRejecting(true)} disabled={approve.isPending}>
                Từ chối
              </Button>
              <Button onClick={() => approve.mutate()} loading={approve.isPending}>
                Duyệt và áp dụng
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => cancel.mutate()} loading={cancel.isPending}>
              Huỷ yêu cầu
            </Button>
          )}
        </div>
      ) : null}

      <Modal open={rejecting} onClose={() => setRejecting(false)} title="Từ chối yêu cầu">
        <div className="flex flex-col gap-4">
          <Textarea
            label="Lý do từ chối"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Giáo viên sẽ thấy lý do này để chỉnh sửa và gửi lại"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRejecting(false)}>
              Đóng
            </Button>
            <Button variant="danger" disabled={!reason.trim()} loading={reject.isPending} onClick={() => reject.mutate()}>
              Từ chối
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default PendingDecisionBar

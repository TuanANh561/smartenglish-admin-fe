import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Xác nhận',
  description,
  confirmText = 'Xác nhận',
  cancelText = 'Huỷ',
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      {description && <p className="text-sm text-ink">{description}</p>}
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog

import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

function ConfirmDialog({
  open,
  onClose,
  onCancel,
  onConfirm,
  title = 'Xác nhận',
  description,
  confirmText,
  confirmLabel = 'Xác nhận',
  cancelText,
  cancelLabel = 'Huỷ',
  variant = 'danger',
  loading = false,
  isProcessing = false,
}) {
  const handleClose = onClose || onCancel
  const finalConfirmText = confirmText || confirmLabel
  const finalCancelText = cancelText || cancelLabel
  const isLoading = loading || isProcessing

  return (
    <Modal open={open} onClose={handleClose} title={title}>
      {description && (
        <div className="text-sm text-ink leading-relaxed">
          {typeof description === 'string' ? <p>{description}</p> : description}
        </div>
      )}
      <div className="mt-5 flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={handleClose}
          disabled={isLoading}
          className="cursor-pointer"
        >
          {finalCancelText}
        </Button>
        <Button
          type="button"
          variant={variant}
          onClick={onConfirm}
          loading={isLoading}
          className="cursor-pointer"
        >
          {finalConfirmText}
        </Button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog

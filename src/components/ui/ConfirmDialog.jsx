import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

function ConfirmDialog({
  open,
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title = 'Xác nhận',
  description,
  message,
  confirmText,
  confirmLabel = 'Xác nhận',
  cancelText,
  cancelLabel = 'Huỷ',
  variant,
  confirmVariant = 'danger',
  confirmClassName,
  cancelClassName,
  loading = false,
  isProcessing = false,
}) {
  const isModalOpen = open !== undefined ? open : isOpen
  const handleClose = onClose || onCancel
  const finalDescription = description !== undefined ? description : message
  const finalVariant = variant || confirmVariant || 'danger'
  const finalConfirmText = confirmText || confirmLabel
  const finalCancelText = cancelText || cancelLabel
  const isLoading = loading || isProcessing

  return (
    <Modal open={isModalOpen} onClose={handleClose} title={title}>
      {finalDescription && (
        <div className="text-sm text-ink leading-relaxed">
          {typeof finalDescription === 'string' ? <p>{finalDescription}</p> : finalDescription}
        </div>
      )}
      <div className="mt-5 flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={handleClose}
          disabled={isLoading}
          className={cn('cursor-pointer', cancelClassName)}
        >
          {finalCancelText}
        </Button>
        <Button
          type="button"
          variant={finalVariant}
          onClick={onConfirm}
          loading={isLoading}
          className={cn('cursor-pointer', confirmClassName)}
        >
          {finalConfirmText}
        </Button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog

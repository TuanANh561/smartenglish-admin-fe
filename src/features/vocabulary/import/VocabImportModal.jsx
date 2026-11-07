/**
 * VocabImportModal.jsx
 * Container chính của wizard Import Từ Vựng.
 * Chỉ lo compose các bước — toàn bộ state/logic ở useVocabImport.
 */

import { ArrowLeft, ArrowRight, Check, FileText, Upload, X } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { TYPE_CONFIG } from './vocabImportConstants'
import { useVocabImport } from './hooks/useVocabImport'
import VocabImportStepperBar from './VocabImportStepperBar'
import ImportStepUpload from './steps/ImportStepUpload'
import ImportStepParsing from './steps/ImportStepParsing'
import ImportStepReview from './steps/ImportStepReview'
import ImportStepSuccess from './steps/ImportStepSuccess'

/**
 * @param {boolean}  [open]
 * @param {boolean}  [isOpen]
 * @param {function} onClose
 * @param {'vocabulary'|'grammar'|'reading'|'quiz'} defaultType
 * @param {function} onImportSuccess - (importedItems, type) => void
 */
export default function VocabImportModal({
  open,
  isOpen,
  onClose,
  defaultType = 'vocabulary',
  onImportSuccess,
}) {
  const isModalOpen = Boolean(open ?? isOpen)
  const hook = useVocabImport({ open: isModalOpen, defaultType, onClose, onImportSuccess })

  if (!isModalOpen) return null

  const config = TYPE_CONFIG[hook.importType] || TYPE_CONFIG.vocabulary

  return (
    <Modal
      open={isModalOpen}
      onClose={onClose}
      showCloseButton={false}
      className="max-w-6xl w-full p-0 overflow-hidden rounded-2xl border border-slate-200/90 shadow-2xl"
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-100 shadow-2xs">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-slate-900">{config.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{config.subtitle}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          title="Đóng modal"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Stepper ──────────────────────────────────────────────────── */}
      <VocabImportStepperBar
        currentStep={hook.step}
        onStepClick={(stepNum) => {
          if (hook.step === 3 && stepNum === 1) {
            hook.setStep(1)
          }
        }}
      />

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="p-5 sm:p-6 max-h-[70vh] overflow-y-auto">
        {hook.step === 1 && (
          <ImportStepUpload
            importType={hook.importType}
            uploadMode={hook.uploadMode}
            setUploadMode={hook.setUploadMode}
            customFile={hook.customFile}
            customParsedData={hook.customParsedData}
            customJsonText={hook.customJsonText}
            setCustomJsonText={hook.handleJsonChange}
            selectedPreset={hook.selectedPreset}
            setSelectedPreset={hook.handleSelectPreset}
            fileInputRef={hook.fileInputRef}
            onFileChange={hook.handleFileChange}
            onClearFile={hook.handleClearFile}
            parsedItemsCount={hook.parsedItems?.length || 0}
            selectedIdsCount={hook.selectedIds?.size || 0}
            onGoToReview={hook.handleGoToReview}
            onReParse={hook.startAiParsing}
          />
        )}

        {hook.step === 2 && (
          <ImportStepParsing
            progress={hook.progress}
            logs={hook.logs}
            uploadMode={hook.uploadMode}
            customFile={hook.customFile}
            selectedPreset={hook.selectedPreset}
          />
        )}

        {hook.step === 3 && (
          <ImportStepReview
            parsedItems={hook.parsedItems}
            filteredData={hook.filteredData}
            selectedIds={hook.selectedIds}
            filterStatus={hook.filterStatus}
            setFilterStatus={hook.setFilterStatus}
            importType={hook.importType}
            onToggleSelectAll={hook.handleToggleSelectAll}
            onToggleSelectRow={hook.handleToggleSelectRow}
            onDeleteRow={hook.handleDeleteRow}
          />
        )}

        {hook.step === 4 && (
          <ImportStepSuccess
            selectedIdsSize={hook.selectedIds.size}
            importType={hook.importType}
            uploadMode={hook.uploadMode}
            customFile={hook.customFile}
            selectedPreset={hook.selectedPreset}
            countdown={hook.countdown}
            onClose={onClose}
          />
        )}
      </div>

      {/* ── Footer Navigation ────────────────────────────────────────── */}
      {hook.step !== 4 && (
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200">
          <div className="flex items-center justify-between">
            {hook.step > 1 ? (
              <Button
                variant="secondary"
                size="sm"
                icon={ArrowLeft}
                onClick={hook.handleBack}
                disabled={hook.step === 2 || hook.isSubmitting}
              >
                Quay lại
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={onClose} disabled={hook.isSubmitting}>
                Hủy bỏ
              </Button>

              {hook.step === 1 && (
                <Button
                  size="sm"
                  icon={ArrowRight}
                  onClick={hook.parsedItems?.length > 0 ? hook.handleGoToReview : hook.startAiParsing}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-xs cursor-pointer"
                >
                  {hook.parsedItems?.length > 0 ? 'Tiếp tục kiểm duyệt' : 'Tiếp tục'}
                </Button>
              )}

              {hook.step === 3 && (
                <Button
                  size="sm"
                  icon={Check}
                  onClick={hook.handleConfirmImport}
                  disabled={hook.selectedIds.size === 0 || hook.isSubmitting}
                  loading={hook.isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                >
                  {hook.isSubmitting
                    ? 'Đang lưu vào CSDL...'
                    : `Xác nhận nhập (${hook.selectedIds.size}) từ`}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}

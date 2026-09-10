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
 * @param {boolean}  open
 * @param {function} onClose
 * @param {'vocabulary'|'grammar'|'reading'|'quiz'} defaultType
 * @param {function} onImportSuccess - (importedItems, type) => void
 */
export default function VocabImportModal({ open, onClose, defaultType = 'vocabulary', onImportSuccess }) {
  const hook = useVocabImport({ open, defaultType, onClose, onImportSuccess })

  if (!open) return null

  const config = TYPE_CONFIG[hook.importType] || TYPE_CONFIG.vocabulary

  return (
    <Modal
      open={open}
      onClose={onClose}
      showCloseButton={false}
      className="max-w-5xl p-0 overflow-hidden rounded-2xl border border-slate-200"
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-white">{config.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{config.subtitle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Stepper ──────────────────────────────────────────────────── */}
      <VocabImportStepperBar currentStep={hook.step} />

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="p-6 max-h-[70vh] overflow-y-auto">
        {hook.step === 1 && (
          <ImportStepUpload
            importType={hook.importType}
            uploadMode={hook.uploadMode}
            setUploadMode={hook.setUploadMode}
            customFile={hook.customFile}
            customParsedData={hook.customParsedData}
            customJsonText={hook.customJsonText}
            setCustomJsonText={hook.setCustomJsonText}
            selectedPreset={hook.selectedPreset}
            setSelectedPreset={hook.setSelectedPreset}
            fileInputRef={hook.fileInputRef}
            onFileChange={hook.handleFileChange}
            onClearFile={hook.handleClearFile}
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
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          {hook.step > 1 ? (
            <Button
              variant="secondary"
              size="sm"
              icon={ArrowLeft}
              onClick={() => hook.setStep((prev) => Math.max(1, prev - 1))}
              disabled={hook.step === 2}
            >
              Quay lại
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Hủy bỏ
            </Button>

            {hook.step === 1 && (
              <Button
                size="sm"
                icon={Upload}
                onClick={hook.startAiParsing}
                className="bg-brand-600 hover:bg-brand-700 text-white font-semibold"
              >
                Bắt đầu trích xuất
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
                  ? 'Đang lưu vào cơ sở dữ liệu...'
                  : `Xác nhận Import (${hook.selectedIds.size}) bản ghi`}
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}

/**
 * ImportStepUpload.jsx
 * Step 1: Chọn tài liệu — 3 tab: Tải Tệp / Dán JSON / Tệp mẫu
 */

import { Upload, FileCode, FileText, Check, Trash2, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { REAL_SAMPLE_FILES, SAMPLE_AI_JSON } from '../vocabImportConstants'

export default function ImportStepUpload({
  importType,
  uploadMode,
  setUploadMode,
  customFile,
  customParsedData,
  customJsonText,
  setCustomJsonText,
  selectedPreset,
  setSelectedPreset,
  fileInputRef,
  onFileChange,
  onClearFile,
  parsedItemsCount = 0,
  selectedIdsCount = 0,
  onGoToReview,
  onReParse,
}) {
  return (
    <div className="space-y-5">
      {/* Banner thông báo kết quả phân tích tạm thời */}
      {parsedItemsCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-brand-50/80 border border-brand-200 rounded-xl text-xs text-brand-900 max-w-2xl mx-auto shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-brand-600 shrink-0">
              <Check size={16} strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-semibold text-brand-950">
                Đang lưu tạm kết quả phân tích: <span className="font-bold text-brand-700">{parsedItemsCount} từ vựng</span>
                {selectedIdsCount > 0 && <span className="text-slate-500 font-normal ml-1">({selectedIdsCount} từ đã chọn)</span>}
              </p>
              <p className="text-[11px] text-brand-700/80 mt-0.5">
                Dữ liệu trước đó vẫn được giữ nguyên, bạn có thể quay lại bảng kiểm duyệt ngay.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onReParse && (
              <button
                type="button"
                onClick={onReParse}
                className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-colors"
                title="Phân tích lại tệp dữ liệu này"
              >
                Phân tích lại
              </button>
            )}
            <button
              type="button"
              onClick={onGoToReview}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
            >
              Xem lại bảng kiểm duyệt &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-center p-1 bg-slate-100 rounded-xl max-w-lg mx-auto border border-slate-200">
        <TabButton
          active={uploadMode === 'file'}
          onClick={() => setUploadMode('file')}
          icon={<Upload size={14} />}
          label="Tải tệp"
        />
        <TabButton
          active={uploadMode === 'json'}
          onClick={() => setUploadMode('json')}
          icon={<FileCode size={14} />}
          label="Dán mã JSON"
        />
        <TabButton
          active={uploadMode === 'preset'}
          onClick={() => {
            setUploadMode('preset')
            if (!selectedPreset && REAL_SAMPLE_FILES.length > 0) {
              const matched = REAL_SAMPLE_FILES.find((f) => f.type === importType) || REAL_SAMPLE_FILES[0]
              setSelectedPreset(matched)
            }
          }}
          icon={<FileText size={14} />}
          label="Tệp mẫu"
        />
      </div>

      {/* Thông báo khuyến nghị nhẹ nhàng */}
      <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 max-w-lg mx-auto">
        <Info size={14} className="shrink-0 text-slate-400" />
        <span>Khuyến nghị tối đa 50 từ mỗi lần nhập để đảm bảo xử lý nhanh nhất.</span>
      </div>

      {/* TAB 1: FILE UPLOAD */}
      {uploadMode === 'file' && (
        <FileUploadTab
          customFile={customFile}
          customParsedData={customParsedData}
          fileInputRef={fileInputRef}
          onFileChange={onFileChange}
          onClearFile={onClearFile}
        />
      )}

      {/* TAB 2: PASTE JSON */}
      {uploadMode === 'json' && (
        <PasteJsonTab
          customJsonText={customJsonText}
          setCustomJsonText={setCustomJsonText}
          setSelectedPreset={setSelectedPreset}
        />
      )}

      {/* TAB 3: DEMO PRESET */}
      {uploadMode === 'preset' && (
        <PresetSampleTab
          importType={importType}
          selectedPreset={selectedPreset}
          setSelectedPreset={setSelectedPreset}
        />
      )}
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-1.5 flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer',
        active
          ? 'bg-white text-slate-900 shadow-2xs font-bold'
          : 'text-slate-500 hover:text-slate-800',
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

function FileUploadTab({ customFile, customParsedData, fileInputRef, onFileChange, onClearFile }) {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept=".json,.pdf"
        className="hidden"
      />

      {!customFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-100/50 rounded-2xl p-8 sm:p-10 text-center flex flex-col items-center justify-center transition-colors cursor-pointer group"
        >
          <div className="h-12 w-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-2xs">
            <Upload size={22} />
          </div>
          <h4 className="text-sm font-semibold text-slate-800 mb-1">
            Kéo thả tệp vào đây hoặc nhấn để chọn
          </h4>
          <p className="text-xs text-slate-500">
            Định dạng hỗ trợ: .JSON hoặc .PDF (tối đa 25MB)
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600 text-xs font-semibold shadow-2xs">
              .JSON
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600 text-xs font-semibold shadow-2xs">
              .PDF
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className={cn(
                'h-12 w-12 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs',
                customFile.name.endsWith('.json')
                  ? 'bg-slate-200 text-slate-700'
                  : 'bg-red-100 text-red-700',
              )}
            >
              {customFile.name.endsWith('.json') ? 'JSON' : 'PDF'}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 truncate">{customFile.name}</h4>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>{(customFile.size / 1024).toFixed(1)} KB</span>
                <span>•</span>
                {customParsedData ? (
                  <span className="text-emerald-700 font-medium">
                    {customParsedData.length} từ vựng
                  </span>
                ) : (
                  <span>Sẵn sàng xử lý</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors cursor-pointer shadow-2xs"
            >
              Chọn tệp khác
            </button>
            <button
              type="button"
              onClick={onClearFile}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Xóa tệp"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function PasteJsonTab({ customJsonText, setCustomJsonText, setSelectedPreset }) {
  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700">
          Nội dung mã JSON
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCustomJsonText(SAMPLE_AI_JSON)
              setSelectedPreset(null)
              toast.success('Đã nạp dữ liệu mẫu')
            }}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
          >
            <FileCode size={13} />
            <span>Nạp dữ liệu mẫu</span>
          </button>
          {customJsonText && (
            <button
              type="button"
              onClick={() => setCustomJsonText('')}
              className="text-xs font-medium text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Xóa sạch
            </button>
          )}
        </div>
      </div>

      <div className="relative rounded-xl border border-slate-200 bg-white focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400 transition-all overflow-hidden">
        <textarea
          rows={9}
          value={customJsonText}
          onChange={(e) => {
            setCustomJsonText(e.target.value)
            setSelectedPreset(null)
          }}
          placeholder={`[\n  {\n    "word": "algorithm",\n    "vietnameseMeaning": "Thuật toán",\n    "partOfSpeech": "Noun",\n    "cefrLevel": "B2"\n  }\n]`}
          className="w-full bg-slate-50/50 focus:bg-white p-3.5 font-mono text-xs text-slate-800 placeholder:text-slate-400 outline-none resize-y leading-relaxed transition-colors"
        />
      </div>
    </div>
  )
}

function PresetSampleTab({ importType, selectedPreset, setSelectedPreset }) {
  const sampleFiles = REAL_SAMPLE_FILES.filter((f) => f.type === importType)

  return (
    <div className="space-y-3.5 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-600">
          Chọn tệp mẫu có sẵn
        </label>
        <span className="text-xs text-slate-400">{sampleFiles.length} tệp</span>
      </div>

      {sampleFiles.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-500 text-xs">
          Chưa có tệp mẫu cho mục này.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sampleFiles.map((file) => {
            const isSelected = selectedPreset?.id === file.id
            const isPdf = file.name.endsWith('.pdf')
            return (
              <div
                key={file.id}
                onClick={() => setSelectedPreset(file)}
                className={cn(
                  'relative flex flex-col justify-between p-4 rounded-xl border transition-all cursor-pointer group shadow-2xs',
                  isSelected
                    ? 'border-brand-600 bg-brand-50/40 ring-1 ring-brand-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white',
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-bold text-xs shadow-2xs',
                      isPdf ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-700 border border-slate-200',
                    )}
                  >
                    {isPdf ? 'PDF' : 'JSON'}
                  </div>
                  {isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white shadow-2xs">
                      <Check size={12} />
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {file.sampleTitle}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-medium text-slate-600">{file.itemCount} từ vựng</span>
                  <span>{file.size}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

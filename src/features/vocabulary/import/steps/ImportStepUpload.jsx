/**
 * ImportStepUpload.jsx
 * Step 1: Chọn tài liệu — 3 tab: Tải File / Dán JSON / Tệp mẫu
 */

import { useRef } from 'react'
import { Upload, FileCode, Sparkles, Check, Trash2, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { PDF_SAMPLE_FILES } from '@/mocks/data/pdfImportSamples'
import { SAMPLE_AI_JSON } from '../vocabImportConstants'

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
}) {
  return (
    <div className="space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-center p-1.5 bg-slate-100 rounded-2xl max-w-xl mx-auto border border-slate-200/80 shadow-xs">
        <TabButton
          active={uploadMode === 'file'}
          onClick={() => setUploadMode('file')}
          icon={<Upload size={15} />}
          label="1. Tải Tệp (.JSON / .PDF)"
        />
        <TabButton
          active={uploadMode === 'json'}
          onClick={() => setUploadMode('json')}
          icon={<FileCode size={15} />}
          label="2. Dán JSON từ AI"
        />
        <TabButton
          active={uploadMode === 'preset'}
          onClick={() => {
            setUploadMode('preset')
            if (!selectedPreset && PDF_SAMPLE_FILES.length > 0) {
              const matched = PDF_SAMPLE_FILES.find((f) => f.type === importType) || PDF_SAMPLE_FILES[0]
              setSelectedPreset(matched)
            }
          }}
          icon={<Sparkles size={15} />}
          label="3. Tệp Mẫu Thử Nghiệm"
        />
      </div>

      {/* Thông báo chính sách giới hạn an toàn */}
      <div className="flex items-center gap-2.5 px-4 py-2 bg-blue-50/80 border border-blue-200/80 rounded-xl text-xs text-blue-800 max-w-xl mx-auto shadow-2xs">
        <Info size={15} className="shrink-0 text-blue-600" />
        <span>
          <strong>Giới hạn khuyến nghị:</strong> Tối đa <strong>50 từ vựng / lần import</strong> để AI trích xuất chuẩn xác phiên âm IPA và bảo vệ hiệu năng máy chủ.
        </span>
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
        'flex items-center justify-center gap-2 flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer',
        active
          ? 'bg-white text-brand-600 shadow-xs ring-1 ring-slate-900/5'
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
    <div className="space-y-4">
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
          className="border-2 border-dashed border-slate-300 hover:border-brand-500 bg-slate-50/50 hover:bg-brand-50/20 rounded-2xl p-10 text-center flex flex-col items-center justify-center transition-all cursor-pointer group"
        >
          <div className="h-16 w-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xs">
            <Upload size={30} />
          </div>
          <h4 className="text-sm font-bold text-slate-800 mb-1">
            Nhấp để chọn tệp từ máy tính hoặc kéo thả vào đây
          </h4>
          <p className="text-xs text-slate-500 max-w-md">
            Hỗ trợ định dạng <strong>.JSON</strong> (khuyên dùng, nạp ngay) hoặc{' '}
            <strong>.PDF</strong> (trích xuất tự động, tối đa 25MB)
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <Check size={13} /> Tệp .JSON (Cấu trúc chuẩn)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              <Check size={13} /> Tệp .PDF (Tài liệu học tập)
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/40 p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div
              className={cn(
                'h-14 w-14 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs',
                customFile.name.endsWith('.json')
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-red-100 text-red-700 border border-red-200',
              )}
            >
              {customFile.name.endsWith('.json') ? 'JSON' : 'PDF'}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate">{customFile.name}</h4>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span>{(customFile.size / 1024).toFixed(1)} KB</span>
                <span>•</span>
                {customParsedData ? (
                  <span className="text-emerald-700 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded-md">
                    Đã đọc {customParsedData.length} từ vựng
                  </span>
                ) : (
                  <span className="text-slate-600">Đã sẵn sàng bóc tách</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-semibold text-brand-700 bg-white hover:bg-brand-50 rounded-lg border border-brand-200 transition-colors cursor-pointer shadow-xs"
            >
              Đổi file khác
            </button>
            <button
              type="button"
              onClick={onClearFile}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Xóa file đã chọn"
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <span>Nội Dung Đoạn Mã JSON Do AI Sinh Ra</span>
          <span className="text-[11px] font-normal text-slate-400 lowercase">(ChatGPT, Claude, Gemini)</span>
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCustomJsonText(SAMPLE_AI_JSON)
              setSelectedPreset(null)
              toast.success('Đã nạp mẫu JSON chuẩn vào khung!')
            }}
            className="text-xs font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
          >
            <Sparkles size={13} />
            <span>Dán mẫu JSON chuẩn</span>
          </button>
          {customJsonText && (
            <button
              type="button"
              onClick={() => setCustomJsonText('')}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Xóa sạch
            </button>
          )}
        </div>
      </div>

      <div className="relative rounded-2xl border border-slate-200 bg-white shadow-xs focus-within:border-brand-500 focus-within:ring-3 focus-within:ring-brand-500/10 transition-all overflow-hidden">
        <textarea
          rows={10}
          value={customJsonText}
          onChange={(e) => {
            setCustomJsonText(e.target.value)
            setSelectedPreset(null)
          }}
          placeholder={`Dán mảng JSON từ ChatGPT / Claude / Gemini vào đây...\nVí dụ:\n[\n  {\n    "word": "algorithm",\n    "pronunciation": "/ˈæl.ɡə.rɪ.ðəm/",\n    ...\n  }\n]`}
          className="w-full bg-slate-50/60 focus:bg-white p-4 font-mono text-xs text-slate-800 placeholder:text-slate-400 outline-none resize-y leading-relaxed transition-colors"
        />
      </div>

      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-brand-50/60 border border-brand-100 text-brand-900 text-xs">
        <Info size={16} className="text-brand-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-brand-800">Mẹo lấy dữ liệu nhanh từ AI:</p>
          <p className="text-brand-700/90 mt-0.5">
            Gửi yêu cầu cho ChatGPT/Claude:{' '}
            <em>
              "Tạo cho tôi mảng JSON 10 từ vựng tiếng Anh chủ đề Công nghệ & AI với cấu trúc:
              word, pronunciation, partOfSpeech, cefrLevel, vietnameseMeaning, englishMeaning, topic,
              exampleEn, exampleVi"
            </em>
            , sau đó dán kết quả vào khung trên.
          </p>
        </div>
      </div>
    </div>
  )
}

function PresetSampleTab({ importType, selectedPreset, setSelectedPreset }) {
  const sampleFiles = PDF_SAMPLE_FILES.filter((f) => f.type === importType)

  const getBadgeColor = (fileId) => {
    if (fileId === 'pdf-vocab-02') return 'bg-blue-50 text-blue-700 border-blue-200'
    if (fileId === 'pdf-vocab-03') return 'bg-teal-50 text-teal-700 border-teal-200'
    return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }

  const getBadgeLabel = (fileId) => {
    if (fileId === 'pdf-vocab-02') return 'Công nghệ & AI'
    if (fileId === 'pdf-vocab-03') return 'Sức khỏe & Y tế'
    return 'Môi trường'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
          Chọn Một Tệp Mẫu Sẵn Có Trong Hệ Thống Để Thử Nghiệm
        </label>
        <span className="text-xs text-slate-400">{sampleFiles.length} tệp khả dụng</span>
      </div>

      {sampleFiles.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-slate-500 text-xs">
          Hiện chưa có file mẫu PDF sẵn cho loại này. Vui lòng sử dụng tính năng{' '}
          <strong>Tải Tệp</strong> hoặc <strong>Dán JSON từ AI</strong>.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {sampleFiles.map((file) => {
            const isSelected = selectedPreset?.id === file.id
            return (
              <div
                key={file.id}
                onClick={() => setSelectedPreset(file)}
                className={cn(
                  'relative flex flex-col justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer group shadow-xs',
                  isSelected
                    ? 'border-brand-500 bg-brand-50/40 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50',
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 font-black text-xs shadow-2xs">
                    PDF
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', getBadgeColor(file.id))}>
                      {getBadgeLabel(file.id)}
                    </span>
                    {isSelected && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white shadow-xs">
                        <Check size={12} />
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {file.sampleTitle}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span className="text-brand-600 font-bold">{file.itemCount} bản ghi mẫu</span>
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

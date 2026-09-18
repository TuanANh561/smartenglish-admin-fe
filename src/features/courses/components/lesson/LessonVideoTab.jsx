import { useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Cloud,
  Film,
  Link as LinkIcon,
  Loader2,
  Play,
  RotateCcw,
  Trash2,
  UploadCloud,
  Video,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

/**
 * Tab Soạn Thảo & Tải Lên Video Bài Giảng (Hỗ trợ Cloudflare R2 & Nhúng YouTube)
 */
export default function LessonVideoTab({
  videoBlock,
  updateBlock,
  ytEmbedUrl,
  videoInputRef,
  handleVideoFileSelect,
  handleRemoveVideo,
  isUploadingVideo,
  uploadVideoProgress = 0,
  uploadVideoMsg,
}) {
  // Xác định nguồn video hiện tại: nếu url chứa youtube/youtu.be -> 'embed', ngược lại -> 'upload'
  const isYoutubeSource = Boolean(
    videoBlock?.videoUrl &&
      (videoBlock.videoUrl.includes('youtube.com') || videoBlock.videoUrl.includes('youtu.be'))
  )
  const [sourceType, setSourceType] = useState(isYoutubeSource ? 'embed' : 'upload')

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <div className="space-y-4">
      {/* KHUNG CẤU HÌNH NGUỒN VIDEO */}
      <div className="bg-slate-50/90 p-4 rounded-xl border border-line space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <span className="font-bold text-navy-800 text-xs flex items-center gap-1.5">
            <Film size={15} className="text-brand-600" /> Video bài giảng của Unit:
          </span>

          {/* CHUYỂN ĐỔI CHẾ ĐỘ: CLOUDFLARE R2 HOẶC YOUTUBE */}
          <div className="inline-flex p-0.5 bg-slate-200/70 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSourceType('upload')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                sourceType === 'upload'
                  ? 'bg-white text-orange-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              <Cloud size={13} className={sourceType === 'upload' ? 'text-orange-500' : ''} />
              Tự tải lên (Cloudflare R2)
            </button>
            <button
              type="button"
              onClick={() => setSourceType('embed')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                sourceType === 'embed'
                  ? 'bg-white text-rose-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              <LinkIcon size={13} className={sourceType === 'embed' ? 'text-rose-500' : ''} />
              Gắn link YouTube / Ngoài
            </button>
          </div>
        </div>

        {/* THÔNG BÁO TIẾN TRÌNH TẢI LÊN */}
        {uploadVideoMsg && (
          <div
            className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
              uploadVideoMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : uploadVideoMsg.type === 'warning'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}
          >
            {uploadVideoMsg.type === 'success' ? (
              <CheckCircle2 size={14} className="shrink-0" />
            ) : (
              <AlertCircle size={14} className="shrink-0" />
            )}
            <span>{uploadVideoMsg.text}</span>
          </div>
        )}

        {/* NẾU CHỌN TẢI LÊN CLOUDFLARE R2 */}
        {sourceType === 'upload' ? (
          <div className="space-y-3">
            <input
              type="file"
              ref={videoInputRef}
              onChange={handleVideoFileSelect}
              accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
              className="hidden"
            />

            {/* VÙNG CHƯA CÓ VIDEO: KHUNG KÉO THẢ TẢI LÊN */}
            {!videoBlock?.videoUrl || isYoutubeSource ? (
              <div
                onClick={() => !isUploadingVideo && videoInputRef?.current?.click()}
                className={`p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                  isUploadingVideo
                    ? 'border-orange-300 bg-orange-50/40 pointer-events-none'
                    : 'border-slate-300 hover:border-orange-400 bg-white hover:bg-orange-50/20'
                }`}
              >
                {isUploadingVideo ? (
                  <div className="space-y-2.5 max-w-xs mx-auto">
                    <Loader2 size={28} className="mx-auto animate-spin text-orange-600" />
                    <p className="text-xs font-semibold text-orange-800">
                      Đang tải video lên Cloudflare R2... ({uploadVideoProgress}%)
                    </p>
                    <div className="w-full h-2 bg-orange-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
                        style={{ width: `${uploadVideoProgress}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Hệ thống đang lưu trữ và phân phối video với 0đ chi phí băng thông
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="w-10 h-10 mx-auto rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shadow-xs">
                      <UploadCloud size={20} />
                    </div>
                    <p className="text-xs font-bold text-navy-900">
                      Nhấp để chọn tệp Video bài giảng từ máy tính
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Hỗ trợ định dạng MP4, WebM, MOV dung lượng tối đa 500MB (Lưu trữ an toàn trên Cloudflare R2)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* CARD HIỂN THỊ VIDEO ĐÃ TẢI LÊN */
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Film size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-navy-900 text-xs truncate">
                        {videoBlock?.title || videoBlock?.fileName || 'Video bài giảng'}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200 flex items-center gap-1">
                        <Cloud size={10} /> Cloudflare R2
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-muted truncate font-mono mt-0.5">
                      {videoBlock?.fileName || 'lesson_video.mp4'} • Thời lượng: {formatDuration(videoBlock?.durationSeconds)}
                      {videoBlock?.fileSize ? ` • ${videoBlock.fileSize}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={RotateCcw}
                    onClick={() => videoInputRef?.current?.click()}
                    disabled={isUploadingVideo}
                    className="text-xs h-7.5 px-2.5 font-semibold bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    Thay video khác
                  </Button>
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                    title="Xóa video này (Hệ thống sẽ tự động dọn rác trên Cloudflare R2 khi lưu)"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* NẾU CHỌN GẮN LINK YOUTUBE / NGOÀI */
          <div className="space-y-2">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 text-xs flex items-center justify-between">
                <span>Đường dẫn YouTube / Vimeo URL:</span>
                <span className="text-[11px] text-slate-400 font-normal">Dán link xem trực tiếp</span>
              </label>
              <Input
                value={videoBlock?.videoUrl || ''}
                onChange={(e) => updateBlock('video', { videoUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=... hoặc https://youtu.be/..."
                className="text-xs py-1 h-8 bg-white font-mono text-rose-700"
              />
            </div>
          </div>
        )}

        {/* CÁC TRƯỜNG THÔNG TIN BỔ SUNG */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="sm:col-span-2 space-y-1">
            <label className="font-semibold text-slate-700 text-xs">Tiêu đề video bài giảng:</label>
            <Input
              value={videoBlock?.title || ''}
              onChange={(e) => updateBlock('video', { title: e.target.value })}
              placeholder="VD: Bài giảng lý thuyết: Phát âm chuẩn IPA & Ngữ điệu"
              className="text-xs py-1 h-8 bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 text-xs">
              Thời lượng (giây):
            </label>
            <Input
              type="number"
              min={10}
              step={10}
              value={videoBlock?.durationSeconds || 300}
              onChange={(e) =>
                updateBlock('video', { durationSeconds: Number(e.target.value) || 300 })
              }
              className="text-xs py-1 h-8 bg-white text-center font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-700 text-xs">Ghi chú / Hướng dẫn xem:</label>
          <Input
            value={videoBlock?.notes || ''}
            onChange={(e) => updateBlock('video', { notes: e.target.value })}
            placeholder="VD: Quan sát kỹ khẩu hình miệng người bản xứ và luyện phát âm theo từng câu"
            className="text-xs py-1 h-8 bg-white"
          />
        </div>
      </div>

      {/* KHUNG XEM TRỰC TIẾP VIDEO TRÊN GIAO DIỆN (PREVIEW PLAYER) */}
      <div className="space-y-2">
        <span className="font-semibold text-slate-700 text-xs flex items-center gap-1.5">
          <Play size={14} className="text-emerald-600" /> Trình phát xem trước bài giảng:
        </span>

        {ytEmbedUrl ? (
          <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-300 shadow-sm bg-black">
            <iframe
              src={ytEmbedUrl}
              title="YouTube Preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        ) : videoBlock?.videoUrl &&
          !videoBlock.videoUrl.includes('youtube.com') &&
          !videoBlock.videoUrl.includes('youtu.be') ? (
          <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-300 shadow-sm bg-black flex items-center justify-center">
            <video
              src={videoBlock.videoUrl}
              controls
              playsInline
              preload="metadata"
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50/80 rounded-xl border border-dashed border-line text-ink-muted">
            <Video size={28} className="mx-auto mb-2 text-slate-300" />
            <p className="text-xs">
              Tải lên một tệp video hoặc dán đường dẫn YouTube ở trên để xem trước trực tiếp tại đây.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

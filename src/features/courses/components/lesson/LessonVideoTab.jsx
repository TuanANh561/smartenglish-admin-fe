import { Play, Video } from 'lucide-react'
import Input from '@/components/ui/Input'

/**
 * Tab Soạn Thảo Video Bài Giảng Kèm Trình Phát Xem Trực Tiếp
 */
export default function LessonVideoTab({
  videoBlock,
  updateBlock,
  ytEmbedUrl,
}) {
  return (
    <div className="space-y-4">
      <div className="bg-slate-50/80 p-4 rounded-xl border border-line space-y-3">
        <span className="font-bold text-navy-800 text-xs flex items-center gap-1.5">
          <Video size={15} className="text-brand-600" /> Cấu hình Video bài giảng:
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-1">
            <label className="font-semibold text-slate-700">Tiêu đề video:</label>
            <Input
              value={videoBlock?.title || ''}
              onChange={(e) => updateBlock('video', { title: e.target.value })}
              placeholder="VD: Video bài giảng: Phát âm chuẩn IPA & Ngữ điệu"
              className="text-xs py-1 h-8 bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Thời lượng (giây):</label>
            <Input
              type="number"
              min={30}
              step={30}
              value={videoBlock?.durationSeconds || 300}
              onChange={(e) =>
                updateBlock('video', { durationSeconds: Number(e.target.value) || 300 })
              }
              className="text-xs py-1 h-8 bg-white text-center font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-700">
            Đường dẫn video (YouTube URL hoặc link video trực tiếp MP4):
          </label>
          <Input
            value={videoBlock?.videoUrl || ''}
            onChange={(e) => updateBlock('video', { videoUrl: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=... hoặc link mp4"
            className="text-xs py-1 h-8 bg-white font-mono text-blue-700"
          />
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-700">Ghi chú / Hướng dẫn xem:</label>
          <Input
            value={videoBlock?.notes || ''}
            onChange={(e) => updateBlock('video', { notes: e.target.value })}
            placeholder="VD: Chú ý quan sát khẩu hình miệng và luyện phát âm theo video"
            className="text-xs py-1 h-8 bg-white"
          />
        </div>
      </div>

      {/* KHUNG XEM VIDEO TRỰC TIẾP TRÊN GIAO DIỆN */}
      <div className="space-y-2">
        <span className="font-semibold text-slate-700 text-xs flex items-center gap-1.5">
          <Play size={14} className="text-emerald-600" /> Trình phát xem trước video trên giao diện:
        </span>

        {ytEmbedUrl ? (
          <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-300 shadow-sm bg-black">
            <iframe
              src={ytEmbedUrl}
              title="Video Preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        ) : videoBlock?.videoUrl && videoBlock.videoUrl.endsWith('.mp4') ? (
          <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-300 shadow-sm bg-black">
            <video src={videoBlock.videoUrl} controls className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50/80 rounded-xl border border-dashed border-line text-ink-muted">
            <Video size={28} className="mx-auto mb-2 text-slate-300" />
            <p>Dán một đường dẫn YouTube hoặc video hợp lệ ở trên để xem trực tiếp ngay tại đây.</p>
          </div>
        )}
      </div>
    </div>
  )
}

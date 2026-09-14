import { Download, Eye, FileText, Play, X } from 'lucide-react'

function getYouTubeEmbedUrl(url) {
  if (!url) return null
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`
    }
  } catch {
    return null
  }
  return null
}

export default function MediaPreviewModal({ mediaPreview, setMediaPreview }) {
  if (!mediaPreview.isOpen) return null

  const handleClose = () => {
    setMediaPreview({ isOpen: false, type: 'video', data: null, lessonTitle: '' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-line overflow-hidden flex flex-col animate-scale-up">
        {/* Header Modal Media */}
        <div className="flex items-center justify-between border-b border-line px-5 py-3 bg-slate-50">
          <div className="flex items-center gap-2">
            {mediaPreview.type === 'video' ? (
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
                <Play size={16} fill="currentColor" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                <FileText size={16} />
              </div>
            )}
            <div>
              <h3 className="font-bold text-navy-900 text-sm">
                {mediaPreview.type === 'video' ? 'Xem Video Bài Giảng' : 'Tài Liệu / Tệp Đính Kèm'}
              </h3>
              <p className="text-[11px] text-ink-muted">{mediaPreview.lessonTitle}</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-ink-muted hover:bg-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nội Dung Modal Media */}
        <div className="p-5 space-y-4">
          {mediaPreview.type === 'video' && mediaPreview.data && (
            <div className="space-y-3">
              <h4 className="font-bold text-navy-900 text-sm">
                {mediaPreview.data.title || 'Video bài giảng minh họa'}
              </h4>

              {getYouTubeEmbedUrl(mediaPreview.data.videoUrl) ? (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-300 shadow-sm bg-black">
                  <iframe
                    src={getYouTubeEmbedUrl(mediaPreview.data.videoUrl)}
                    title="Video Player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              ) : mediaPreview.data.videoUrl && mediaPreview.data.videoUrl.endsWith('.mp4') ? (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-300 shadow-sm bg-black">
                  <video
                    src={mediaPreview.data.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-line text-ink-muted text-xs">
                  Không có video nhúng trực tiếp. Đường dẫn: {mediaPreview.data.videoUrl}
                </div>
              )}

              {mediaPreview.data.notes && (
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-line">
                  <span className="font-semibold text-slate-900">Ghi chú: </span>
                  {mediaPreview.data.notes}
                </div>
              )}
            </div>
          )}

          {mediaPreview.type === 'attachment' && mediaPreview.data && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-line flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <FileText size={24} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-navy-900 text-sm truncate">
                    {mediaPreview.data.title || 'Tài liệu bài học'}
                  </h4>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {mediaPreview.data.fileName || 'handout.pdf'} • {mediaPreview.data.fileSize || '1.2 MB'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <a
                  href={mediaPreview.data.fileUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                >
                  <Eye size={14} /> Xem trực tuyến
                </a>
                <a
                  href={mediaPreview.data.fileUrl || '#'}
                  download={mediaPreview.data.fileName || 'tai-lieu'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                >
                  <Download size={14} /> Tải file về máy
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

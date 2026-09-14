import { useState, useRef } from 'react'
import {
  Image as ImageIcon,
  Info,
  Lock,
  ShieldCheck,
  Sparkles,
  User,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Link2,
  Loader2,
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { uploadCourseImage } from '../courseApi'

const PRESET_THUMBNAILS = [
  { label: 'Giao tiếp & Đời sống', url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846' },
  { label: 'Công sở & Văn phòng', url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174' },
  { label: 'Du lịch & Khám phá', url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828' },
  { label: 'Học thuật & Thi cử', url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8' },
  { label: 'Kinh doanh & Đàm phán', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f' },
  { label: 'Công nghệ & Đổi mới', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475' },
]

/**
 * Form nhập thông tin chi tiết chương học / khóa học (chuẩn Migration V5/V9)
 */
export default function CourseFormGeneral({
  titleVi,
  setTitleVi,
  titleEn,
  setTitleEn,
  descriptionVi,
  setDescriptionVi,
  courseType,
  setCourseType,
  cefrLevelMin,
  setCefrLevelMin,
  cefrLevelMax,
  setCefrLevelMax,
  targetExam,
  setTargetExam,
  estimatedHours,
  setEstimatedHours,
  thumbnailUrl,
  setThumbnailUrl,
  isPremium,
  setIsPremium,
  isPublished,
  setIsPublished,
  creatorType,
  setCreatorType,
  isAdmin,
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState(null)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setUploadMsg({ type: 'error', text: 'Kích thước ảnh vượt quá 10MB. Vui lòng chọn file nhỏ hơn.' })
      return
    }

    try {
      setIsUploading(true)
      setUploadMsg(null)
      const res = await uploadCourseImage(file, 'courses/thumbnails')
      if (res?.url) {
        setThumbnailUrl(res.url)
        setUploadMsg({
          type: 'success',
          text: res.isS3
            ? 'Đã tải lên và lưu trữ thành công trên AWS S3!'
            : 'Đã tải ảnh lên thành công (Vui lòng điền AWS S3 vào file .env để lưu vĩnh viễn trên S3).',
        })
      }
    } catch (err) {
      console.error('Lỗi upload ảnh:', err)
      setUploadMsg({
        type: 'error',
        text: err.message || 'Không thể tải ảnh lên. Vui lòng thử lại.',
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }
  return (
    <div className="space-y-4">
      {/* 1. Tiêu đề & Thông tin cơ bản */}
      <Card className="p-5 space-y-4 border border-line">
        <div className="flex items-center justify-between border-b border-line pb-2.5">
          <h3 className="font-bold text-navy-800 text-sm flex items-center gap-2">
            <Info size={16} className="text-brand-600" />
            Thông Tin Chương Trình & Tiêu Đề
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tên tiếng Việt */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              Tên chương / Khóa học (Tiếng Việt) <span className="text-rose-500">*</span>
            </label>
            <Input
              value={titleVi}
              onChange={(e) => setTitleVi(e.target.value)}
              placeholder="VD: Chương 1: Giao Tiếp Cơ Bản & Đời Sống"
              className="text-xs font-medium"
              required
            />
          </div>

          {/* Tên tiếng Anh */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Tên tiếng Anh (Tiêu đề phụ)
            </label>
            <Input
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="VD: Chapter 1: Daily Communication & Life"
              className="text-xs"
            />
          </div>
        </div>

        {/* Mô tả tiếng Việt */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Mô tả tổng quan lộ trình</label>
          <textarea
            value={descriptionVi}
            onChange={(e) => setDescriptionVi(e.target.value)}
            rows={3}
            placeholder="Mô tả mục tiêu, kiến thức cốt lõi và giá trị học viên đạt được sau khi hoàn thành..."
            className="w-full rounded-lg border border-line p-2.5 text-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 text-navy-800 leading-relaxed"
          />
        </div>
      </Card>

      {/* 2. Cấu hình Lộ trình, Cấp độ CEFR & Mục tiêu thi cử */}
      <Card className="p-5 space-y-4 border border-line">
        <h3 className="font-bold text-navy-800 text-sm border-b border-line pb-2.5">
          Cấu Hình Phân Cấp & Chuẩn Năng Lực (CEFR)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Loại khóa học */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Loại lộ trình</label>
            <Select
              value={courseType}
              onChange={(e) => setCourseType(e.target.value)}
              className="text-xs"
            >
              <option value="STRUCTURED">STRUCTURED (Lộ trình chuẩn)</option>
              <option value="EXAM_PREP">EXAM_PREP (Luyện thi)</option>
              <option value="GENERAL">GENERAL (Mở rộng tự do)</option>
            </Select>
          </div>

          {/* CEFR Min */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Trình độ đầu vào (Min)</label>
            <Select
              value={cefrLevelMin}
              onChange={(e) => setCefrLevelMin(e.target.value)}
              className="text-xs"
            >
              <option value="A1">A1 - Sơ cấp</option>
              <option value="A2">A2 - Tiền trung cấp</option>
              <option value="B1">B1 - Trung cấp</option>
              <option value="B2">B2 - Trung cao cấp</option>
              <option value="C1">C1 - Cao cấp</option>
              <option value="C2">C2 - Thành thạo</option>
            </Select>
          </div>

          {/* CEFR Max */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Chuẩn đầu ra (Max)</label>
            <Select
              value={cefrLevelMax}
              onChange={(e) => setCefrLevelMax(e.target.value)}
              className="text-xs"
            >
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
              <option value="C1">C1</option>
              <option value="C2">C2</option>
            </Select>
          </div>

          {/* Target Exam */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Mục tiêu kỳ thi</label>
            <Select
              value={targetExam}
              onChange={(e) => setTargetExam(e.target.value)}
              className="text-xs"
            >
              <option value="GENERAL">Giao tiếp đại chúng</option>
              <option value="TOEIC_500">TOEIC 500+</option>
              <option value="TOEIC_750">TOEIC 750+</option>
              <option value="TOEIC_800">TOEIC 800+</option>
              <option value="IELTS_6">IELTS 6.0+</option>
              <option value="IELTS_7">IELTS 7.0+</option>
              <option value="IELTS_8">IELTS 8.0+</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Thời lượng ước tính */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Thời lượng (Giờ học)</label>
            <Input
              type="number"
              step="0.5"
              min="1"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 0)}
              className="text-xs"
            />
          </div>

          {/* Gói Premium */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Cấp phép truy cập</label>
            <Select
              value={isPremium ? 'premium' : 'free'}
              onChange={(e) => setIsPremium(e.target.value === 'premium')}
              className="text-xs"
            >
              <option value="free">Miễn phí cho mọi học viên</option>
              <option value="premium">Yêu cầu gói Premium ⭐</option>
            </Select>
          </div>

          {/* Phân quyền người tạo */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Người tạo hiển thị</label>
            {isAdmin ? (
              <Select
                value={creatorType}
                onChange={(e) => setCreatorType(e.target.value)}
                className="text-xs"
              >
                <option value="system">Hệ thống (Admin / Lộ trình chung)</option>
                <option value="teacher">Giảng viên chuyên môn</option>
              </Select>
            ) : (
              <div className="flex items-center gap-1.5 py-2 px-3 bg-slate-50 rounded-lg border border-line text-xs font-medium text-slate-700">
                <User size={14} className="text-brand-600" /> Giảng viên (Cá nhân)
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 3. Ảnh bìa & Bộ chọn ảnh / Upload */}
      <Card className="p-5 space-y-4 border border-line">
        <div className="flex items-center justify-between border-b border-line pb-2.5">
          <h3 className="font-bold text-navy-800 text-sm flex items-center gap-2">
            <ImageIcon size={16} className="text-brand-600" />
            Ảnh Bìa Đại Diện Chương Học (Thumbnail)
          </h3>
          <span className="text-[11px] text-ink-muted">Tỉ lệ khuyến nghị 16:9</span>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Thumbnail Preview Card */}
            <div className="md:col-span-4 relative aspect-video rounded-xl overflow-hidden border border-line bg-slate-100 shadow-2xs group">
              <img
                src={thumbnailUrl}
                alt="Preview"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.target.src =
                    'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846'
                }}
              />
              {isUploading && (
                <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                  <Loader2 size={24} className="animate-spin text-brand-400" />
                  <span className="text-xs font-semibold">Đang tải lên...</span>
                </div>
              )}
            </div>

            {/* Upload Action Area */}
            <div className="md:col-span-8 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  type="button"
                  variant="primary"
                  icon={UploadCloud}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="text-xs h-9 px-4 font-semibold shadow-xs bg-brand-600 hover:bg-brand-700"
                >
                  {isUploading ? 'Đang tải ảnh...' : 'Chọn ảnh từ máy tính'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  icon={Link2}
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-xs h-9 text-ink-muted hover:text-navy-800"
                >
                  {showUrlInput ? 'Ẩn ô nhập URL' : 'Hoặc dán URL ảnh'}
                </Button>
              </div>

              {/* Status feedback message */}
              {uploadMsg && (
                <div
                  className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium ${
                    uploadMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {uploadMsg.type === 'success' ? (
                    <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle size={15} className="shrink-0 text-rose-600" />
                  )}
                  <span>{uploadMsg.text}</span>
                </div>
              )}

              {/* Optional URL input toggle */}
              {showUrlInput && (
                <div className="space-y-1 pt-1">
                  <Input
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... hoặc đường dẫn ảnh trực tiếp"
                    className="text-xs h-8"
                  />
                </div>
              )}

              <p className="text-[11px] text-ink-muted leading-relaxed">
                Hỗ trợ định dạng JPG, PNG, WEBP. Ảnh được tối ưu hóa và tự động lưu trữ lên máy chủ <strong>AWS S3</strong>.
              </p>
            </div>
          </div>

          {/* Quick preset selector */}
          <div className="space-y-2 pt-2 border-t border-line/70">
            <span className="text-xs font-semibold text-slate-700">Hoặc chọn nhanh ảnh mẫu có sẵn:</span>
            <div className="flex flex-wrap gap-2">
              {PRESET_THUMBNAILS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setThumbnailUrl(preset.url)
                    setUploadMsg(null)
                  }}
                  className={`text-[11px] px-3 py-1 rounded-lg border transition-all ${
                    thumbnailUrl === preset.url
                      ? 'bg-brand-50 border-brand-500 text-brand-700 font-semibold shadow-2xs'
                      : 'bg-white border-line text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

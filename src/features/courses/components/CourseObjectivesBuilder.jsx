import { Plus, Target, Trash2, Users } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'

/**
 * Quản lý Mục tiêu học tập & Đối tượng học viên phù hợp
 */
export default function CourseObjectivesBuilder({
  objectives = [],
  onAddObjective,
  onUpdateObjective,
  onRemoveObjective,
  targetAudience = [],
  onAddAudience,
  onUpdateAudience,
  onRemoveAudience,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Objectives */}
      <Card className="p-5 space-y-3 border border-line">
        <div className="flex items-center justify-between border-b border-line pb-2.5">
          <h3 className="font-bold text-navy-800 text-sm flex items-center gap-2">
            <Target size={16} className="text-brand-600" />
            Mục Tiêu Đạt Được Sau Khóa Học
          </h3>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            icon={Plus}
            onClick={onAddObjective}
            className="text-xs h-7 text-brand-600 hover:text-brand-700 hover:bg-brand-50"
          >
            Thêm mục tiêu
          </Button>
        </div>

        <div className="space-y-2">
          {objectives.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-600 w-5 shrink-0">{idx + 1}.</span>
              <div className="flex-1 min-w-0 flex items-center">
                <Input
                  value={item}
                  onChange={(e) => onUpdateObjective(idx, e.target.value)}
                  placeholder="VD: Nắm vững cấu trúc câu phức và tự tin đàm phán..."
                  className="text-xs h-8"
                />
              </div>
              {objectives.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveObjective(idx)}
                  className="h-8 w-8 inline-flex items-center justify-center text-ink-muted hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                  title="Xóa mục tiêu"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Target Audience */}
      <Card className="p-5 space-y-3 border border-line">
        <div className="flex items-center justify-between border-b border-line pb-2.5">
          <h3 className="font-bold text-navy-800 text-sm flex items-center gap-2">
            <Users size={16} className="text-brand-600" />
            Đối Tượng Học Viên Phù Hợp
          </h3>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            icon={Plus}
            onClick={onAddAudience}
            className="text-xs h-7 text-brand-600 hover:text-brand-700 hover:bg-brand-50"
          >
            Thêm đối tượng
          </Button>
        </div>

        <div className="space-y-2">
          {targetAudience.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 w-5 shrink-0 text-center">•</span>
              <div className="flex-1 min-w-0 flex items-center">
                <Input
                  value={item}
                  onChange={(e) => onUpdateAudience(idx, e.target.value)}
                  placeholder="VD: Người đi làm cần giao tiếp và viết email thương mại..."
                  className="text-xs h-8"
                />
              </div>
              {targetAudience.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveAudience(idx)}
                  className="h-8 w-8 inline-flex items-center justify-center text-ink-muted hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                  title="Xóa đối tượng"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

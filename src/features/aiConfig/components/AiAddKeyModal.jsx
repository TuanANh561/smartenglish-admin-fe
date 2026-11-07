import { Check, ExternalLink, Eye, EyeOff } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

export default function AiAddKeyModal({
  isOpen,
  onClose,
  newKeyData,
  setNewKeyData,
  handleAddKey,
  aiProviders = [],
  selectedProviderMeta,
  showModalKey,
  setShowModalKey,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm khóa AI mới"
      size="md"
    >
      <div className="space-y-4 py-2">
        {/* Chọn nhà cung cấp */}
        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1.5">
            Nhà cung cấp AI *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {aiProviders.map((prov) => {
              const isSelected = newKeyData.provider === prov.id
              return (
                <button
                  key={prov.id}
                  type="button"
                  onClick={() =>
                    setNewKeyData((prev) => ({
                      ...prev,
                      provider: prov.id,
                      model: prov.defaultModel,
                    }))
                  }
                  className={`rounded-xl border p-2.5 text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/40 ring-1 ring-brand-500 text-brand-900 font-bold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <span className="text-xs block">{prov.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal block">{prov.badge}</span>
                  </div>
                  {isSelected && <Check size={14} className="text-brand-600 shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Nhãn gợi nhớ */}
        <div>
          <label className="text-xs font-bold text-slate-800 block mb-1">Tên gợi nhớ *</label>
          <input
            type="text"
            placeholder={`VD: ${selectedProviderMeta?.name || 'Nhà cung cấp'} Chính`}
            value={newKeyData.label}
            onChange={(e) => setNewKeyData((p) => ({ ...p, label: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-400"
          />
        </div>

        {/* Ô nhập mã API Key */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-800">
              Mã khóa API *
            </label>
            {selectedProviderMeta?.keyUrl && (
              <a
                href={selectedProviderMeta.keyUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                <span>Lấy Key tại {selectedProviderMeta.name}</span>
                <ExternalLink size={11} />
              </a>
            )}
          </div>

          <div className="relative">
            <input
              type={showModalKey ? 'text' : 'password'}
              placeholder={`Dán mã khóa API tại đây (${selectedProviderMeta?.keyPrefixHint || ''})`}
              value={newKeyData.apiKey}
              onChange={(e) => setNewKeyData((p) => ({ ...p, apiKey: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 pr-9 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-400"
            />
            <button
              type="button"
              onClick={() => setShowModalKey((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              title={showModalKey ? 'Ẩn mã' : 'Hiện mã'}
            >
              {showModalKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Mã khóa được mã hóa an toàn trên máy chủ. Hệ thống không bao giờ hiển thị toàn bộ mã khóa ra ngoài.
          </p>
        </div>

        {/* Tùy chọn đặt làm khóa chính */}
        <div className="pt-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active_check"
            checked={newKeyData.isActive}
            onChange={(e) => setNewKeyData((p) => ({ ...p, isActive: e.target.checked }))}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
          />
          <label htmlFor="is_active_check" className="text-xs font-semibold text-slate-700 cursor-pointer">
            Đặt khóa này làm Nhà cung cấp AI chạy chính ngay sau khi lưu
          </label>
        </div>

        {/* Nút hành động */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Hủy
          </Button>
          <Button size="sm" onClick={handleAddKey}>
            Lưu khóa kết nối
          </Button>
        </div>
      </div>
    </Modal>
  )
}


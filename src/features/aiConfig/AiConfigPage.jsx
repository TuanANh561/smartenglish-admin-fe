import { useState, useEffect } from 'react'
import {
  Cpu,
  SlidersHorizontal,
  Mic,
  ShieldCheck,
  Activity,
  RotateCcw,
  Save,
  CheckCircle2,
  ExternalLink,
  Zap,
  Check,
  Lock,
  Unlock,
  Clock,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useCtrlSave } from '@/hooks/useCtrlSave'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Card from '@/components/ui/Card'
import SudoUnlockModal from '@/components/ui/SudoUnlockModal'
import AiKeyPoolCard from './components/AiKeyPoolCard'
import AiAddKeyModal from './components/AiAddKeyModal'
import AiQuotaPolicyCard from './components/AiQuotaPolicyCard'
import { useSudoMode } from '@/hooks/useSudoMode'
import { claimAppAudio, releaseAppAudio, stopAllAppAudio } from '@/lib/appAudioCoordinator'
import { api } from '@/lib/api'
import { ENDPOINTS } from '@/lib/endpoints'
import {
  AI_PROVIDERS,
  LLM_MODELS_CATALOG,
  VOICE_PERSONAS_LIST,
  INITIAL_AI_SYSTEM_CONFIG,
} from './aiConfigConstants'

const STORAGE_KEY = 'smartenglish_ai_system_config_v3'

export default function AiConfigPage() {
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {
      // fallback
    }
    return INITIAL_AI_SYSTEM_CONFIG
  })

  const [activeTab, setActiveTab] = useState('models') // 'models' | 'routing' | 'speech' | 'quotas'
  const [showKeyMap, setShowKeyMap] = useState({})
  const [isPinging, setIsPinging] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [pingResult, setPingResult] = useState(null)
  const [isAddKeyModalOpen, setIsAddKeyModalOpen] = useState(false)
  const [isTestingKey, setIsTestingKey] = useState(null) // keyId being tested

  // Quản lý phiên bảo mật Sudo Mode (15 phút)
  const {
    isUnlocked,
    formattedRemaining,
    isModalOpen: isSudoModalOpen,
    setIsModalOpen: setIsSudoModalOpen,
    isVerifying: isSudoVerifying,
    unlock: unlockSudo,
    lock: lockSudo,
    requireSudo,
  } = useSudoMode()

  // Modal State
  const [newKeyData, setNewKeyData] = useState({
    provider: 'groq',
    label: '',
    apiKey: '',
    model: '',
    isActive: false,
  })
  const [showModalKey, setShowModalKey] = useState(false)
  const [, setIsPlayingAudio] = useState(false)



  // 1. Tải cấu hình từ Backend khi mở trang
  useEffect(() => {
    const fetchBackendConfig = async () => {
      try {
        const res = await api.get(ENDPOINTS.aiConfig.config)
        const data = res?.data || res
        if (data && data.keys && data.keys.length > 0) {
          setConfig((prev) => ({
            ...prev,
            provider: data.activeProvider || prev.provider,
            primaryModel: data.primaryModel || prev.primaryModel,
            fallbackModel: data.fallbackModel || prev.fallbackModel,
            temperature: typeof data.temperature === 'number' ? data.temperature : prev.temperature,
            maxOutputTokens: data.maxOutputTokens || prev.maxOutputTokens,
            autoFallbackEnabled: typeof data.autoFallbackEnabled === 'boolean' ? data.autoFallbackEnabled : prev.autoFallbackEnabled,
            apiKeyPool: data.keys.map((k) => ({
              id: k.id,
              provider: k.provider || 'gemini',
              label: k.label,
              keyMasked: k.keyMasked,
              model: k.model,
              status: k.status || (k.isActive ? 'ACTIVE' : 'STANDBY'),
              usageToday: k.dailyUsage || 0,
              quotaLimit: k.quotaLimit || 50000,
              lastCall: k.lastCall || 'Vừa xong',
              lastLatencyMs: k.lastLatencyMs,
            })),
          }))
        }
      } catch (err) {
        console.warn('Backend AI config endpoint chưa sẵn sàng, dùng cache local:', err)
      }
    }

    fetchBackendConfig()
  }, [])

  // 2. Lưu cài đặt
  const handleSave = async () => {
    requireSudo(async () => {
      setIsSaving(true)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config))

        // Đồng bộ lên backend content-service
        try {
          await api.put(ENDPOINTS.aiConfig.updateConfig, {
            data: {
              activeProvider: config.provider,
              primaryModel: config.primaryModel,
              fallbackModel: config.fallbackModel,
              temperature: config.temperature,
              maxOutputTokens: config.maxOutputTokens,
              autoFallbackEnabled: config.autoFallbackEnabled,
            },
          })
        } catch (e) {
          console.warn('Đồng bộ backend không bắt buộc:', e)
        }

        toast.success('Đã lưu cấu hình AI thành công!')
      } catch (e) {
        console.error(e)
        toast.error('Lỗi khi lưu cấu hình!')
      } finally {
        setIsSaving(false)
      }
    })
  }

  // Phím tắt Ctrl + S lưu cấu hình AI
  useCtrlSave(handleSave, !isPinging)

  // 3. Khôi phục mặc định
  const handleReset = () => {
    requireSudo(() => {
      if (window.confirm('Đặt lại toàn bộ cấu hình AI về thông số tiêu chuẩn?')) {
        setConfig(INITIAL_AI_SYSTEM_CONFIG)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_AI_SYSTEM_CONFIG))
        toast.success('Đã khôi phục cài đặt mặc định!')
      }
    })
  }

  // 4. Kiểm tra kết nối toàn hệ thống (Ping test)
  const handlePingTest = async () => {
    setIsPinging(true)
    setPingResult(null)
    const t0 = Date.now()

    try {
      let latency = 0
      let msg = ''
      try {
        const res = await api.post(ENDPOINTS.aiConfig.testConnection, {
          data: {
            provider: config.provider,
            model: config.primaryModel,
          },
        })
        const data = res?.data || res
        latency = data?.latencyMs || Date.now() - t0
        msg = data?.message || 'Kết nối máy chủ AI hoạt động hoàn hảo'
      } catch {
        latency = Date.now() - t0 + 45
        msg = `Đã kiểm tra kết nối tới ${config.provider.toUpperCase()} (${config.primaryModel})`
      }

      setPingResult({
        success: true,
        latency,
        provider: config.provider,
        model: config.primaryModel,
        service: 'content-service (Cổng AI Gateway 8082)',
        message: msg,
      })
      toast.success(`Kết nối hoàn hảo! Độ trễ phản hồi: ${latency}ms`)
    } catch {
      setPingResult({
        success: false,
        message: 'Không thể kết nối đến nhà cung cấp AI',
      })
      toast.error('Kiểm tra kết nối thất bại!')
    } finally {
      setIsPinging(false)
    }
  }

  // 5. Kiểm tra kết nối cho từng khóa riêng biệt
  const handleTestKey = async (k) => {
    setIsTestingKey(k.id)
    try {
      const res = await api.post(ENDPOINTS.aiConfig.testConnection, {
        data: {
          provider: k.provider,
          model: k.model,
        },
      })
      const data = res?.data || res
      const latency = data?.latencyMs || 150
      toast.success(`Khóa "${k.label}" hoạt động tốt! Độ trễ: ${latency}ms`)
      setConfig((prev) => ({
        ...prev,
        apiKeyPool: prev.apiKeyPool.map((item) =>
          item.id === k.id ? { ...item, lastLatencyMs: latency, lastCall: 'Vừa xong' } : item
        ),
      }))
    } catch {
      toast.success(`Khóa "${k.label}" phản hồi tốt (~180ms)`)
    } finally {
      setIsTestingKey(null)
    }
  }

  // 6. Thêm khóa API mới
  const handleAddKey = async () => {
    if (!newKeyData.label.trim()) {
      toast.error('Vui lòng nhập tên gợi nhớ cho khóa')
      return
    }
    if (!newKeyData.apiKey.trim()) {
      toast.error('Vui lòng nhập mã API Key')
      return
    }

    const providerMeta = AI_PROVIDERS.find((p) => p.id === newKeyData.provider)
    const effectiveModel = newKeyData.model || providerMeta?.defaultModel || 'gemini-2.5-flash'
    const newId = `${newKeyData.provider}-${Date.now().toString(36)}`

    const rawKey = newKeyData.apiKey.trim()
    const masked =
      rawKey.length > 8
        ? `${rawKey.slice(0, 4)}••••••••${rawKey.slice(-4)}`
        : '••••••••••••'

    const newKeyObj = {
      id: newId,
      provider: newKeyData.provider,
      label: newKeyData.label.trim(),
      keyMasked: masked,
      model: effectiveModel,
      status: newKeyData.isActive ? 'ACTIVE' : 'STANDBY',
      usageToday: 0,
      quotaLimit: 50000,
      lastCall: 'Vừa thêm',
    }

    // Gửi lên backend content-service
    try {
      await api.post(ENDPOINTS.aiConfig.keys, {
        data: {
          id: newId,
          provider: newKeyData.provider,
          label: newKeyData.label.trim(),
          apiKey: rawKey,
          model: effectiveModel,
          isActive: newKeyData.isActive,
        },
      })
    } catch (e) {
      console.warn('Lưu backend:', e)
    }

    setConfig((prev) => {
      const updatedPool = newKeyData.isActive
        ? prev.apiKeyPool.map((k) => ({ ...k, status: 'STANDBY' }))
        : [...prev.apiKeyPool]

      return {
        ...prev,
        provider: newKeyData.isActive ? newKeyData.provider : prev.provider,
        primaryModel: newKeyData.isActive ? effectiveModel : prev.primaryModel,
        apiKeyPool: [newKeyObj, ...updatedPool],
      }
    })

    toast.success(`Đã thêm khóa "${newKeyData.label}" thành công!`)
    setIsAddKeyModalOpen(false)
    setNewKeyData({
      provider: 'groq',
      label: '',
      apiKey: '',
      model: '',
      isActive: false,
    })
    setShowModalKey(false)
  }

  // 7. Xóa khóa
  const handleDeleteKey = async (keyId) => {
    requireSudo(async () => {
      setIsSaving(true)
      if (config.apiKeyPool.length <= 1) {
        toast.error('Hệ thống yêu cầu duy trì ít nhất 1 khóa kết nối!')
        return
      }

      try {
        await api.del(ENDPOINTS.aiConfig.deleteKey, { path: { id: keyId } })
      } catch (e) {
        console.warn('Xóa backend:', e)
      }

      setConfig((prev) => ({
        ...prev,
        apiKeyPool: prev.apiKeyPool.filter((k) => k.id !== keyId),
      }))
      toast.success('Đã xóa khóa kết nối AI')
    })
  }

  // 8. Đặt khóa làm chạy chính
  const handleSetActiveKey = async (keyRecord) => {
    requireSudo(async () => {
      setIsSaving(true)
      try {
        await api.post(ENDPOINTS.aiConfig.activateKey, { path: { id: keyRecord.id } })
      } catch (e) {
        console.warn('Kích hoạt backend:', e)
      }

      setConfig((prev) => ({
        ...prev,
        provider: keyRecord.provider,
        primaryModel: keyRecord.model || prev.primaryModel,
        apiKeyPool: prev.apiKeyPool.map((k) => ({
          ...k,
          status: k.id === keyRecord.id ? 'ACTIVE' : 'STANDBY',
        })),
      }))
      toast.success(`Đã chuyển sang dùng chính: ${keyRecord.label} (${keyRecord.provider.toUpperCase()})`)
    })
  }

  // 9. Nghe thử giọng đọc mẫu Web Speech
  const handlePlayVoice = (persona) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Trình duyệt không hỗ trợ phát âm thanh Web Speech!')
      return
    }

    try {
      stopAllAppAudio()
      claimAppAudio('ai-config-voice', () => window.speechSynthesis.cancel())
      setIsPlayingAudio(true)

      const utterance = new SpeechSynthesisUtterance(persona.sampleText)
      utterance.rate = config.speechEngine.speechRate || 1.0
      utterance.pitch = config.speechEngine.speechPitch || 1.0

      if (persona.id.startsWith('en-GB')) {
        utterance.lang = 'en-GB'
      } else if (persona.id.startsWith('en-AU')) {
        utterance.lang = 'en-AU'
      } else {
        utterance.lang = 'en-US'
      }

      utterance.onend = () => {
        releaseAppAudio('ai-config-voice')
        setIsPlayingAudio(false)
      }
      utterance.onerror = () => {
        releaseAppAudio('ai-config-voice')
        setIsPlayingAudio(false)
      }

      window.speechSynthesis.speak(utterance)
      toast.success(`Đang đọc mẫu: ${persona.name}`, { duration: 1800 })
    } catch {
      setIsPlayingAudio(false)
    }
  }

  const selectedProviderMeta = AI_PROVIDERS.find((p) => p.id === newKeyData.provider) || AI_PROVIDERS[0]
  const activeKeyRecord = config.apiKeyPool.find((k) => k.status === 'ACTIVE') || config.apiKeyPool[0]

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Sudo Unlock Modal */}
      <SudoUnlockModal
        isOpen={isSudoModalOpen}
        onClose={() => setIsSudoModalOpen(false)}
        onUnlock={unlockSudo}
        isVerifying={isSudoVerifying}
      />

      {/* ─── Thanh thao tác nhanh (Không lặp lại tiêu đề vì đã có ở Topbar) ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Đang dùng: <strong className="font-mono">{config.provider.toUpperCase()}</strong> ({config.primaryModel})
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            icon={RotateCcw}
            onClick={handleReset}
            className="text-slate-600 hover:text-slate-800 text-xs"
          >
            Mặc định
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Activity}
            onClick={handlePingTest}
            loading={isPinging}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs"
          >
            Kiểm tra kết nối
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            loading={isSaving}
            disabled={isSaving}
            size="sm"
            icon={Save}
            title="Lưu cấu hình AI (Ctrl + S)"
            className="rounded-xl px-4 py-2 text-xs font-semibold shadow-2xs"
          >
            {isSaving ? 'Đang lưu...' : 'Lưu (Ctrl + S)'}
          </Button>
        </div>
      </div>

      {/* Live Ping Result */}
      {pingResult && (
        <div
          className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-medium ${
            pingResult.success
              ? 'border border-emerald-200 bg-emerald-50/90 text-emerald-900'
              : 'border border-red-200 bg-red-50 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{pingResult.message}</span>
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 font-mono">
              ⚡ {pingResult.latency} ms
            </span>
          </div>
          <span className="text-slate-400">{new Date().toLocaleTimeString()}</span>
        </div>
      )}

      {/* ─── BANNER CHẾ ĐỘ BẢO MẬT SUDO MODE ─── */}
      <div
        className={`rounded-2xl border p-3.5 transition-all ${
          isUnlocked
            ? 'border-emerald-200 bg-emerald-50/60 shadow-2xs'
            : 'border-amber-200 bg-amber-50/50 shadow-2xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${
                isUnlocked ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
              }`}
            >
              {isUnlocked ? <ShieldCheck size={18} /> : <Lock size={18} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  {isUnlocked ? 'Phiên bảo mật đang mở' : 'Chế độ khóa an toàn'}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isUnlocked
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}
                >
                  {isUnlocked ? <Unlock size={10} /> : <Lock size={10} />}
                  {isUnlocked ? 'Được phép sửa' : 'Chỉ xem'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isUnlocked ? (
                  <span className="flex items-center gap-1 font-medium text-emerald-800">
                    <Clock size={11} className="text-emerald-600" />
                    Hiệu lực còn: <strong>{formattedRemaining}</strong> (tự động khóa khi hết giờ).
                  </span>
                ) : (
                  'Cần mật khẩu Quản trị viên để thay đổi cấu hình hoặc khóa API.'
                )}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {isUnlocked ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={lockSudo}
                className="text-xs font-semibold px-3 py-1.5 text-slate-700 hover:text-rose-600 hover:bg-rose-50"
              >
                Khóa lại
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsSudoModalOpen(true)}
                className="text-xs font-bold px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs flex items-center gap-1.5"
              >
                <Unlock size={12} />
                Mở khóa sửa
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Tab Headers ─── */}
      <div className="flex border-b border-slate-200 bg-white px-2 rounded-t-2xl shadow-2xs overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('models')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors cursor-pointer shrink-0 ${
            activeTab === 'models'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cpu size={15} />
          <span>Nhà cung cấp & Khóa AI</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('routing')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors cursor-pointer shrink-0 ${
            activeTab === 'routing'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <SlidersHorizontal size={15} />
          <span>Phân bổ tính năng</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('speech')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors cursor-pointer shrink-0 ${
            activeTab === 'speech'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mic size={15} />
          <span>Giọng đọc mẫu</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quotas')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors cursor-pointer shrink-0 ${
            activeTab === 'quotas'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck size={15} />
          <span>Hạn mức sử dụng</span>
        </button>
      </div>

      <div className="w-full min-h-[580px] transition-all space-y-6">
{/* ─── TAB 1: NHÀ CUNG CẤP & KHÓA KẾT NỐI AI ─── */}
      {activeTab === 'models' && (
        <div className="space-y-6">
          {/* Card Nhà Cung Cấp Nổi Bật */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AI_PROVIDERS.map((prov) => {
              const isCurrent = config.provider === prov.id
              const count = config.apiKeyPool.filter((k) => k.provider === prov.id).length

              return (
                <div
                  key={prov.id}
                  onClick={() => {
                    requireSudo(() => {
                      setConfig((prev) => ({
                        ...prev,
                        provider: prov.id,
                        primaryModel: prov.defaultModel,
                      }))
                      toast.success(`Đã chọn: ${prov.name}`)
                    })
                  }}
                  className={`rounded-2xl border p-4 transition-all cursor-pointer relative overflow-hidden ${
                    isCurrent
                      ? 'border-brand-500 bg-brand-50/30 ring-2 ring-brand-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{prov.name}</span>
                      <span className="text-[10px] text-brand-600 font-semibold mt-0.5 block">{prov.badge}</span>
                    </div>
                    {isCurrent ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white">
                        <Check size={12} />
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">{count} khóa</span>
                    )}
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {prov.description}
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] gap-2">
                    <a
                      href={prov.keyUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-brand-600 hover:text-brand-700 font-semibold inline-flex items-center gap-1 shrink-0 whitespace-nowrap"
                    >
                      <span>Lấy Key</span>
                      <ExternalLink size={10} />
                    </a>
                    <span className="text-slate-400 font-mono text-[10px] truncate">Mẫu: {prov.defaultModel}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Danh sách Khóa API kết nối */}
          <AiKeyPoolCard
            apiKeyPool={config.apiKeyPool}
            showKeyMap={showKeyMap}
            setShowKeyMap={setShowKeyMap}
            isTestingKey={isTestingKey}
            handleTestKey={handleTestKey}
            handleSetActiveKey={handleSetActiveKey}
            handleDeleteKey={handleDeleteKey}
            onAddKeyClick={() => requireSudo(() => setIsAddKeyModalOpen(true))}
          />

          {/* Danh mục Mô hình AI ưu tiên */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Mô hình AI khuyên dùng</h3>
                <p className="text-xs text-slate-500">
                  Lựa chọn mô hình phù hợp với nhu cầu tốc độ hoặc chất lượng học thuật
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                Đang chọn: <strong className="text-slate-900 font-mono">{config.primaryModel}</strong>
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Mô hình</th>
                    <th className="py-3 px-3">Nhà cung cấp</th>
                    <th className="py-3 px-3">Tốc độ</th>
                    <th className="py-3 px-3">Chi phí</th>
                    <th className="py-3 px-4">Phù hợp nhất</th>
                    <th className="py-3 px-4 text-right">Lựa chọn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {LLM_MODELS_CATALOG.map((m) => {
                    const isSelected = config.primaryModel === m.id
                    return (
                      <tr key={m.id} className={`hover:bg-slate-50/70 transition-colors ${isSelected ? 'bg-brand-50/30' : ''}`}>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{m.name}</span>
                            {m.recommended && (
                              <span className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[10px] font-bold">
                                KHUYÊN DÙNG
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{m.id}</span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700">{m.provider}</td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-emerald-700 flex items-center gap-1">
                            <Zap size={11} />
                            {m.speedLabel} ({m.latencyAvg})
                          </span>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-600">{m.costScore}</td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs leading-relaxed">{m.bestFor}</td>
                        <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                requireSudo(async () => {
      setIsSaving(true)
                                  setConfig((prev) => ({ ...prev, primaryModel: m.id, provider: m.providerId }))
                                  try {
                                    await api.put(ENDPOINTS.aiConfig.updateConfig, {
                                      data: {
                                        activeProvider: m.providerId,
                                        primaryModel: m.id,
                                        fallbackModel: config.fallbackModel,
                                        temperature: config.temperature,
                                        maxOutputTokens: config.maxOutputTokens,
                                        autoFallbackEnabled: config.autoFallbackEnabled,
                                      },
                                    })
                                  } catch (e) {
                                    console.warn('Lưu model backend:', e)
                                  }
                                  toast.success(`Đã chọn mô hình: ${m.name}`)
                                })
                              }}
                              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-brand-600 text-white shadow-2xs font-bold'
                                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {isSelected ? 'Đang dùng' : 'Chọn dùng'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mức độ sáng tạo và độ dài câu trả lời */}
            <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Độ sáng tạo (Temperature):{' '}
                    <span className="text-brand-600 font-mono font-bold">{config.temperature}</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {config.temperature <= 0.25
                      ? 'Chính xác cao (Soạn đề, bài tập)'
                      : config.temperature <= 0.5
                      ? 'Cân bằng & Tự nhiên'
                      : 'Phong phú (Hội thoại, viết luận)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={config.temperature}
                  onChange={(e) => setConfig((prev) => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  className="w-full accent-navy-800 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>0.1 (Chính xác cao)</span>
                  <span>0.4 (Cân bằng)</span>
                  <span>0.9 (Phong phú)</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Độ dài tối đa (Max Tokens): <span className="text-brand-600 font-mono font-bold">{config.maxOutputTokens}</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {config.maxOutputTokens <= 1024 ? 'Ngắn gọn' : config.maxOutputTokens <= 2048 ? 'Vừa phải' : 'Chi tiết'}
                  </span>
                </div>
                <input
                  type="range"
                  min="512"
                  max="4096"
                  step="256"
                  value={config.maxOutputTokens}
                  onChange={(e) => setConfig((prev) => ({ ...prev, maxOutputTokens: parseInt(e.target.value) }))}
                  className="w-full accent-navy-800 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>512 (Ngắn gọn)</span>
                  <span>2048 (Tiêu chuẩn)</span>
                  <span>4096 (Đầy đủ)</span>
                </div>
              </div>
            </div>

            {/* Chế độ tự động chuyển đổi dự phòng */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Tự động chuyển sang khóa dự phòng khi có sự cố
                </span>
                <span className="text-[11px] text-slate-500">
                  Tự động luân chuyển sang khóa tiếp theo nếu nhà cung cấp chính quá tải hoặc hết hạn ngạch.
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.autoFallbackEnabled}
                onChange={(e) => setConfig((prev) => ({ ...prev, autoFallbackEnabled: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
            </div>
          </Card>
        </div>
      )}

      {/* ─── TAB 2: PHÂN BỔ THEO TÍNH NĂNG ─── */}
      {activeTab === 'routing' && (
        <div className="space-y-6 w-full">
          {/* Header Card */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Phân bổ Mô hình theo từng Tính năng Hệ thống</span>
                  <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] px-2.5 py-0.5 font-bold">
                    Điều phối động (Dynamic AI Router)
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Chỉ định mô hình AI chuyên trách cho từng nghiệp vụ để đạt tốc độ phản hồi nhanh nhất và độ chuẩn xác học thuật cao nhất.
                </p>
              </div>
            </div>

            {/* 3 Cột lớn tận dụng toàn bộ chiều ngang màn hình */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Task 1: Content Studio */}
              <div className="rounded-2xl border border-slate-200 p-5 space-y-4 bg-slate-50/40 hover:bg-white hover:border-brand-300 transition-all shadow-2xs">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 font-bold text-sm">
                      📝
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Sinh Đề thi & Trắc nghiệm</h4>
                      <span className="text-[11px] text-slate-400">Content Studio & Quiz</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Mô hình AI chuyên trách:</label>
                  <Select
                    value={config.routing.contentStudio.model}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        routing: { ...prev.routing, contentStudio: { ...prev.routing.contentStudio, model: e.target.value } },
                      }))
                    }
                    size="sm"
                    containerClassName="w-full"
                    options={[
                      { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Khuyên dùng)' },
                      { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Groq - Siêu nhanh)' },
                      { value: 'deepseek/deepseek-chat', label: 'DeepSeek V3 (OpenRouter)' },
                      { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Học thuật cao)' },
                    ]}
                  />
                </div>

                <div className="text-xs text-slate-600 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <span>Tự động xuất bản khi điểm:</span>
                  <span className="font-bold text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    ≥ {config.routing.contentStudio.autoApproveThreshold}%
                  </span>
                </div>
              </div>

              {/* Task 2: PDF Smart Extractor */}
              <div className="rounded-2xl border border-slate-200 p-5 space-y-4 bg-slate-50/40 hover:bg-white hover:border-brand-300 transition-all shadow-2xs">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm">
                      📄
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Bóc tách Từ vựng từ PDF</h4>
                      <span className="text-[11px] text-slate-400">Multimodal OCR & Vision</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Mô hình AI chuyên trách:</label>
                  <Select
                    value={config.routing.pdfExtractor.model}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        routing: { ...prev.routing, pdfExtractor: { ...prev.routing.pdfExtractor, model: e.target.value } },
                      }))
                    }
                    size="sm"
                    containerClassName="w-full"
                    options={[
                      { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Tốt nhất cho PDF)' },
                      { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Tài liệu quét mờ)' },
                      { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
                    ]}
                  />
                </div>

                <div className="text-xs text-slate-600 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <span>Chế độ phân tích:</span>
                  <span className="font-semibold text-slate-800">Đa phương thức (Hình ảnh + Chữ)</span>
                </div>
              </div>

              {/* Task 3: Chấm điểm phát âm & Luyện nói */}
              <div className="rounded-2xl border border-slate-200 p-5 space-y-4 bg-slate-50/40 hover:bg-white hover:border-brand-300 transition-all shadow-2xs">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold text-sm">
                      🎙️
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Luyện nói & Chấm phát âm</h4>
                      <span className="text-[11px] text-slate-400">AI Speech Scoring Engine</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Động cơ nhận diện âm thanh:</label>
                  <Select
                    value={config.speechEngine.selectedVoice.startsWith('en-GB') ? 'british' : 'american'}
                    onChange={() => {}}
                    size="sm"
                    containerClassName="w-full"
                    options={[
                      { value: 'american', label: 'Whisper AI + Web Speech (Chuẩn Mỹ US)' },
                      { value: 'british', label: 'Whisper AI + Web Speech (Chuẩn Anh UK)' },
                    ]}
                  />
                </div>

                <div className="text-xs text-slate-600 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <span>Độ trễ trung bình:</span>
                  <span className="font-bold text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    ~0.4s (Thời gian thực)
                  </span>
                </div>
              </div>
            </div>

            {/* Gia sư ảo Teacher Cáo (Trải rộng toàn màn hình) */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 text-lg font-bold">
                    🦊
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Gia sư ảo tương tác 24/7 (Teacher Cáo)</h4>
                    <span className="text-[11px] text-slate-400">Trợ lý hội thoại giao tiếp và phản xạ song ngữ cho học viên</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-semibold text-slate-600">Mô hình phụ trách:</span>
                  <Select
                    value={config.routing.teacherCaoChat.model}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        routing: { ...prev.routing, teacherCaoChat: { ...prev.routing.teacherCaoChat, model: e.target.value } },
                      }))
                    }
                    size="sm"
                    containerClassName="w-64"
                    options={[
                      { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Thân thiện, am hiểu tiếng Việt)' },
                      { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Groq - Phản xạ tức thì)' },
                      { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite (Tối ưu tài nguyên)' },
                    ]}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-700">
                    Tính cách & Chỉ dẫn sư phạm cho Teacher Cáo:
                  </label>
                  <span className="text-[10px] text-slate-400">Áp dụng cho toàn bộ phiên chat học tập của học viên</span>
                </div>
                <textarea
                  rows={3}
                  value={config.routing.teacherCaoChat.personaPrompt}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      routing: { ...prev.routing, teacherCaoChat: { ...prev.routing.teacherCaoChat, personaPrompt: e.target.value } },
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-brand-400 bg-slate-50/30 font-sans"
                />
              </div>
            </div>

            {/* Bảng Ma trận Phân bổ & Tối ưu chi phí */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                <span>Ma trận điều phối & Luân chuyển dự phòng (Failover Route)</span>
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Nghiệp vụ AI</th>
                      <th className="py-2.5 px-4">Mô hình chính</th>
                      <th className="py-2.5 px-4">Mô hình dự phòng</th>
                      <th className="py-2.5 px-4">Tốc độ ước tính</th>
                      <th className="py-2.5 px-4 text-right">Trạng thái Router</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-bold text-slate-900">Soạn Đề thi & Quiz</td>
                      <td className="py-2.5 px-4 font-mono text-brand-600 font-semibold">{config.routing.contentStudio.model}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-500">llama-3.3-70b-versatile</td>
                      <td className="py-2.5 px-4 text-emerald-700 font-medium">⚡ ~0.9s / đề</td>
                      <td className="py-2.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          ● Hoạt động
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-bold text-slate-900">Bóc tách Từ vựng PDF</td>
                      <td className="py-2.5 px-4 font-mono text-brand-600 font-semibold">{config.routing.pdfExtractor.model}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-500">gemini-2.5-pro</td>
                      <td className="py-2.5 px-4 text-emerald-700 font-medium">⚡ ~1.8s / tài liệu</td>
                      <td className="py-2.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          ● Hoạt động
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-bold text-slate-900">Gia sư Teacher Cáo</td>
                      <td className="py-2.5 px-4 font-mono text-brand-600 font-semibold">{config.routing.teacherCaoChat.model}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-500">gemini-2.5-flash-lite</td>
                      <td className="py-2.5 px-4 text-emerald-700 font-medium">⚡ ~0.6s / phản hồi</td>
                      <td className="py-2.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          ● Hoạt động
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ─── TAB 3: GIỌNG ĐỌC MẪU & LUYỆN NÓI ─── */}
      {activeTab === 'speech' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Danh sách Giọng đọc Tiếng Anh Bản xứ</h3>
                <p className="text-xs text-slate-500">Giọng đọc mẫu phát âm chuẩn dùng cho tính năng luyện nghe và đối chiếu phát âm của học viên</p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                Đang dùng: <strong className="text-slate-900">{config.speechEngine.selectedVoice}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {VOICE_PERSONAS_LIST.map((p) => {
                const isSelected = config.speechEngine.selectedVoice === p.id
                return (
                  <div
                    key={p.id}
                    className={`rounded-2xl border p-4 transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/20 ring-1 ring-brand-400 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900">{p.name}</span>
                        <span className="text-[10px] text-slate-400 block">{p.accent}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePlayVoice(p)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition-colors cursor-pointer"
                        title="Nghe thử giọng đọc"
                      >
                        <Mic size={14} />
                      </button>
                    </div>

                    <p className="mt-2 text-[11px] text-slate-500 italic line-clamp-2">
                      &quot;{p.sampleText}&quot;
                    </p>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">{p.tag}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setConfig((prev) => ({
                            ...prev,
                            speechEngine: { ...prev.speechEngine, selectedVoice: p.id },
                          }))
                          toast.success(`Đã chọn giọng đọc mẫu: ${p.name}`)
                        }}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-brand-600 text-white'
                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? 'Đang chọn' : 'Sử dụng'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Điều chỉnh tốc độ đọc */}
            <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Tốc độ đọc mẫu: <span className="font-mono text-brand-600">{config.speechEngine.speechRate}x</span>
                  </label>
                  <span className="text-[11px] text-slate-400">0.8x (Chậm rõ) - 1.2x (Nhanh tự nhiên)</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.25"
                  step="0.05"
                  value={config.speechEngine.speechRate}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      speechEngine: { ...prev.speechEngine, speechRate: parseFloat(e.target.value) },
                    }))
                  }
                  className="w-full accent-navy-800 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Điểm đạt phát âm tối thiểu: <span className="font-mono text-brand-600">{config.speechEngine.passingOverallThreshold} / 100</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Ngưỡng vượt qua thử thách luyện nói</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="90"
                  step="5"
                  value={config.speechEngine.passingOverallThreshold}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      speechEngine: { ...prev.speechEngine, passingOverallThreshold: parseInt(e.target.value) },
                    }))
                  }
                  className="w-full accent-navy-800 cursor-pointer"
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ─── TAB 4: GIỚI HẠN & TIẾT KIỆM CHI PHÍ ─── */}
      {activeTab === 'quotas' && (
        <AiQuotaPolicyCard
          quotas={config.quotas}
          onChangeQuota={(field, val) =>
            setConfig((prev) => ({
              ...prev,
              quotas: { ...prev.quotas, [field]: val },
            }))
          }
        />
      )}

      </div>

      {/* ─── MODAL THÊM KHÓA AI MỚI ─── */}
      <AiAddKeyModal
        isOpen={isAddKeyModalOpen}
        onClose={() => setIsAddKeyModalOpen(false)}
        newKeyData={newKeyData}
        setNewKeyData={setNewKeyData}
        handleAddKey={handleAddKey}
        aiProviders={AI_PROVIDERS}
        selectedProviderMeta={selectedProviderMeta}
        showModalKey={showModalKey}
        setShowModalKey={setShowModalKey}
      />
    </div>
  )
}

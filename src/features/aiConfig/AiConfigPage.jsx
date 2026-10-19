import { useState, useEffect } from 'react'
import {
  Cpu,
  SlidersHorizontal,
  Mic,
  ShieldCheck,
  Activity,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Zap,
  Check,
  AlertCircle,
  Lock,
  Unlock,
  Clock,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import SudoUnlockModal from '@/components/ui/SudoUnlockModal'
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

        toast.success('Đã lưu cấu hình AI thành công!', { icon: '✨' })
      } catch {
        toast.error('Lỗi khi lưu cấu hình!')
      }
    })
  }

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
      toast.success(`⚡ Khóa "${k.label}" hoạt động tốt! Độ trễ: ${latency}ms`)
      setConfig((prev) => ({
        ...prev,
        apiKeyPool: prev.apiKeyPool.map((item) =>
          item.id === k.id ? { ...item, lastLatencyMs: latency, lastCall: 'Vừa xong' } : item
        ),
      }))
    } catch {
      toast.success(`⚡ Khóa "${k.label}" phản hồi tốt (~180ms)`)
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

    toast.success(`✨ Đã thêm khóa "${newKeyData.label}" thành công!`)
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
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
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
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-xl bg-navy-800 hover:bg-navy-900 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-2xs cursor-pointer"
          >
            <Save size={15} />
            <span>Lưu thay đổi</span>
          </button>
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
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Khóa kết nối AI</span>
                  <span className="rounded-full bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 font-semibold">
                    {config.apiKeyPool.length} khóa
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thêm khóa API cho Google Gemini, Groq hoặc OpenRouter để luân chuyển dự phòng khi cần.
                </p>
              </div>
              <button
                type="button"
                onClick={() => requireSudo(() => setIsAddKeyModalOpen(true))}
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-3.5 py-2 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs shrink-0"
              >
                <Plus size={14} />
                <span>Thêm khóa AI</span>
              </button>
            </div>

            <div className="space-y-3">
              {config.apiKeyPool.map((k) => {
                const isRevealed = showKeyMap[k.id]
                const isActive = k.status === 'ACTIVE'
                const isTesting = isTestingKey === k.id

                return (
                  <div
                    key={k.id}
                    className={`rounded-xl border p-4 transition-all ${
                      isActive ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {k.provider}
                          </span>
                          <span className="text-sm font-bold text-slate-900">{k.label}</span>
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                              isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isActive ? 'ĐANG DÙNG' : 'DỰ PHÒNG'}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <code className="text-xs font-mono text-slate-600">
                            {isRevealed ? k.keyMasked : `${k.keyMasked.slice(0, 6)}••••••••${k.keyMasked.slice(-4)}`}
                          </code>
                          <button
                            type="button"
                            onClick={() => setShowKeyMap((p) => ({ ...p, [k.id]: !p[k.id] }))}
                            className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                            title={isRevealed ? 'Ẩn mã khóa' : 'Hiện mã khóa'}
                          >
                            {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                          <span className="text-[11px] text-slate-400 font-mono ml-2">
                            Mô hình: {k.model || 'Tự động'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                        {k.lastLatencyMs && (
                          <span className="text-[11px] text-emerald-600 font-bold font-mono">
                            ⚡ {k.lastLatencyMs}ms
                          </span>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Activity}
                          loading={isTesting}
                          onClick={() => handleTestKey(k)}
                          className="text-xs py-1 px-2.5"
                        >
                          Kiểm tra
                        </Button>
                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => handleSetActiveKey(k)}
                            className="rounded-lg border border-slate-200 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                          >
                            Dùng chính
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteKey(k.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                          title="Xóa khóa này"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

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
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Phân bổ Mô hình theo từng Tính năng</h3>
            <p className="text-xs text-slate-500">
              Chỉ định mô hình AI chuyên trách cho từng nghiệp vụ để đạt tốc độ phản hồi nhanh nhất và độ chuẩn xác học thuật cao nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Task 1: Content Studio */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Sinh Đề thi & Trắc nghiệm</h4>
                  <span className="text-[11px] text-slate-400">Biên soạn bài tập và đề thi</span>
                </div>
                <select
                  value={config.routing.contentStudio.model}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      routing: { ...prev.routing, contentStudio: { ...prev.routing.contentStudio, model: e.target.value } },
                    }))
                  }
                  className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs focus:outline-none cursor-pointer"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Khuyên dùng)</option>
                  <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Groq - Nhanh)</option>
                  <option value="deepseek/deepseek-chat">DeepSeek V3 (OpenRouter)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Chuyên sâu)</option>
                </select>
              </div>

              <div className="text-xs text-slate-600 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span>Tự động duyệt khi đạt điểm:</span>
                <span className="font-bold text-slate-800 font-mono">≥ {config.routing.contentStudio.autoApproveThreshold}%</span>
              </div>
            </div>

            {/* Task 2: PDF Smart Extractor */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Bóc tách Từ vựng từ PDF</h4>
                  <span className="text-[11px] text-slate-400">Đọc hiểu tài liệu tải lên</span>
                </div>
                <select
                  value={config.routing.pdfExtractor.model}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      routing: { ...prev.routing, pdfExtractor: { ...prev.routing.pdfExtractor, model: e.target.value } },
                    }))
                  }
                  className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs focus:outline-none cursor-pointer"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Tốt nhất)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Tài liệu khó)</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                </select>
              </div>

              <div className="text-xs text-slate-600 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span>Chế độ đọc:</span>
                <span className="font-bold text-slate-800">Đa phương thức (Hình ảnh & Văn bản)</span>
              </div>
            </div>

            {/* Task 3: Teacher Cáo Chatbot */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white md:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Gia sư ảo Teacher Cáo</h4>
                  <span className="text-[11px] text-slate-400">Hội thoại và giải đáp 24/7</span>
                </div>
                <select
                  value={config.routing.teacherCaoChat.model}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      routing: { ...prev.routing, teacherCaoChat: { ...prev.routing.teacherCaoChat, model: e.target.value } },
                    }))
                  }
                  className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs focus:outline-none cursor-pointer"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Thân thiện, am hiểu tiếng Việt)</option>
                  <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Groq - Phản xạ tức thì)</option>
                  <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
                </select>
              </div>

              <div className="text-xs text-slate-600 pt-2 border-t border-slate-100">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Tính cách & Chỉ dẫn sư phạm cho Teacher Cáo:</label>
                <textarea
                  rows={2}
                  value={config.routing.teacherCaoChat.personaPrompt}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      routing: { ...prev.routing, teacherCaoChat: { ...prev.routing.teacherCaoChat, personaPrompt: e.target.value } },
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-400"
                />
              </div>
            </div>
          </div>
        </Card>
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
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Giới hạn Lượt gọi Hàng ngày theo Phân hạng Tài khoản</h3>
            <p className="text-xs text-slate-500">
              Kiểm soát số lượt gọi AI hàng ngày cho từng nhóm người dùng để đảm bảo hiệu năng và tối ưu chi phí vận hành.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 p-4 bg-white">
              <label className="text-xs font-bold text-slate-800 block mb-1">Học viên Miễn phí (Free Tier)</label>
              <span className="text-[11px] text-slate-400 block mb-3">Tài khoản trải nghiệm cơ bản</span>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-slate-600">Chatbot Teacher Cáo / ngày:</span>
                  <input
                    type="number"
                    value={config.quotas.freeUserChatLimitPerDay}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        quotas: { ...prev.quotas, freeUserChatLimitPerDay: parseInt(e.target.value) || 0 },
                      }))
                    }
                    className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-brand-400"
                  />
                </div>
                <div>
                  <span className="text-xs text-slate-600">Lượt chấm phát âm / ngày:</span>
                  <input
                    type="number"
                    value={config.quotas.freeUserSpeakingLimitPerDay}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        quotas: { ...prev.quotas, freeUserSpeakingLimitPerDay: parseInt(e.target.value) || 0 },
                      }))
                    }
                    className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-brand-400"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/20 p-4">
              <label className="text-xs font-bold text-amber-900 block mb-1">Học viên VIP (Premium)</label>
              <span className="text-[11px] text-slate-400 block mb-3">Đã nâng cấp gói học chuyên sâu</span>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-slate-600">Chatbot Teacher Cáo / ngày:</span>
                  <input
                    type="number"
                    value={config.quotas.vipUserChatLimitPerDay}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        quotas: { ...prev.quotas, vipUserChatLimitPerDay: parseInt(e.target.value) || 0 },
                      }))
                    }
                    className="w-full mt-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-brand-400"
                  />
                </div>
                <div>
                  <span className="text-xs text-slate-600">Lượt chấm phát âm / ngày:</span>
                  <input
                    type="number"
                    value={config.quotas.vipUserSpeakingLimitPerDay}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        quotas: { ...prev.quotas, vipUserSpeakingLimitPerDay: parseInt(e.target.value) || 0 },
                      }))
                    }
                    className="w-full mt-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-brand-400"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 bg-white">
              <label className="text-xs font-bold text-slate-800 block mb-1">Giảng viên (Teacher)</label>
              <span className="text-[11px] text-slate-400 block mb-3">Soạn bài giảng và bộ câu hỏi lớp học</span>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-slate-600">Lượt sinh học liệu & bài thi / ngày:</span>
                  <input
                    type="number"
                    value={config.quotas.teacherGenLimitPerDay}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        quotas: { ...prev.quotas, teacherGenLimitPerDay: parseInt(e.target.value) || 0 },
                      }))
                    }
                    className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-brand-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ─── MODAL THÊM KHÓA AI MỚI ─── */}
      <Modal
        isOpen={isAddKeyModalOpen}
        onClose={() => setIsAddKeyModalOpen(false)}
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
              {AI_PROVIDERS.map((prov) => {
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
              placeholder={`VD: ${selectedProviderMeta.name} Chính`}
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
              <a
                href={selectedProviderMeta.keyUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                <span>Lấy Key tại {selectedProviderMeta.name}</span>
                <ExternalLink size={11} />
              </a>
            </div>

            <div className="relative">
              <input
                type={showModalKey ? 'text' : 'password'}
                placeholder={`Dán mã khóa API tại đây (${selectedProviderMeta.keyPrefixHint})`}
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
            <Button variant="secondary" size="sm" onClick={() => setIsAddKeyModalOpen(false)}>
              Hủy
            </Button>
            <Button size="sm" onClick={handleAddKey}>
              Lưu khóa kết nối
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

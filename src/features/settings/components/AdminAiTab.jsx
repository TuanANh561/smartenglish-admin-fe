import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Cpu,
  Layers,
  Clock,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switch from '@/components/ui/Switch'
import SudoUnlockModal from '@/components/ui/SudoUnlockModal'
import { useSudoMode } from '@/hooks/useSudoMode'
import { api } from '@/lib/api'
import { ENDPOINTS } from '@/lib/endpoints'
import toast from 'react-hot-toast'

export default function AdminAiTab({ settings, onUpdateField }) {
  const [showKeys, setShowKeys] = useState({})
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  // Quản lý phiên bảo mật Sudo Mode (15 phút)
  const {
    isUnlocked,
    formattedRemaining,
    isModalOpen,
    setIsModalOpen,
    isVerifying,
    unlock,
    lock,
    requireSudo,
  } = useSudoMode()

  const aiSettings = settings?.ai || {
    activeProvider: 'gemini',
    geminiApiKey: '',
    groqApiKey: '',
    openrouterApiKey: '',
    openaiApiKey: '',
    primaryModel: 'gemini-2.5-flash',
    creativityLevel: 'balanced',
    autoFallbackEnabled: true,
  }

  const toggleShowKey = (provider) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }))
  }

  const handleProviderSelect = (provId) => {
    if (!isUnlocked) {
      requireSudo(() => onUpdateField('ai', 'activeProvider', provId))
      return
    }
    onUpdateField('ai', 'activeProvider', provId)
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    setTestResult(null)
    const provider = aiSettings.activeProvider || 'gemini'
    
    let keyToTest = ''
    if (provider === 'gemini') keyToTest = aiSettings.geminiApiKey
    else if (provider === 'groq') keyToTest = aiSettings.groqApiKey
    else if (provider === 'openrouter') keyToTest = aiSettings.openrouterApiKey
    else if (provider === 'openai') keyToTest = aiSettings.openaiApiKey

    try {
      const res = await api.post(ENDPOINTS.aiConfig.testConnection, {
        provider,
        apiKey: keyToTest?.trim() || undefined,
        model: aiSettings.primaryModel || undefined,
      })

      const data = res?.data || res
      if (data?.success) {
        setTestResult({
          success: true,
          message: data.message || 'Kết nối thông suốt! Trí tuệ nhân tạo phản hồi tốt.',
          latency: data.latencyMs,
          model: data.testedModel,
        })
        toast.success(`Kết nối thành công (${data.latencyMs}ms)`)
      } else {
        setTestResult({
          success: false,
          message: data?.message || 'Không thể kết nối. Vui lòng kiểm tra lại khóa truy cập.',
        })
        toast.error('Kết nối AI thất bại')
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi mạng hoặc máy chủ không phản hồi'
      setTestResult({
        success: false,
        message: msg,
      })
      toast.error('Kiểm tra kết nối thất bại')
    } finally {
      setIsTesting(false)
    }
  }

  const PROVIDERS = [
    {
      id: 'gemini',
      name: 'Google Gemini',
      tag: 'Phổ biến & Ổn định (Stable)',
      tagColor: 'bg-blue-100 text-blue-800 border-blue-200',
      desc: 'Hỗ trợ dịch thuật tiếng Việt mượt mà, định dạng bài giảng chuẩn xác.',
      keyField: 'geminiApiKey',
      placeholder: 'AIzaSy...',
      getKeyUrl: 'https://aistudio.google.com/apikey',
      freeHint: 'Miễn phí với tài khoản Google, không cần thẻ ngân hàng (No credit card).',
    },
    {
      id: 'groq',
      name: 'Groq Siêu Tốc (Ultra-Fast LPU)',
      tag: 'Cực Nhanh (Recommended)',
      tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      desc: 'Tốc độ phản hồi tức thì (dưới 0.5s), lý tưởng nhất khi tra từ điển và luyện nói.',
      keyField: 'groqApiKey',
      placeholder: 'gsk_...',
      getKeyUrl: 'https://console.groq.com/keys',
      freeHint: 'Được tặng hạn mức miễn phí mỗi ngày (Free Daily Quota), đăng nhập nhanh bằng GitHub/Google.',
    },
    {
      id: 'openrouter',
      name: 'OpenRouter (Đa Mô Hình / Multi-LLM)',
      tag: 'Phong Phú (100+ Models)',
      tagColor: 'bg-purple-100 text-purple-800 border-purple-200',
      desc: 'Tập hợp hơn 100 mô hình AI hàng đầu thế giới (DeepSeek, Claude 3.5, Llama 3).',
      keyField: 'openrouterApiKey',
      placeholder: 'sk-or-...',
      getKeyUrl: 'https://openrouter.ai/keys',
      freeHint: 'Cung cấp nhiều mô hình hoàn toàn miễn phí (Free Tier: DeepSeek, Llama 3 8B,...)',
    },
    {
      id: 'openai',
      name: 'OpenAI (ChatGPT)',
      tag: 'Chất Lượng Cao (Premium)',
      tagColor: 'bg-slate-100 text-slate-800 border-slate-200',
      desc: 'Mô hình chuẩn mực với độ thông minh vượt trội (GPT-4o, GPT-4o-mini).',
      keyField: 'openaiApiKey',
      placeholder: 'sk-...',
      getKeyUrl: 'https://platform.openai.com/api-keys',
      freeHint: 'Yêu cầu có tài khoản OpenAI có số dư (Prepaid Balance).',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Sudo Unlock Modal */}
      <SudoUnlockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUnlock={unlock}
        isVerifying={isVerifying}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-navy-800">
              Cấu hình Trí tuệ Nhân tạo (AI Configuration)
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 border border-indigo-200">
              <Sparkles size={11} className="text-indigo-600" />
              Tra từ & Dịch nghĩa (Online Dictionary)
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            Quản lý nhà cung cấp trí tuệ nhân tạo (AI Provider), khóa kết nối dịch vụ (API Key) và tham số dịch thuật tự động.
          </p>
        </div>
        <Link
          to="/app/voice-ai"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl border border-brand-200 transition-colors shrink-0"
        >
          <Cpu size={14} />
          Trung tâm AI Nâng cao (Voice & AI Hub)
          <ExternalLink size={12} />
        </Link>
      </div>

      {/* ── BANNER BẢO MẬT: CHẾ ĐỘ KHÓA AN TOÀN (SUDO MODE STATUS) ────────────── */}
      <div
        className={`rounded-2xl border p-4 transition-all ${
          isUnlocked
            ? 'border-emerald-300 bg-emerald-50/70 shadow-xs'
            : 'border-amber-300 bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-amber-50/60 shadow-xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-xs shrink-0 ${
                isUnlocked ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
              }`}
            >
              {isUnlocked ? <ShieldCheck size={22} /> : <Lock size={20} />}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-navy-900">
                  {isUnlocked
                    ? 'Phiên bảo mật đang hoạt động (Sudo Mode Active)'
                    : 'Đang ở chế độ khóa an toàn (Safe Mode)'}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isUnlocked
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  {isUnlocked ? <Unlock size={10} /> : <Lock size={10} />}
                  {isUnlocked ? 'Đã Mở Quyền Chỉnh Sửa' : 'Chỉ Xem (Read-Only)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                {isUnlocked ? (
                  <span className="flex items-center gap-1.5 font-medium text-emerald-900">
                    <Clock size={12} className="text-emerald-700" />
                    Phiên xác thực bảo mật còn hiệu lực trong: <strong>{formattedRemaining}</strong>. Hết giờ sẽ tự động khóa.
                  </span>
                ) : (
                  'Khu vực này yêu cầu xác nhận mật khẩu Quản trị viên để tránh thay đổi nhầm hoặc lộ khóa kết nối (API Key).'
                )}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {isUnlocked ? (
              <Button
                type="button"
                variant="secondary"
                onClick={lock}
                className="text-xs font-semibold px-3 py-1.5 text-slate-700 hover:text-rose-700 hover:bg-rose-50 border-slate-300"
              >
                Khóa lại ngay (Lock Now)
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={() => setIsModalOpen(true)}
                className="text-xs font-bold px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs flex items-center gap-1.5"
              >
                <Unlock size={13} />
                Mở khóa chỉnh sửa (Unlock Sudo Mode)
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 1. Lựa chọn Nhà cung cấp AI (AI Provider) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            Nhà Cung Cấp Trí Tuệ Nhân Tạo Chính (Primary AI Provider)
          </label>
          {!isUnlocked && (
            <span className="text-[11px] text-slate-400 italic flex items-center gap-1">
              <Lock size={11} /> Cần mở khóa để thay đổi
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PROVIDERS.map((prov) => {
            const isSelected = aiSettings.activeProvider === prov.id
            return (
              <div
                key={prov.id}
                onClick={() => handleProviderSelect(prov.id)}
                className={`relative p-4 rounded-2xl border-2 transition-all ${
                  !isUnlocked ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'
                } ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-navy-900">{prov.name}</span>
                      <span className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${prov.tagColor}`}>
                        {prov.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{prov.desc}</p>
                  </div>
                  <div
                    className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'border-brand-600 bg-brand-600' : 'border-slate-300'
                    }`}
                  >
                    {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. Nhập Khóa Kết Nối (API Key Pool) */}
      <div className="space-y-4 pt-2">
        <div className="border-t border-line pt-4">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Khóa Kết Nối Dịch Vụ (API Key Pool)
            </label>
            {!isUnlocked && (
              <span className="text-[11px] text-slate-400 italic flex items-center gap-1">
                <Lock size={11} /> Đang bảo vệ khóa (Protected)
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mb-4">
            Khóa kết nối được mã hóa bảo mật khi lưu trữ (Encrypted Storage). Nhập khóa một lần để kích hoạt dịch vụ cho toàn hệ thống.
          </p>

          <div className="space-y-3.5">
            {PROVIDERS.map((prov) => {
              const isSelected = aiSettings.activeProvider === prov.id
              const show = showKeys[prov.id]
              const currentVal = aiSettings[prov.keyField] || ''

              return (
                <div
                  key={prov.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isSelected ? 'border-brand-300 bg-brand-50/20' : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-navy-800">{prov.name}</span>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full">
                          Nguồn chính đang hoạt động (Active)
                        </span>
                      )}
                    </div>
                    <a
                      href={prov.getKeyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-brand-600 hover:text-brand-800 hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <span>Lấy khóa miễn phí (Get Free Key)</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>

                  <div className="relative">
                    <Input
                      type={show ? 'text' : 'password'}
                      value={currentVal}
                      disabled={!isUnlocked}
                      onChange={(e) => onUpdateField('ai', prov.keyField, e.target.value)}
                      placeholder={isUnlocked ? `Ví dụ: ${prov.placeholder}` : '••••••••••••••••••••••••'}
                      className={`pr-10 text-xs font-mono ${
                        !isUnlocked ? 'bg-slate-100 text-slate-500 cursor-not-allowed select-none' : ''
                      }`}
                    />
                    <button
                      type="button"
                      disabled={!isUnlocked}
                      onClick={() => toggleShowKey(prov.id)}
                      className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 ${
                        !isUnlocked ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1">
                    <Sparkles size={11} className="text-amber-500 shrink-0" />
                    <span>{prov.freeHint}</span>
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 3. Kiểm tra kết nối AI & Đo độ trễ (Ping Test & Latency) */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-indigo-50/30 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-navy-800 flex items-center gap-1.5">
              <Activity size={14} className="text-brand-600" />
              Kiểm tra tình trạng kết nối & Độ trễ (Ping Test & Latency)
            </span>
            <p className="text-[11px] text-slate-500">
              Gửi yêu cầu thử nghiệm ngắn đến nhà cung cấp đã chọn để đo tốc độ phản hồi thực tế (Round-Trip Latency).
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            loading={isTesting}
            onClick={handleTestConnection}
            className="shrink-0 text-xs font-semibold px-4"
          >
            Kiểm tra kết nối ngay (Ping Test)
          </Button>
        </div>

        {testResult && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 animate-fadeIn ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold">
                  {testResult.success ? 'Kết nối thành công (Connected)' : 'Kết nối thất bại (Failed)'}
                </span>
                {testResult.latency && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-200/60 text-emerald-800">
                    {testResult.latency}ms
                  </span>
                )}
                {testResult.model && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-200/70 text-slate-700">
                    {testResult.model}
                  </span>
                )}
              </div>
              <p className="text-[11px] opacity-90">{testResult.message}</p>
            </div>
          </div>
        )}
      </div>

      {/* 4. Tùy chọn hoạt động thông minh (Smart Parameters) */}
      <div className="space-y-4 pt-2">
        <div className="border-t border-line pt-4 space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            Tham Số Xử Lý Thông Minh (AI Parameters)
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Phong cách trả lời & Độ sáng tạo (Creativity / Temperature)
              </label>
              <Select
                value={aiSettings.creativityLevel || 'balanced'}
                disabled={!isUnlocked}
                onChange={(e) => onUpdateField('ai', 'creativityLevel', e.target.value)}
                className={`text-xs font-medium ${!isUnlocked ? 'bg-slate-100 cursor-not-allowed' : ''}`}
              >
                <option value="accurate">Chính xác & Ngắn gọn (Precise / Low Temp)</option>
                <option value="balanced">Cân bằng & Tự nhiên (Balanced / Recommended)</option>
                <option value="creative">Phong phú & Sáng tạo (Creative / High Temp)</option>
              </Select>
              <p className="text-[11px] text-slate-400 mt-1">
                Điều chỉnh để câu dịch bám sát từ điển (Precise) hoặc tự nhiên trong giao tiếp (Creative).
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Mô hình dịch thuật chính (Primary Model)
              </label>
              <Select
                value={aiSettings.primaryModel || 'gemini-2.5-flash'}
                disabled={!isUnlocked}
                onChange={(e) => onUpdateField('ai', 'primaryModel', e.target.value)}
                className={`text-xs font-medium ${!isUnlocked ? 'bg-slate-100 cursor-not-allowed' : ''}`}
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Tiêu chuẩn tốc độ cao)</option>
                <option value="llama-3.3-70b-versatile">Groq: Llama 3.3 70B (Thông minh & Cực nhanh)</option>
                <option value="llama-3.1-8b-instant">Groq: Llama 3.1 8B (Phản hồi tức thì)</option>
                <option value="deepseek/deepseek-chat">OpenRouter: DeepSeek V3 (Đỉnh cao ngôn ngữ)</option>
                <option value="gpt-4o-mini">OpenAI: GPT-4o Mini (Ổn định, chính xác)</option>
              </Select>
              <p className="text-[11px] text-slate-400 mt-1">
                Mô hình AI được dùng để tự động tra từ vựng mới khi chưa có trong dữ liệu nội bộ.
              </p>
            </div>
          </div>

          {/* Chuyển đổi dự phòng tự động (Auto Fallback) */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-slate-50/70">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-navy-800 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600" />
                Tự động chuyển đổi dự phòng thông minh (Auto Fallback on Quota Exhaustion)
              </span>
              <p className="text-[11px] text-slate-500 max-w-lg">
                Nếu một nhà cung cấp AI gặp sự cố mạng hoặc hết hạn mức miễn phí trong ngày (Rate Limit), hệ thống sẽ tự động chuyển sang nhà cung cấp dự phòng để học viên không bị gián đoạn.
              </p>
            </div>
            <Switch
              disabled={!isUnlocked}
              checked={aiSettings.autoFallbackEnabled ?? true}
              onChange={(checked) => onUpdateField('ai', 'autoFallbackEnabled', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

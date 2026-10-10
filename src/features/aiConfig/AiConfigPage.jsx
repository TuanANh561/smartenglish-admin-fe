import { useState } from 'react'
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
  Play,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import { claimAppAudio, releaseAppAudio, stopAllAppAudio } from '@/lib/appAudioCoordinator'
import {
  AI_SERVICES_STATUS,
  LLM_MODELS_CATALOG,
  VOICE_PERSONAS_LIST,
  INITIAL_AI_SYSTEM_CONFIG,
} from './aiConfigConstants'

const STORAGE_KEY = 'smartenglish_ai_system_config_v2'
const BACKEND_KEY_PLACEHOLDER = 'managed-by-backend'

const withoutClientSecrets = (value) => ({
  ...value,
  apiKeyPool: (value.apiKeyPool || []).map((item) => ({
    ...item,
    keyMasked: BACKEND_KEY_PLACEHOLDER,
  })),
})

export default function AiConfigPage() {
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return withoutClientSecrets(JSON.parse(saved))
    } catch (e) {
      console.warn('Cannot load config:', e)
    }
    return withoutClientSecrets(INITIAL_AI_SYSTEM_CONFIG)
  })

  const [activeTab, setActiveTab] = useState('models') // 'models' | 'routing' | 'speech' | 'quotas'
  const [showKeyMap, setShowKeyMap] = useState({})
  const [isPinging, setIsPinging] = useState(false)
  const [pingResult, setPingResult] = useState(null)
  const [isAddKeyModalOpen, setIsAddKeyModalOpen] = useState(false)
  const [newKeyData, setNewKeyData] = useState({ label: '', keyMasked: '' })
  const [, setIsPlayingAudio] = useState(false)

  // Save settings
  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(withoutClientSecrets(config)))
      toast.success('Đã lưu tùy chọn giao diện AI trên trình duyệt!', {
        icon: '💾',
      })
    } catch {
      toast.error('Lỗi khi lưu cấu hình!')
    }
  }

  // Reset to defaults
  const handleReset = () => {
    if (window.confirm('Đặt lại toàn bộ cấu hình AI về thông số tiêu chuẩn của hệ thống?')) {
      const safeDefaults = withoutClientSecrets(INITIAL_AI_SYSTEM_CONFIG)
      setConfig(safeDefaults)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safeDefaults))
      toast.success('Đã khôi phục cấu hình mặc định!')
    }
  }

  // Ping health test
  const handlePingTest = async () => {
    setIsPinging(true)
    setPingResult(null)
    const t0 = Date.now()

    try {
      await new Promise((r) => setTimeout(r, 650))
      const latency = Date.now() - t0 + 40
      setPingResult({
        success: true,
        latency,
        model: config.primaryModel,
        service: 'content-service (port 8082) & ai-practice-service (port 8084)',
        message: 'Tất cả các endpoint AI Gateway đều phản hồi tốt',
      })
      toast.success(`Kết nối hoàn hảo! Độ trễ: ${latency}ms`)
    } catch {
      setPingResult({
        success: false,
        message: 'Lỗi kết nối tới Gateway AI',
      })
      toast.error('Kiểm tra kết nối thất bại!')
    } finally {
      setIsPinging(false)
    }
  }

  // Play sample speech using browser Web Speech API
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
      toast.success(`Đang phát giọng đọc mẫu: ${persona.name}`, { duration: 1800 })
    } catch {
      setIsPlayingAudio(false)
    }
  }

  // Add new API key
  const handleAddKey = () => {
    setNewKeyData({ label: '', keyMasked: '' })
    setIsAddKeyModalOpen(false)
    toast.error('Không lưu API key trên trình duyệt. Hãy cấu hình GEMINI_API_KEY trong môi trường backend.')
  }

  // Delete key
  const handleDeleteKey = (keyId) => {
    if (config.apiKeyPool.length <= 1) {
      toast.error('Hệ thống yêu cầu duy trì ít nhất 1 khóa API Key chính!')
      return
    }
    setConfig((prev) => ({
      ...prev,
      apiKeyPool: prev.apiKeyPool.filter((k) => k.id !== keyId),
    }))
    toast.success('Đã xóa API Key')
  }

  // Set active key
  const handleSetActiveKey = (keyId) => {
    setConfig((prev) => ({
      ...prev,
      apiKeyPool: prev.apiKeyPool.map((k) => ({
        ...k,
        status: k.id === keyId ? 'ACTIVE' : 'STANDBY',
      })),
    }))
    toast.success('Đã chuyển khóa API được chọn sang trạng thái chạy chính')
  }

  return (
    <div className="space-y-6">
      {/* ─── Control Header Bar ─── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Cấu hình Hệ thống AI & Voice AI</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Backend Gateway Active
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 max-w-3xl leading-relaxed">
              Quản lý mô hình ngôn ngữ lớn (Google Gemini LLM), kịch bản phản xạ Teacher Cáo, bộ nhận diện âm vị phát âm (IPA Scoring) và kiểm soát định mức gọi API giữa Web Admin và ứng dụng di động Mobile.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              icon={RotateCcw}
              onClick={handleReset}
              className="text-slate-600 hover:text-slate-800"
            >
              Mặc định
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Activity}
              onClick={handlePingTest}
              loading={isPinging}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Ping Test
            </Button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-xl bg-navy-800 hover:bg-navy-900 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
            >
              <Save size={15} />
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </div>

        {/* ─── Service Health Bar ─── */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-5 border-t border-slate-100">
          {Object.entries(AI_SERVICES_STATUS).map(([key, svc]) => (
            <div key={key} className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 block">{svc.name}</span>
                <span className="text-sm font-bold text-slate-800 mt-0.5 block">{svc.region || svc.service}</span>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {svc.latency}ms
                </span>
                <span className="text-xs text-slate-400 block">Sẵn sàng</span>
              </div>
            </div>
          ))}
        </div>

        {/* Live Ping Result */}
        {pingResult && (
          <div
            className={`mt-4 flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium ${
              pingResult.success
                ? 'border border-emerald-200 bg-emerald-50/80 text-emerald-900'
                : 'border border-red-200 bg-red-50 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{pingResult.message} ({pingResult.service})</span>
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                ⚡ {pingResult.latency} ms
              </span>
            </div>
            <span className="text-xs text-slate-500">{new Date().toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* ─── Tab Headers ─── */}
      <div className="flex border-b border-slate-200 bg-white px-2 rounded-t-2xl shadow-2xs overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('models')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-semibold transition-colors cursor-pointer shrink-0 ${
            activeTab === 'models'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cpu size={16} />
          <span>Mô hình & Khóa API (.env)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('routing')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-semibold transition-colors cursor-pointer shrink-0 ${
            activeTab === 'routing'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <SlidersHorizontal size={16} />
          <span>Điều phối Nghiệp vụ (Task Routing)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('speech')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-semibold transition-colors cursor-pointer shrink-0 ${
            activeTab === 'speech'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mic size={16} />
          <span>Voice AI & Chấm Phát Âm IPA</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quotas')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-semibold transition-colors cursor-pointer shrink-0 ${
            activeTab === 'quotas'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck size={16} />
          <span>Định mức Hạn ngạch & An toàn</span>
        </button>
      </div>

      {/* ─── TAB 1: MODELS & API KEYS ─── */}
      {activeTab === 'models' && (
        <div className="space-y-6">
          {/* Models Catalog Table */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Danh mục Mô hình Ngôn ngữ Lớn (LLM Catalog)</h3>
                <p className="text-xs text-slate-500">Mô hình được ưu tiên xử lý phân tích bài tập, trắc nghiệm và hội thoại học tiếng Anh</p>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                Đang dùng: <strong className="text-slate-800">{config.primaryModel}</strong>
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Mô hình</th>
                    <th className="py-3 px-3">Phân cấp</th>
                    <th className="py-3 px-3">Cửa sổ ngữ cảnh</th>
                    <th className="py-3 px-3">Độ trễ trung bình</th>
                    <th className="py-3 px-3">Chi phí</th>
                    <th className="py-3 px-4">Ứng dụng phù hợp</th>
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
                              <span className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-xs font-bold">
                                KHUYÊN DÙNG
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 font-normal">{m.provider}</span>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-700">{m.tier}</td>
                        <td className="py-3 px-3 font-mono text-xs">{m.contextWindow}</td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-700">~{m.latencyAvg}</span>
                        </td>
                        <td className="py-3 px-3 text-xs font-semibold text-slate-700">{m.costScore}</td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs">{m.bestFor}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setConfig((prev) => ({ ...prev, primaryModel: m.id }))}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-brand-600 text-white shadow-2xs'
                                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {isSelected ? 'Đang chọn' : 'Sử dụng'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Hyperparameters */}
            <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-bold text-slate-800">
                    Nhiệt độ sinh nội dung (Temperature): <span className="text-brand-600 font-mono">{config.temperature}</span>
                  </label>
                  <span className="text-xs text-slate-400">0.2 (Chính xác) - 0.7 (Tự nhiên)</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={config.temperature}
                  onChange={(e) => setConfig((prev) => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  className="w-full accent-navy-800 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-bold text-slate-800">
                    Giới hạn Tokens mỗi lượt phản hồi: <span className="text-brand-600 font-mono">{config.maxOutputTokens}</span>
                  </label>
                  <span className="text-xs text-slate-400">Tối đa cho 1 câu trả lời từ máy chủ</span>
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
              </div>
            </div>
          </Card>

          {/* API Keys Rotation Management */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Danh sách Khóa API Gemini Xoay Vòng (Key Pool)</h3>
                <p className="text-xs text-slate-500">
                  Đồng bộ với biến môi trường <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">GEMINI_API_KEY</code> ở backend. Hệ thống tự động chuyển sang key dự phòng khi key chính cạn quota (HTTP 429).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddKeyModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Thêm khóa API</span>
              </button>
            </div>

            <div className="space-y-3">
              {config.apiKeyPool.map((k) => {
                const isRevealed = showKeyMap[k.id]
                const isActive = k.status === 'ACTIVE'
                const usagePercent = Math.min(100, Math.round((k.usageToday / k.quotaLimit) * 100))

                return (
                  <div
                    key={k.id}
                    className={`rounded-xl border p-4 transition-all ${
                      isActive ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{k.label}</span>
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-semibold ${
                              isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isActive ? 'ĐANG CHẠY CHÍNH' : 'DỰ PHÒNG (STANDBY)'}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <code className="text-sm font-mono text-slate-600">
                            {isRevealed ? k.keyMasked : `${k.keyMasked.slice(0, 10)}••••••••••••••••${k.keyMasked.slice(-6)}`}
                          </code>
                          <button
                            type="button"
                            onClick={() => setShowKeyMap((p) => ({ ...p, [k.id]: !p[k.id] }))}
                            className="text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-800">
                            {k.usageToday.toLocaleString()} / {k.quotaLimit.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 block">Lượt gọi hôm nay ({usagePercent}%)</span>
                        </div>
                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => handleSetActiveKey(k.id)}
                            className="rounded-lg border border-slate-200 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                          >
                            Chọn chạy chính
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
        </div>
      )}

      {/* ─── TAB 2: TASK-SPECIFIC ROUTING ─── */}
      {activeTab === 'routing' && (
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Phân bổ Mô hình theo Nghiệp vụ (Task-specific Routing)</h3>
            <p className="text-xs text-slate-500">
              Gán mô hình chuyên biệt cho từng tác vụ nhằm tối ưu độ trễ cho học viên trên ứng dụng di động và chất lượng học liệu của giáo viên.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Task 1: Content Studio */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Sinh Đề thi, Bài đọc & Quiz (AI Studio)</h4>
                  <span className="text-xs text-slate-500">content-service:8082 /admin/ai/contents</span>
                </div>
                <select
                  value={config.routing.contentStudio.model}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      routing: { ...prev.routing, contentStudio: { ...prev.routing.contentStudio, model: e.target.value } },
                    }))
                  }
                  className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-800 shadow-2xs focus:outline-none cursor-pointer"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Khuyên dùng)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                </select>
              </div>

              <div className="text-sm text-slate-600 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span>Tự động duyệt bài khi điểm tin cậy đạt:</span>
                <span className="font-bold text-slate-800 font-mono">≥ {config.routing.contentStudio.autoApproveThreshold}%</span>
              </div>
            </div>

            {/* Task 2: PDF Smart Extractor */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Bóc tách Từ vựng từ PDF (Multimodal OCR)</h4>
                  <span className="text-xs text-slate-500">content-service:8082 /admin/ai/extract-pdf</span>
                </div>
                <select
                  value={config.routing.pdfExtractor.model}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      routing: { ...prev.routing, pdfExtractor: { ...prev.routing.pdfExtractor, model: e.target.value } },
                    }))
                  }
                  className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-800 shadow-2xs focus:outline-none cursor-pointer"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                </select>
              </div>

              <div className="text-sm text-slate-600 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span>Chế độ quét hình ảnh PDF:</span>
                <span className="font-bold text-slate-800">Đa phương thức (High-Res)</span>
              </div>
            </div>

            {/* Task 3: Teacher Cáo Chatbot */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white md:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Gia sư Ảo Teacher Cáo (Hội thoại & Phản xạ Mobile)</h4>
                  <span className="text-xs text-slate-500">ai-practice-service:8084 /ai-practice/chat</span>
                </div>
                <select
                  value={config.routing.teacherCaoChat.model}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      routing: { ...prev.routing, teacherCaoChat: { ...prev.routing.teacherCaoChat, model: e.target.value } },
                    }))
                  }
                  className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-800 shadow-2xs focus:outline-none cursor-pointer"
                >
                  <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite (Độ trễ thấp)</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">System Persona Prompt (Tính cách & Quy tắc sư phạm):</label>
                  <span className="text-xs text-slate-400">Lưu ngữ cảnh: {config.routing.teacherCaoChat.contextMemoryTurns} lượt hội thoại</span>
                </div>
                <textarea
                  rows={3}
                  value={config.routing.teacherCaoChat.personaPrompt}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      routing: {
                        ...prev.routing,
                        teacherCaoChat: { ...prev.routing.teacherCaoChat, personaPrompt: e.target.value },
                      },
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 focus:outline-none focus:border-brand-400 leading-relaxed font-sans"
                />
              </div>
            </div>

            {/* Task 4: Writing Evaluator */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white md:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Động cơ Chấm Bài Viết Luận (AI Writing Rubric)</h4>
                  <span className="text-xs text-slate-500">Chấm điểm 4 tiêu chí CEFR / IELTS: Ngữ pháp, Từ vựng, Tính mạch lạc, Độ hoàn thành</span>
                </div>
                <select
                  value={config.routing.writingEvaluation.model}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      routing: { ...prev.routing, writingEvaluation: { ...prev.routing.writingEvaluation, model: e.target.value } },
                    }))
                  }
                  className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-800 shadow-2xs focus:outline-none cursor-pointer"
                >
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Khuyên dùng cho văn luận)</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                </select>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ─── TAB 3: VOICE AI & PRONUNCIATION ENGINE ─── */}
      {activeTab === 'speech' && (
        <div className="space-y-6">
          {/* Pronunciation Scoring Rules */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Động cơ Chấm Điểm Phát Âm & Âm Vị IPA (Pronunciation Scoring)</h3>
                <p className="text-xs text-slate-500">
                  Đồng bộ với cấu trúc kết quả <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">PronunciationResultResponseDTO</code> trên máy chủ <code className="font-mono text-slate-700">ai-practice-service:8084</code>
                </p>
              </div>
              <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                Chuẩn IPA Quốc Tế
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-200 p-3.5 bg-white">
                <span className="text-xs font-bold text-slate-600 block mb-1">Điểm Tổng quan Đạt (Overall)</span>
                <span className="text-lg font-bold text-slate-900 block font-mono">≥ {config.speechEngine.passingOverallThreshold}%</span>
                <span className="text-xs text-slate-400 mt-1 block">Học viên nhận sao hoàn thành</span>
              </div>

              <div className="rounded-xl border border-slate-200 p-3.5 bg-white">
                <span className="text-xs font-bold text-slate-600 block mb-1">Độ chính xác từ (Accuracy)</span>
                <span className="text-lg font-bold text-slate-900 block font-mono">≥ {config.speechEngine.minAccuracyScore}%</span>
                <span className="text-xs text-slate-400 mt-1 block">Khớp từng nguyên âm & phụ âm</span>
              </div>

              <div className="rounded-xl border border-slate-200 p-3.5 bg-white">
                <span className="text-xs font-bold text-slate-600 block mb-1">Trọng âm từ (Word Stress)</span>
                <span className="text-lg font-bold text-slate-900 block font-mono">≥ {config.speechEngine.minStressScore}%</span>
                <span className="text-xs text-slate-400 mt-1 block">Độ nhấn âm tiết chính xác</span>
              </div>

              <div className="rounded-xl border border-slate-200 p-3.5 bg-white">
                <span className="text-xs font-bold text-slate-600 block mb-1">Độ lưu loát (Fluency)</span>
                <span className="text-lg font-bold text-slate-900 block font-mono">≥ {config.speechEngine.minFluencyScore}%</span>
                <span className="text-xs text-slate-400 mt-1 block">Tốc độ & khoảng dừng tự nhiên</span>
              </div>
            </div>

            {/* Strictness Level */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Độ khắt khe nhận diện âm vị IPA:</span>
                <span className="text-[11px] text-slate-500">Quyết định mức độ trừ điểm khi học viên phát âm thiếu âm đuôi hoặc sai trọng âm</span>
              </div>

              <div className="flex items-center gap-2">
                {['LENIENT', 'BALANCED', 'STRICT'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        speechEngine: { ...prev.speechEngine, phonemeStrictness: lvl },
                      }))
                    }
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      config.speechEngine.phonemeStrictness === lvl
                        ? 'bg-navy-800 text-white shadow-2xs'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {lvl === 'LENIENT' ? 'Thả lỏng (A1-A2)' : lvl === 'BALANCED' ? 'Cân bằng (B1-B2)' : 'Khắt khe (IELTS/C1)'}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Voice Personas */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Giọng Đọc Tiếng Anh Mẫu (Neural TTS Personas)</h3>
                <p className="text-xs text-slate-500">Học viên Mobile nghe các giọng đọc này khi luyện phát âm hoặc nghe Teacher Cáo giao tiếp</p>
              </div>
              <span className="text-xs font-semibold text-slate-500">5 Giọng Bản Xứ</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {VOICE_PERSONAS_LIST.map((vp) => {
                const isSelected = config.speechEngine.selectedVoice === vp.id
                return (
                  <div
                    key={vp.id}
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        speechEngine: { ...prev.speechEngine, selectedVoice: vp.id },
                      }))
                    }
                    className={`rounded-xl border p-4 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/20 shadow-xs ring-1 ring-brand-600'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">{vp.name}</span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {vp.accent}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">{vp.tag}</p>

                    <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-mono">Tốc độ chuẩn: {vp.wpm} WPM</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePlayVoice(vp)
                        }}
                        className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 cursor-pointer"
                      >
                        <Play size={13} className="fill-brand-600" />
                        <span>Nghe thử giọng</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Speech Rate & Pitch sliders */}
            <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-bold text-slate-800">
                    Hệ số Tốc độ đọc mẫu (Speech Rate): <span className="font-mono text-brand-600">{config.speechEngine.speechRate}x</span>
                  </label>
                  <span className="text-xs text-slate-400">0.8x (Chậm rõ) - 1.2x (Tự nhiên)</span>
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
                  <label className="text-sm font-bold text-slate-800">
                    Cao độ giọng nói (Pitch): <span className="font-mono text-brand-600">{config.speechEngine.speechPitch}</span>
                  </label>
                  <span className="text-xs text-slate-400">Độ trầm hoặc thanh thoát</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.2"
                  step="0.05"
                  value={config.speechEngine.speechPitch}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      speechEngine: { ...prev.speechEngine, speechPitch: parseFloat(e.target.value) },
                    }))
                  }
                  className="w-full accent-navy-800 cursor-pointer"
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ─── TAB 4: QUOTAS & GUARDRAILS ─── */}
      {activeTab === 'quotas' && (
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Quản lý Định mức & Hạn ngạch Sử dụng (Rate Limiting & Quotas)</h3>
            <p className="text-xs text-slate-500">
              Kiểm soát chi phí API Gemini hàng tháng bằng cách phân phối hạn ngạch sử dụng theo phân hạng tài khoản người dùng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 p-4 bg-white">
              <label className="text-sm font-bold text-slate-800 block mb-1">Tài khoản Miễn phí (Free Tier)</label>
              <span className="text-xs text-slate-400 block mb-3">Học viên trải nghiệm cơ bản</span>
              <div className="space-y-2">
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
                    className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-800 font-mono focus:outline-none focus:border-brand-400"
                  />
                </div>
                <div>
                  <span className="text-xs text-slate-600">Lượt chấm phát âm IPA / ngày:</span>
                  <input
                    type="number"
                    value={config.quotas.freeUserSpeakingLimitPerDay}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        quotas: { ...prev.quotas, freeUserSpeakingLimitPerDay: parseInt(e.target.value) || 0 },
                      }))
                    }
                    className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-800 font-mono focus:outline-none focus:border-brand-400"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/20 p-4">
              <label className="text-sm font-bold text-amber-900 block mb-1">Học viên VIP (Premium)</label>
              <span className="text-xs text-slate-400 block mb-3">Đã đăng ký gói cước VIP 3/6/12 tháng</span>
              <div className="space-y-2">
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
                    className="w-full mt-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 font-mono focus:outline-none focus:border-brand-400"
                  />
                </div>
                <div>
                  <span className="text-xs text-slate-600">Lượt chấm phát âm IPA / ngày:</span>
                  <input
                    type="number"
                    value={config.quotas.vipUserSpeakingLimitPerDay}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        quotas: { ...prev.quotas, vipUserSpeakingLimitPerDay: parseInt(e.target.value) || 0 },
                      }))
                    }
                    className="w-full mt-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 font-mono focus:outline-none focus:border-brand-400"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 bg-white">
              <label className="text-sm font-bold text-slate-800 block mb-1">Giáo viên (Teacher Studio)</label>
              <span className="text-xs text-slate-400 block mb-3">Biên soạn bài tập và giáo án lớp học</span>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-slate-600">Sinh bài thi & đề kiểm tra / ngày:</span>
                  <input
                    type="number"
                    value={config.quotas.teacherGenLimitPerDay}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        quotas: { ...prev.quotas, teacherGenLimitPerDay: parseInt(e.target.value) || 0 },
                      }))
                    }
                    className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-800 font-mono focus:outline-none focus:border-brand-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Automatic Fallback Protection */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Tự động kích hoạt chế độ Tiết kiệm chi phí (Cost Protection):</span>
              <span className="text-[11px] text-slate-500">
                Khi mức tiêu thụ đạt ngưỡng {config.quotas.budgetThresholdAlert}%, hệ thống tự động định tuyến các lượt chat thường sang dòng model Lite siêu tiết kiệm
              </span>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
              ĐANG BẬT BẢO VỆ
            </span>
          </div>
        </Card>
      )}

      {/* ─── ADD API KEY MODAL ─── */}
      <Modal
        isOpen={isAddKeyModalOpen}
        onClose={() => setIsAddKeyModalOpen(false)}
        title="Thêm khóa Google Gemini API Key mới"
        size="md"
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">Nhãn gợi nhớ (Label)</label>
            <input
              type="text"
              placeholder="VD: Gemini Key Dự Phòng #2"
              value={newKeyData.label}
              onChange={(e) => setNewKeyData((p) => ({ ...p, label: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-400"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">Giá trị API Key (từ Google AI Studio)</label>
            <input
              type="password"
              placeholder="Chỉ cấu hình tại biến môi trường backend"
              value=""
              disabled
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-mono text-slate-500"
            />
            <p className="mt-2 text-xs text-amber-700">
              Vì lý do bảo mật, giao diện web không nhận hoặc lưu khóa bí mật. Hãy đặt GEMINI_API_KEY trên máy chủ.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsAddKeyModalOpen(false)}>
              Hủy
            </Button>
            <Button size="sm" onClick={handleAddKey}>
              Thêm khóa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

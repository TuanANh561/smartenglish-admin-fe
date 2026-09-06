import { useEffect, useState } from 'react'
import {
  Mic,
  Play,
  Sliders,
  User,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import {
  getEnglishVoices,
  speakDialogue,
  speakSingleVoiceSample,
  stopAudio,
  VOICE_PERSONAS,
} from '@/lib/ipaHelper'
import toast from 'react-hot-toast'

export default function ListeningVoiceConfigCard({
  transcript = '',
  description = '',
  title = '',
  voiceConfig = {
    mode: 'dialogue',
    speaker1Name: 'Alex',
    speaker1Gender: 'male',
    speaker1Persona: 'male-standard',
    speaker1VoiceURI: '',
    speaker1Pitch: 0.95,
    speaker1Rate: 0.96,
    speaker2Name: 'Sarah',
    speaker2Gender: 'female',
    speaker2Persona: 'female-warm',
    speaker2VoiceURI: '',
    speaker2Pitch: 1.18,
    speaker2Rate: 0.93,
  },
  onChange,
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [samplePlayingKey, setSamplePlayingKey] = useState(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [availableVoices, setAvailableVoices] = useState([])

  useEffect(() => {
    const voices = getEnglishVoices()
    setAvailableVoices(voices)

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const handleVoicesChanged = () => {
        setAvailableVoices(getEnglishVoices())
      }
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged
      return () => {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      stopAudio()
    }
  }, [])

  const updateConfig = (key, value) => {
    onChange?.({ ...voiceConfig, [key]: value })
  }

  // Khi chọn một chất giọng: tự động đồng bộ giới tính, cao độ và tốc độ chuẩn theo persona
  const handleSpeaker1PersonaChange = (personaId) => {
    const persona = VOICE_PERSONAS.find((p) => p.id === personaId)
    if (persona) {
      onChange?.({
        ...voiceConfig,
        speaker1Gender: persona.gender,
        speaker1Persona: persona.id,
        speaker1Pitch: persona.pitch,
        speaker1Rate: persona.rate,
        speaker1VoiceURI: '',
      })
    }
  }

  const handleSpeaker2PersonaChange = (personaId) => {
    const persona = VOICE_PERSONAS.find((p) => p.id === personaId)
    if (persona) {
      onChange?.({
        ...voiceConfig,
        speaker2Gender: persona.gender,
        speaker2Persona: persona.id,
        speaker2Pitch: persona.pitch,
        speaker2Rate: persona.rate,
        speaker2VoiceURI: '',
      })
    }
  }

  // Thử riêng giọng từng nhân vật tức thì
  const handleTestSpeakerSample = (speakerKey) => {
    stopAudio()
    setIsPlaying(false)

    if (samplePlayingKey === speakerKey) {
      setSamplePlayingKey(null)
      return
    }

    setSamplePlayingKey(speakerKey)

    if (speakerKey === 'speaker1') {
      const isFemale = voiceConfig.speaker1Gender === 'female'
      const name = voiceConfig.speaker1Name || (isFemale ? 'Sarah' : 'Alex')
      speakSingleVoiceSample(
        `Hello, I am ${name}. This is how my voice sounds.`,
        {
          speaker1Gender: voiceConfig.speaker1Gender || 'male',
          speaker1Persona: voiceConfig.speaker1Persona || 'male-standard',
          speaker1VoiceURI: voiceConfig.speaker1VoiceURI,
          speaker1Pitch: voiceConfig.speaker1Pitch,
          speaker1Rate: voiceConfig.speaker1Rate,
        },
        () => setSamplePlayingKey(null)
      )
    } else if (speakerKey === 'speaker2') {
      const isFemale = voiceConfig.speaker2Gender !== 'male'
      const name = voiceConfig.speaker2Name || (isFemale ? 'Sarah' : 'Alex')
      speakSingleVoiceSample(
        `Hello, I am ${name}. This is how my voice sounds.`,
        {
          speaker1Gender: voiceConfig.speaker2Gender || 'female',
          speaker1Persona: voiceConfig.speaker2Persona || 'female-warm',
          speaker1VoiceURI: voiceConfig.speaker2VoiceURI,
          speaker1Pitch: voiceConfig.speaker2Pitch,
          speaker1Rate: voiceConfig.speaker2Rate,
        },
        () => setSamplePlayingKey(null)
      )
    }
  }

  const handleTogglePreview = () => {
    if (isPlaying) {
      stopAudio()
      setIsPlaying(false)
      toast('Đã dừng nghe thử')
      return
    }

    const textToSpeak = transcript.trim()
    // Bắt buộc đọc cả Tiêu đề + Mô tả ngắn trước khi vào bản chép lời
    const introParts = []
    if (title.trim()) introParts.push(title.trim())
    if (description.trim()) introParts.push(description.trim())
    const introText = introParts.join('. ')

    if (!textToSpeak && !introText) {
      toast.error('Chưa có nội dung bài nghe để nghe thử')
      return
    }

    setIsPlaying(true)
    setSamplePlayingKey(null)
    const isSingle = voiceConfig.mode === 'single'
    const spk1GenderText = voiceConfig.speaker1Gender === 'female' ? 'Nữ' : 'Nam'

    toast.success(
      isSingle
        ? `Đang phát nghe thử (Độc thoại - Giọng ${spk1GenderText})...`
        : 'Đang phát nghe thử (Đối thoại luân phiên)...'
    )

    speakDialogue(
      textToSpeak,
      {
        mode: voiceConfig.mode,
        intro: introText,
        speaker1Name: voiceConfig.speaker1Name || 'Alex',
        speaker1Gender: voiceConfig.speaker1Gender || 'male',
        speaker1Persona:
          voiceConfig.speaker1Persona ||
          (voiceConfig.speaker1Gender === 'female' ? 'female-warm' : 'male-standard'),
        speaker1VoiceURI: voiceConfig.speaker1VoiceURI || '',
        speaker1Pitch: Number(voiceConfig.speaker1Pitch),
        speaker1Rate: Number(voiceConfig.speaker1Rate),
        speaker2Name: voiceConfig.speaker2Name || 'Sarah',
        speaker2Gender: voiceConfig.speaker2Gender || 'female',
        speaker2Persona:
          voiceConfig.speaker2Persona ||
          (voiceConfig.speaker2Gender === 'male' ? 'male-standard' : 'female-warm'),
        speaker2VoiceURI: voiceConfig.speaker2VoiceURI || '',
        speaker2Pitch: Number(voiceConfig.speaker2Pitch),
        speaker2Rate: Number(voiceConfig.speaker2Rate),
      },
      () => {
        setIsPlaying(false)
      }
    )
  }

  const malePersonas = VOICE_PERSONAS.filter((p) => p.gender === 'male')
  const femalePersonas = VOICE_PERSONAS.filter((p) => p.gender === 'female')

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-white to-indigo-50/20 shadow-xs p-5 space-y-4">
      {/* Header Card */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-xs">
            <Mic size={15} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Tùy chọn giọng đọc & Nghe thử
            </h3>
            <p className="text-[11px] text-slate-500">
              Chọn nhanh giọng đọc cho từng nhân vật và nghe thử ngay lập tức
            </p>
          </div>
        </div>
      </div>

      {/* Switcher Mode: Đối thoại 2 người vs Độc thoại */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100/90 text-xs font-semibold">
        <button
          type="button"
          onClick={() => updateConfig('mode', 'dialogue')}
          className={`flex-1 py-2 rounded-lg text-center transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${
            voiceConfig.mode === 'dialogue'
              ? 'bg-white text-indigo-700 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users size={14} /> Đối thoại 2 người
        </button>
        <button
          type="button"
          onClick={() => updateConfig('mode', 'single')}
          className={`flex-1 py-2 rounded-lg text-center transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${
            voiceConfig.mode === 'single'
              ? 'bg-white text-indigo-700 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User size={14} /> Độc thoại 1 người
        </button>
      </div>

      {/* CHẾ ĐỘ ĐỘC THOẠI (1 Người đọc toàn bài) */}
      {voiceConfig.mode === 'single' ? (
        <div className="rounded-xl border border-indigo-200/80 bg-white p-4 space-y-3.5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs">
                <User size={13} />
              </span>
              <span className="text-xs font-bold text-slate-800">
                Người đọc bài
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleTestSpeakerSample('speaker1')}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer shadow-2xs"
              title="Bấm để nghe thử mẫu giọng này"
            >
              <Volume2 size={13} /> {samplePlayingKey === 'speaker1' ? 'Đang nói...' : 'Thử giọng này'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Tên người đọc */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Tên hiển thị người đọc
              </label>
              <Input
                value={voiceConfig.speaker1Name || ''}
                onChange={(e) => updateConfig('speaker1Name', e.target.value)}
                placeholder="VD: Speaker, Narrator..."
                className="h-8.5 text-xs"
              />
            </div>

            {/* Giọng đọc trực tiếp */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Chọn giọng đọc
              </label>
              <Select
                value={
                  voiceConfig.speaker1Persona ||
                  (voiceConfig.speaker1Gender === 'female' ? 'female-warm' : 'male-standard')
                }
                onChange={(e) => handleSpeaker1PersonaChange(e.target.value)}
                className="h-8.5 text-xs font-medium"
              >
                <optgroup label="Giọng Nam">
                  {malePersonas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Giọng Nữ">
                  {femalePersonas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
              </Select>
            </div>
          </div>
        </div>
      ) : (
        /* CHẾ ĐỘ ĐỐI THOẠI (2 Người đọc luân phiên) - Gọn gàng chỉ 2 trường mỗi người */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Người nói A */}
          <div className="rounded-xl border border-blue-200/80 bg-white p-3.5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-xs">
                  A
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Người nói A
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleTestSpeakerSample('speaker1')}
                className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200/80 px-2 py-0.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                title="Bấm để nghe thử riêng giọng Người nói A"
              >
                <Volume2 size={12} /> {samplePlayingKey === 'speaker1' ? 'Đang nói...' : 'Thử giọng A'}
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Tên nhân vật trong kịch bản
                </label>
                <Input
                  value={voiceConfig.speaker1Name || ''}
                  onChange={(e) => updateConfig('speaker1Name', e.target.value)}
                  placeholder="VD: Alex"
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Giọng đọc nhân vật A
                </label>
                <Select
                  value={
                    voiceConfig.speaker1Persona ||
                    (voiceConfig.speaker1Gender === 'female' ? 'female-warm' : 'male-standard')
                  }
                  onChange={(e) => handleSpeaker1PersonaChange(e.target.value)}
                  className="h-8 text-xs font-medium"
                >
                  <optgroup label="Giọng Nam (Khuyên dùng cho Alex)">
                    {malePersonas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Giọng Nữ">
                    {femalePersonas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                </Select>
              </div>
            </div>
          </div>

          {/* Người nói B */}
          <div className="rounded-xl border border-rose-200/80 bg-white p-3.5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-700 font-bold text-xs">
                  B
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Người nói B
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleTestSpeakerSample('speaker2')}
                className="inline-flex items-center gap-1 rounded-md bg-rose-50 border border-rose-200/80 px-2 py-0.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                title="Bấm để nghe thử riêng giọng Người nói B"
              >
                <Volume2 size={12} /> {samplePlayingKey === 'speaker2' ? 'Đang nói...' : 'Thử giọng B'}
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Tên nhân vật trong kịch bản
                </label>
                <Input
                  value={voiceConfig.speaker2Name || ''}
                  onChange={(e) => updateConfig('speaker2Name', e.target.value)}
                  placeholder="VD: Sarah"
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Giọng đọc nhân vật B
                </label>
                <Select
                  value={
                    voiceConfig.speaker2Persona ||
                    (voiceConfig.speaker2Gender === 'male' ? 'male-standard' : 'female-warm')
                  }
                  onChange={(e) => handleSpeaker2PersonaChange(e.target.value)}
                  className="h-8 text-xs font-medium"
                >
                  <optgroup label="Giọng Nữ (Khuyên dùng cho Sarah)">
                    {femalePersonas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Giọng Nam">
                    {malePersonas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nút bật/tắt Tùy chỉnh nâng cao (Ẩn mặc định để giao diện cực kỳ thoáng và không rối mắt) */}
      <div className="flex items-center justify-end pt-1">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
        >
          <Sliders size={12} />
          {showAdvanced ? 'Thu gọn tùy chỉnh nâng cao' : 'Tùy chỉnh thêm (Tốc độ nói)'}
        </button>
      </div>

      {/* Khu vực tùy chỉnh nâng cao (Chỉ hiện khi người dùng muốn can thiệp sâu) */}
      {showAdvanced && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">
              Tốc độ nói Người 1 ({voiceConfig.speaker1Name || 'A'})
            </label>
            <Select
              value={String(voiceConfig.speaker1Rate || '0.96')}
              onChange={(e) => updateConfig('speaker1Rate', Number(e.target.value))}
              className="h-8 text-xs"
            >
              <option value="0.85">Chậm rãi (0.85x)</option>
              <option value="0.96">Chuẩn tự nhiên (0.96x)</option>
              <option value="1.05">Nhanh nhẹn (1.05x)</option>
            </Select>
          </div>

          {voiceConfig.mode === 'dialogue' && (
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Tốc độ nói Người 2 ({voiceConfig.speaker2Name || 'B'})
              </label>
              <Select
                value={String(voiceConfig.speaker2Rate || '0.93')}
                onChange={(e) => updateConfig('speaker2Rate', Number(e.target.value))}
                className="h-8 text-xs"
              >
                <option value="0.85">Chậm rãi (0.85x)</option>
                <option value="0.93">Chuẩn tự nhiên (0.93x)</option>
                <option value="1.05">Nhanh nhẹn (1.05x)</option>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Dark Studio Player Bar: Nghe thử âm thanh trực tiếp */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 p-3.5 text-white shadow-md">
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            type="button"
            onClick={handleTogglePreview}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold transition-all duration-200 cursor-pointer ${
              isPlaying
                ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-900/50'
                : 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-900/40 hover:scale-105'
            }`}
            title={isPlaying ? 'Dừng phát' : 'Bấm nghe thử'}
          >
            {isPlaying ? <VolumeX size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-tight text-white">
                {isPlaying ? 'Đang phát âm thanh...' : 'Nghe thử toàn bộ bài nghe'}
              </span>
              {isPlaying && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              {isPlaying
                ? 'Nhấn Dừng lại để ngắt âm thanh'
                : voiceConfig.mode === 'single'
                ? `Phát độc thoại bằng giọng ${voiceConfig.speaker1Gender === 'female' ? 'Nữ' : 'Nam'}`
                : `Phát đối thoại luân phiên giữa ${voiceConfig.speaker1Name || 'Alex'} (Nam) và ${voiceConfig.speaker2Name || 'Sarah'} (Nữ)`}
            </p>
          </div>
        </div>

        {/* Thanh sóng âm Visualizer khi đang phát */}
        <div className="flex items-center gap-3">
          {isPlaying && (
            <div className="flex items-end gap-1 h-5 px-2">
              <span className="w-1 bg-brand-400 rounded-full h-3 animate-pulse" />
              <span className="w-1 bg-brand-300 rounded-full h-5 animate-pulse delay-75" />
              <span className="w-1 bg-brand-400 rounded-full h-2 animate-pulse delay-150" />
              <span className="w-1 bg-brand-200 rounded-full h-4 animate-pulse delay-100" />
              <span className="w-1 bg-brand-400 rounded-full h-3 animate-pulse" />
            </div>
          )}

          {isPlaying && (
            <button
              type="button"
              onClick={handleTogglePreview}
              className="rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
            >
              Dừng lại
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

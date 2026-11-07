import { useState, useEffect, useRef } from 'react'
import {
  X,
  Volume2,
  Mic,
  MicOff,
  Send,
  User,
  Languages,
  Loader2,
  Lightbulb,
  Copy,
  Check,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { stopAudio } from '@/lib/ipaHelper'
import { claimAppAudio, releaseAppAudio } from '@/lib/appAudioCoordinator'
import { chatRoleplayTurn } from '../speakingScenarioApi'

// Danh sách tên nữ phổ biến trong tiếng Anh
const FEMALE_NAMES = new Set([
  'patricia', 'emily', 'sarah', 'jessica', 'emma', 'olivia', 'sophia', 'isabella',
  'ava', 'mia', 'charlotte', 'harper', 'evelyn', 'amelia', 'mary', 'jennifer',
  'linda', 'elizabeth', 'susan', 'karen', 'nancy', 'lisa', 'betty', 'margaret',
  'sandra', 'ashley', 'kimberly', 'donna', 'carol', 'michelle', 'amanda', 'melissa',
  'deborah', 'stephanie', 'rebecca', 'sharon', 'laura', 'cynthia', 'kathleen',
  'amy', 'shirley', 'angela', 'helen', 'anna', 'brenda', 'pamela', 'nicole',
  'samantha', 'katherine', 'christine', 'debra', 'rachel', 'catherine', 'carolyn',
  'janet', 'ruth', 'maria', 'heather', 'diane', 'virginia', 'julie', 'joyce',
  'victoria', 'kelly', 'christina', 'lauren', 'joan', 'judith', 'megan', 'cheryl',
  'martha', 'andrea', 'frances', 'hannah', 'jacqueline', 'ann', 'gloria', 'jean',
  'kathryn', 'alice', 'teresa', 'sara', 'janice', 'doris', 'madison', 'julia',
  'grace', 'judy', 'abigail', 'marie', 'denise', 'beverly', 'amber', 'theresa',
  'marilyn', 'danielle', 'diana', 'brittany', 'natalie', 'rose', 'alexis',
  'kaylee', 'chloe', 'lucy', 'daisy', 'lily', 'zoe', 'ella', 'nora', 'hazel',
  'zira', 'clara', 'elena', 'charlie_f', 'claire', 'eva', 'jenny', 'linda'
])

// Danh sách tên nam phổ biến trong tiếng Anh
const MALE_NAMES = new Set([
  'david', 'john', 'michael', 'james', 'robert', 'william', 'richard', 'joseph',
  'thomas', 'charles', 'christopher', 'daniel', 'matthew', 'anthony', 'mark',
  'donald', 'steven', 'paul', 'andrew', 'joshua', 'kenneth', 'kevin', 'brian',
  'george', 'timothy', 'ronald', 'edward', 'jason', 'jeffrey', 'ryan', 'jacob',
  'gary', 'nicholas', 'eric', 'jonathan', 'stephen', 'larry', 'justin', 'scott',
  'brandon', 'benjamin', 'samuel', 'gregory', 'alexander', 'frank', 'patrick',
  'raymond', 'jack', 'dennis', 'jerry', 'tyler', 'aaron', 'jose', 'adam',
  'nathan', 'henry', 'douglas', 'zach', 'peter', 'kyle', 'walter', 'harold',
  'jeremy', 'ethan', 'carl', 'keith', 'roger', 'gerald', 'christian', 'terry',
  'sean', 'arthur', 'austin', 'noah', 'lawrence', 'jesse', 'joe', 'bryan',
  'billy', 'jordan', 'albert', 'dylan', 'bruce', 'willie', 'gabriel', 'alan',
  'juan', 'logan', 'wayne', 'ralph', 'roy', 'eugene', 'randy', 'vincent',
  'russell', 'louis', 'philip', 'bobby', 'johnny', 'bradley', 'tom', 'mike',
  'alex', 'sam', 'harry', 'oliver', 'liam', 'lucas', 'leo', 'max', 'guy'
])

/**
 * Nhận diện giới tính của nhân vật kịch bản (female hoặc male)
 */
function getCharacterGender(scenario) {
  if (!scenario) return 'female'

  // 1. Kiểm tra trường giới tính được định nghĩa rõ ràng nếu có
  const g = String(scenario.partnerGender || scenario.gender || '').toLowerCase().trim()
  if (['female', 'f', 'nu', 'nữ', 'woman', 'girl'].includes(g)) return 'female'
  if (['male', 'm', 'nam', 'man', 'boy'].includes(g)) return 'male'

  // 2. Nhận diện theo danh xưng hoặc tên nhân vật
  const rawName = String(scenario.partnerName || scenario.aiPersona || '').toLowerCase().trim()
  if (rawName.startsWith('mrs.') || rawName.startsWith('ms.') || rawName.startsWith('miss')) return 'female'
  if (rawName.startsWith('mr.')) return 'male'

  const nameParts = rawName.split(/[\s_\-.]+/)
  for (const part of nameParts) {
    if (FEMALE_NAMES.has(part)) return 'female'
    if (MALE_NAMES.has(part)) return 'male'
  }

  // 3. Kiểm tra giọng đọc mặc định được cấu hình
  const voice = String(scenario.defaultVoice || '').toLowerCase()
  if (voice.includes('zira') || voice.includes('harper') || voice.includes('jenny') || voice.includes('samantha') || voice.includes('female')) return 'female'
  if (voice.includes('david') || voice.includes('guy') || voice.includes('mark') || voice.includes('george') || voice.includes('male')) return 'male'

  // 4. Nhận diện qua mô tả kịch bản và vai trò
  const context = `${scenario.descriptionEn || ''} ${scenario.descriptionVi || ''} ${scenario.partnerRole || ''}`.toLowerCase()
  if (/\b(she|her|woman|girl|lady|cô|chị|bà|nữ)\b/.test(context)) return 'female'
  if (/\b(he|him|his|man|boy|anh|chú|ông|nam)\b/.test(context)) return 'male'

  return 'female'
}

/**
 * Tìm giọng đọc Web Speech API phù hợp nhất với giới tính
 */
function getBestVoiceForGender(gender = 'female') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
  const voices = window.speechSynthesis.getVoices() || []
  const enVoices = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('en'))
  const candidatePool = enVoices.length > 0 ? enVoices : voices

  if (gender === 'female') {
    const femaleVoice = candidatePool.find((v) => {
      const n = (v.name || '').toLowerCase()
      return (
        n.includes('zira') ||
        n.includes('harper') ||
        n.includes('jenny') ||
        n.includes('samantha') ||
        n.includes('victoria') ||
        n.includes('karen') ||
        n.includes('female') ||
        n.includes('siri') ||
        n.includes('ava') ||
        n.includes('catherine') ||
        n.includes('fiona') ||
        n.includes('standard-c') ||
        n.includes('standard-e') ||
        n.includes('wavenet-c')
      )
    })
    if (femaleVoice) return femaleVoice

    const nonMaleVoice = candidatePool.find((v) => {
      const n = (v.name || '').toLowerCase()
      return !n.includes('david') && !n.includes('guy') && !n.includes('male') && !n.includes('mark') && !n.includes('george')
    })
    return nonMaleVoice || candidatePool[0] || null
  } else {
    const maleVoice = candidatePool.find((v) => {
      const n = (v.name || '').toLowerCase()
      return (
        n.includes('david') ||
        n.includes('guy') ||
        n.includes('mark') ||
        n.includes('george') ||
        n.includes('male') ||
        n.includes('daniel') ||
        n.includes('alex') ||
        n.includes('standard-b') ||
        n.includes('standard-d') ||
        n.includes('wavenet-b')
      )
    })
    if (maleVoice) return maleVoice

    const nonFemaleVoice = candidatePool.find((v) => {
      const n = (v.name || '').toLowerCase()
      return !n.includes('zira') && !n.includes('jenny') && !n.includes('samantha') && !n.includes('female')
    })
    return nonFemaleVoice || candidatePool[0] || null
  }
}

/**
 * Sinh gợi ý phản hồi theo ngữ cảnh câu thoại mới nhất của AI (Fallback thông minh)
 */
function generateSmartContextSuggestions(aiText, scenario) {
  const t = String(aiText || '').toLowerCase()
  if (t.includes('what is your name') || t.includes('your name') || t.includes('who are you')) {
    return ['My name is Alex', "I'm David, nice to meet you", 'You can call me Sarah', 'Nice to meet you, Patricia!']
  }
  if (t.includes('department') || t.includes('team') || t.includes('work') || t.includes('role')) {
    return ['I work in the IT department', "I'm in Marketing", 'I just joined HR team', 'I am a software engineer']
  }
  if (t.includes('how are you') || t.includes('how do you do') || t.includes('how are things')) {
    return ["I'm doing great, thank you!", 'Pretty good, thanks for asking!', 'A bit busy today, but excited!']
  }
  if (t.includes('where are you from') || t.includes('where do you live')) {
    return ["I'm from Da Nang city", 'I live right here in the city', 'I moved here recently']
  }
  if (t.includes('weekend') || t.includes('free time') || t.includes('hobby')) {
    return ['I love reading books', 'I usually hang out with friends', 'I enjoy coffee and music']
  }
  if (t.includes('help') || t.includes('can i') || t.includes('may i')) {
    return ['Yes, please! Could you show me around?', 'That would be great, thanks!', 'I need help finding my desk']
  }

  // Nếu kịch bản có từ khóa ban đầu thì biến tấu thành câu phản hồi tự nhiên
  if (Array.isArray(scenario?.suggestedKeywords) && scenario.suggestedKeywords.length > 0) {
    return scenario.suggestedKeywords
  }

  return ['Nice to meet you!', 'Could you tell me more about that?', 'That sounds interesting!', 'I agree with you!']
}

/**
 * Phản hồi ngữ cảnh thông minh khi API gặp timeout hoặc gián đoạn kết nối
 */
function generateFallbackReply(userText, scenario) {
  const ut = String(userText || '').toLowerCase()
  let reply = ''
  let suggestions = []

  if (ut.includes("don't want") || ut.includes('not tell') || ut.includes('no') || ut.includes('secret')) {
    reply = "Haha, that's completely fine! No pressure at all. We can chat about whatever you feel comfortable sharing. Are you excited about your project here?\n\n💡 Góp ý tiếng Việt: Bạn có thể dùng 'I'd rather not say' để từ chối một cách lịch sự trong môi trường công sở nhé!"
    suggestions = ['Yes, definitely!', 'A little bit nervous', "Let's talk about the company", 'What do you do here?']
  } else if (ut.includes('name is') || ut.includes("i'm ") || ut.includes('call me')) {
    reply = `Great to meet you! Welcome to the team. Which department are you joining?\n\n💡 Góp ý tiếng Việt: Hãy trả lời kèm vị trí công tác, ví dụ: 'I work in the IT department'.`
    suggestions = ['I work in IT', "I'm in Marketing team", 'Sales and Customer Support', 'Design department']
  } else {
    reply = `I see! That's very helpful to know. Could you share a little bit more detail about that?\n\n💡 Góp ý tiếng Việt: Bạn có thể mở rộng ý bằng cách dùng liên từ như 'Because...', 'Also...', hoặc 'For example...'.`
    suggestions = ['Sure! In my opinion...', 'Because it is very important', 'For example, yesterday...', 'What about you?']
  }

  return { text: reply, suggestions }
}

export default function SpeakingSimulatorModal({
  isOpen,
  onClose,
  scenario,
}) {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isAiReplying, setIsAiReplying] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [translatedMessages, setTranslatedMessages] = useState({})
  const [translatingId, setTranslatingId] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [showContext, setShowContext] = useState(true)
  const [isSpeakingTts, setIsSpeakingTts] = useState(false)
  const [currentSuggestions, setCurrentSuggestions] = useState([])
  const [activeVoiceLabel, setActiveVoiceLabel] = useState('')

  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const isRecordingRef = useRef(false)
  const finalTranscriptRef = useRef('')

  const characterGender = getCharacterGender(scenario)

  // Cập nhật tên Voice thực tế trên hệ thống máy tính của người dùng
  useEffect(() => {
    if (!isOpen || !scenario) return

    const detectVoice = () => {
      const voice = getBestVoiceForGender(characterGender)
      if (voice?.name) {
        const cleanName = voice.name
          .replace(/Microsoft |Google |English |United States|Desktop|\(en-US\)|\(en-GB\)/gi, '')
          .trim()
        setActiveVoiceLabel(cleanName || voice.name)
      } else {
        setActiveVoiceLabel(scenario.defaultVoice || (characterGender === 'female' ? 'US Harper / Zira' : 'US David'))
      }
    }

    detectVoice()
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = detectVoice
    }
  }, [isOpen, scenario, characterGender])

  // Web Speech API for TTS: Chuẩn hóa giọng và Pitch theo Giới tính nhân vật
  const speakText = (text, rateMultiplier = 1.0) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    claimAppAudio('speaking-simulator', () => {
      try { window.speechSynthesis.cancel() } catch (_) {}
      setIsSpeakingTts(false)
    })

    // Lọc bỏ phần góp ý tiếng Việt nếu có khi đọc phát âm tiếng Anh
    const cleanEn = String(text || '').split(/💡/)[0].trim()
    const utterance = new SpeechSynthesisUtterance(cleanEn || text)
    utterance.lang = 'en-US'

    // Gán giọng đọc chuẩn theo giới tính
    const bestVoice = getBestVoiceForGender(characterGender)
    if (bestVoice) {
      utterance.voice = bestVoice
    }

    // Điều chỉnh Pitch để phân biệt rõ rệt Nam / Nữ kể cả khi Windows chỉ có 1 giọng mặc định
    utterance.pitch = characterGender === 'female' ? 1.15 : 0.88

    const baseSpeed = scenario?.defaultSpeed === 'slow' ? 0.8 : scenario?.defaultSpeed === 'fast' ? 1.2 : 1.0
    utterance.rate = baseSpeed * rateMultiplier

    utterance.onstart = () => setIsSpeakingTts(true)
    utterance.onend = () => {
      setIsSpeakingTts(false)
      releaseAppAudio('speaking-simulator')
    }
    utterance.onerror = () => {
      setIsSpeakingTts(false)
      releaseAppAudio('speaking-simulator')
    }
    window.speechSynthesis.speak(utterance)
  }

  // Dừng mọi âm thanh và thu âm khi đóng modal
  const handleClose = () => {
    releaseAppAudio('speaking-simulator')
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel() } catch (_) {}
    }
    stopAudio()
    isRecordingRef.current = false
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (_) {}
      recognitionRef.current = null
    }
    onClose()
  }

  // Dọn dẹp âm thanh khi component unmount
  useEffect(() => {
    return () => {
      releaseAppAudio('speaking-simulator')
      if ('speechSynthesis' in window) {
        try { window.speechSynthesis.cancel() } catch (_) {}
      }
      stopAudio()
      isRecordingRef.current = false
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch (_) {}
        recognitionRef.current = null
      }
    }
  }, [])

  // Khởi tạo cuộc đàm thoại với Opening Line và Gợi ý đầu tiên
  useEffect(() => {
    if (!isOpen || !scenario) return

    const opening = scenario.openingLine || 'Hello! How are you today?'
    setMessages([
      {
        id: 1,
        sender: 'ai',
        text: opening,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setSessionId(null)
    setTranslatedMessages({})

    // Nạp gợi ý khởi đầu động theo câu mở đầu
    const initialSuggestions = generateSmartContextSuggestions(opening, scenario)
    setCurrentSuggestions(initialSuggestions)

    // Tự động phát âm câu mở đầu
    const timer = setTimeout(() => {
      speakText(opening)
    }, 500)

    return () => {
      clearTimeout(timer)
      if ('speechSynthesis' in window) {
        try { window.speechSynthesis.cancel() } catch (_) {}
      }
      stopAudio()
      isRecordingRef.current = false
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch (_) {}
      }
    }
  }, [isOpen, scenario])

  // Tự động cuộn xuống đáy khi có tin nhắn mới hoặc đang typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAiReplying])

  // Web Speech API for STT:
  // Cho phép người dùng bấm vào để nói, bấm lại lần nữa để kết thúc
  // Không tự động tắt micro khi người dùng tạm ngừng nói để suy nghĩ
  const toggleRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast('Trình duyệt không hỗ trợ Web Speech API nhận dạng giọng nói trực tiếp. Bạn có thể gõ phím vào ô nhập liệu bên dưới.')
      return
    }

    if (isRecordingRef.current) {
      isRecordingRef.current = false
      setIsRecording(false)
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (_) {}
        recognitionRef.current = null
      }
      toast('Đã dừng thu âm. Bấm Gửi để gửi câu thoại!')
      return
    }

    try {
      isRecordingRef.current = true
      setIsRecording(true)
      finalTranscriptRef.current = inputText ? inputText.trim() + ' ' : ''

      const recognition = new SpeechRecognition()
      recognition.lang = 'en-US'
      recognition.continuous = true
      recognition.interimResults = true

      recognition.onstart = () => {
        setIsRecording(true)
      }

      recognition.onresult = (event) => {
        let interim = ''
        let newFinal = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i]
          if (res.isFinal) {
            newFinal += res[0].transcript + ' '
          } else {
            interim += res[0].transcript
          }
        }
        if (newFinal) {
          finalTranscriptRef.current += newFinal
        }
        const combined = (finalTranscriptRef.current + interim).trim()
        setInputText(combined)
      }

      recognition.onerror = (event) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          isRecordingRef.current = false
          setIsRecording(false)
          toast.error('Vui lòng cấp quyền truy cập Microphone cho trình duyệt!')
        } else if (event.error === 'no-speech') {
          // Người dùng tạm nghỉ, không tắt micro
        } else {
          console.warn('Speech recognition warning:', event.error)
        }
      }

      recognition.onend = () => {
        if (isRecordingRef.current) {
          try {
            recognition.start()
          } catch (e) {
            // Đang bận
          }
        } else {
          setIsRecording(false)
        }
      }

      recognitionRef.current = recognition
      recognition.start()
      toast('Micro đang mở! Hãy nói và bấm lại nút Micro khi hoàn thành.')
    } catch (err) {
      console.error(err)
      isRecordingRef.current = false
      setIsRecording(false)
    }
  }

  // Gửi lượt thoại và nhận phản hồi AI
  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputText).trim()
    if (!text || isAiReplying) return

    // Dừng âm thanh và thu âm
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    if (isRecordingRef.current) {
      isRecordingRef.current = false
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch (_) {}
        recognitionRef.current = null
      }
      setIsRecording(false)
    }

    // Thêm tin nhắn của User
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, userMsg])
    setInputText('')
    setIsAiReplying(true)

    try {
      const res = await chatRoleplayTurn(scenario.id, text, sessionId)
      const data = res?.data || res
      if (data?.sessionId) {
        setSessionId(data.sessionId)
      }

      const replyText = data?.reply || data?.aiResponseText || data?.message || 'That sounds interesting! Tell me more about it.'

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, aiMsg])

      // Cập nhật gợi ý phản hồi ĐỘNG cho lượt thoại tiếp theo
      if (Array.isArray(data?.suggestedReplies) && data.suggestedReplies.length > 0) {
        setCurrentSuggestions(data.suggestedReplies)
      } else if (Array.isArray(data?.suggestedKeywords) && data.suggestedKeywords.length > 0) {
        setCurrentSuggestions(data.suggestedKeywords)
      } else {
        setCurrentSuggestions(generateSmartContextSuggestions(replyText, scenario))
      }

      // Tự động phát âm câu phản hồi của AI
      speakText(replyText)
    } catch (err) {
      console.warn('Lỗi gọi API chat AI Roleplay:', err)
      // Fallback thông minh đảm bảo đàm thoại không bị dừng hoặc gián đoạn
      const fallback = generateFallbackReply(text, scenario)
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: fallback.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, errorMsg])
      setCurrentSuggestions(fallback.suggestions)
      speakText(fallback.text)
    } finally {
      setIsAiReplying(false)
    }
  }

  // Khi click vào từ/câu gợi ý
  const handleUseKeyword = (kw) => {
    setInputText((prev) => {
      const trimmed = prev.trim()
      return trimmed ? `${trimmed} ${kw}` : kw
    })
  }

  // Dịch nghĩa tiếng Việt thật qua Google Translate
  const translateToVietnamese = async (msgId, text) => {
    if (translatedMessages[msgId]) {
      setTranslatedMessages((prev) => {
        const next = { ...prev }
        delete next[msgId]
        return next
      })
      return
    }

    setTranslatingId(msgId)
    try {
      const cleanEn = String(text || '').split(/💡/)[0].trim()
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(cleanEn || text)}`
      )
      const data = await res.json()
      const transText = data[0]?.map((item) => item[0]).join('') || 'Đã dịch nội dung thành công.'
      setTranslatedMessages((prev) => ({
        ...prev,
        [msgId]: transText,
      }))
    } catch (e) {
      setTranslatedMessages((prev) => ({
        ...prev,
        [msgId]: 'Bản dịch: ' + text,
      }))
    } finally {
      setTranslatingId(null)
    }
  }

  const handleCopyMessage = (msgId, text) => {
    try {
      navigator.clipboard.writeText(text)
      setCopiedId(msgId)
      toast.success('Đã sao chép câu thoại!')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (e) {
      toast.error('Không thể sao chép văn bản')
    }
  }

  if (!isOpen || !scenario) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-hidden">
      <div className="relative flex flex-col h-[90vh] w-full max-w-4xl rounded-3xl bg-white text-slate-800 shadow-2xl border border-slate-200/90 overflow-hidden font-sans">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-white px-6 py-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700 border border-brand-200 shadow-xs">
              {scenario.partnerAvatarUrl ? (
                <img
                  src={scenario.partnerAvatarUrl}
                  alt={scenario.partnerName}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                (scenario.partnerName || 'P')[0].toUpperCase()
              )}
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 aspect-square rounded-full border-2 border-white bg-emerald-500 shadow-xs z-10 block shrink-0" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">{scenario.partnerName || 'Patricia'}</h2>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 uppercase">
                  {scenario.cefrLevel || 'A1'}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">{scenario.titleEn}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Hiển thị giới tính và Voice chuẩn */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium">
              <Volume2
                size={13}
                className={characterGender === 'female' ? 'text-pink-600' : 'text-brand-600'}
              />
              <span className={characterGender === 'female' ? 'text-pink-700 font-bold' : 'text-brand-700 font-bold'}>
                {characterGender === 'female' ? '♀ Nữ' : '♂ Nam'}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600 truncate max-w-[130px]" title={activeVoiceLabel}>
                {activeVoiceLabel || (characterGender === 'female' ? 'US Harper' : 'US David')}
              </span>
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors border border-slate-200 cursor-pointer shadow-2xs"
              title="Đóng"
              aria-label="Đóng"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scenario Context Bar (Collapsible) */}
        {scenario.descriptionEn && showContext && (
          <div className="border-b border-brand-100/90 bg-brand-50/50 px-6 py-3 text-xs flex items-start justify-between gap-4 shrink-0">
            <div className="space-y-0.5">
              <span className="font-bold text-[11px] text-brand-700 uppercase tracking-wider">Kịch bản:</span>
              <p className="text-slate-800 text-xs leading-relaxed font-medium">{scenario.descriptionEn}</p>
              {scenario.descriptionVi && (
                <p className="text-slate-500 text-[11px]">{scenario.descriptionVi}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowContext(false)}
              className="text-slate-400 hover:text-slate-700 text-[11px] font-medium shrink-0 mt-0.5 cursor-pointer"
            >
              Thu gọn
            </button>
          </div>
        )}

        {/* Dialogue Stream Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white'
                    : 'bg-brand-100 text-brand-700 border border-brand-200'
                }`}
              >
                {msg.sender === 'user' ? (
                  <User size={15} />
                ) : scenario.partnerAvatarUrl ? (
                  <img
                    src={scenario.partnerAvatarUrl}
                    alt={scenario.partnerName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  (scenario.partnerName || 'P')[0]
                )}
              </div>

              {/* Message Bubble */}
              <div className="space-y-1 max-w-full">
                {msg.sender === 'ai' && (
                  <p className="text-[11px] font-semibold text-slate-500 pl-1">
                    {scenario.partnerName || 'AI Partner'}
                  </p>
                )}

                {(() => {
                  const parts = String(msg.text || '').split(/(?:^|\n+)💡\s*/);
                  const mainText = parts[0]?.trim();
                  const feedbackText = parts.length > 1 ? parts.slice(1).join('\n').trim() : null;

                  return (
                    <>
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-brand-600 text-white rounded-tr-xs shadow-sm'
                            : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-2xs'
                        }`}
                      >
                        <p className="whitespace-pre-line">{mainText || msg.text}</p>

                        {/* Vietnamese Feedback Card if provided by AI */}
                        {feedbackText && (
                          <div className="mt-2.5 rounded-xl border border-amber-200/90 bg-amber-50/90 p-2.5 text-xs text-amber-950 shadow-2xs">
                            <div className="flex items-center gap-1.5 font-bold text-amber-800 mb-1">
                              <Lightbulb size={13} className="text-amber-600 fill-amber-500" />
                              <span>Góp ý tiếng Việt:</span>
                            </div>
                            <p className="leading-relaxed font-normal whitespace-pre-line text-amber-900">
                              {feedbackText}
                            </p>
                          </div>
                        )}

                        {/* Real-time Vietnamese Translation */}
                        {translatedMessages[msg.id] && (
                          <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-brand-700 bg-brand-50/70 p-2.5 rounded-xl">
                            <div className="flex items-center gap-1 font-semibold text-brand-800 mb-0.5 text-[11px]">
                              <Languages size={11} />
                              <span>Bản dịch tiếng Việt:</span>
                            </div>
                            <p className="italic leading-relaxed">{translatedMessages[msg.id]}</p>
                          </div>
                        )}
                      </div>

                      {/* Sub utility buttons for AI messages */}
                      {msg.sender === 'ai' && (
                        <div className="flex flex-wrap items-center gap-1.5 pl-1 pt-1 text-[11px] text-slate-500">
                          <button
                            type="button"
                            onClick={() => speakText(mainText || msg.text, 1.0)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-colors shadow-2xs cursor-pointer"
                            title="Nghe phát âm chuẩn (1.0x)"
                          >
                            <Volume2 size={12} className="text-brand-600" />
                            <span>Nghe</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => speakText(mainText || msg.text, 0.75)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-colors shadow-2xs cursor-pointer"
                            title="Nghe phát âm chậm (0.75x)"
                          >
                            <span>🐢 Chậm</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => translateToVietnamese(msg.id, mainText || msg.text)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors shadow-2xs cursor-pointer ${
                              translatedMessages[msg.id]
                                ? 'bg-brand-50 text-brand-700 border-brand-200 font-medium'
                                : 'bg-white text-slate-600 border-slate-200/80 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200'
                            }`}
                            title="Dịch câu nói sang tiếng Việt"
                          >
                            {translatingId === msg.id ? (
                              <Loader2 size={12} className="animate-spin text-brand-600" />
                            ) : (
                              <Languages size={12} className="text-slate-500" />
                            )}
                            <span>{translatedMessages[msg.id] ? 'Ẩn dịch' : 'Dịch nghĩa'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg.id, mainText || msg.text)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200/80 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors shadow-2xs cursor-pointer"
                            title="Sao chép nội dung"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check size={12} className="text-emerald-600" />
                                <span className="text-emerald-600 font-medium">Đã chép</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Chép</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          ))}

          {/* AI Typing Indicator Bouncing Dots Animation */}
          {isAiReplying && (
            <div className="flex items-center gap-3 mr-auto animate-in fade-in duration-200">
              <div className="h-8 w-8 shrink-0 rounded-full bg-brand-100 text-brand-700 border border-brand-200 flex items-center justify-center text-xs font-bold shadow-xs">
                {scenario.partnerAvatarUrl ? (
                  <img
                    src={scenario.partnerAvatarUrl}
                    alt={scenario.partnerName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  (scenario.partnerName || 'P')[0]
                )}
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 text-slate-600 border border-slate-200/90 shadow-2xs flex items-center gap-2 rounded-tl-xs">
                <span className="text-xs font-medium text-slate-500">
                  {scenario.partnerName || 'AI'} đang trả lời
                </span>
                <div className="flex items-center gap-1 ml-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Interactive Area */}
        <div className="border-t border-slate-200/90 bg-white p-5 space-y-3 shrink-0">
          {/* Suggested Expressions Pills ĐỘNG theo từng lượt thoại */}
          {currentSuggestions && currentSuggestions.length > 0 && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                  <Lightbulb size={12} className="text-amber-500 fill-amber-400" />
                  <span>Gợi ý trả lời cho lượt này:</span>
                </p>
                <span className="text-[10px] text-slate-400">Bấm gợi ý để điền vào câu trả lời</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentSuggestions.map((kw, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleUseKeyword(kw)}
                    className="rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 active:scale-95 px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
                    title="Bấm để đưa câu này vào ô thoại"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input & Record Controls */}
          <div className="flex items-center gap-2.5 pt-1">
            {/* Big Mic Button */}
            <button
              type="button"
              onClick={toggleRecording}
              className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-300 shadow-md cursor-pointer ${
                isRecording
                  ? 'bg-rose-500 text-white ring-4 ring-rose-200 animate-pulse'
                  : 'bg-brand-600 hover:bg-brand-700 active:scale-95 text-white shadow-brand-500/25'
              }`}
              title={isRecording ? 'Đang nghe... Bấm để dừng' : 'Bấm để nói bằng Microphone'}
            >
              {isRecording ? <MicOff size={19} /> : <Mic size={19} />}
            </button>

            {/* Fallback Text Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isRecording ? 'Đang lắng nghe giọng nói của bạn...' : 'Nói hoặc gõ câu trả lời của bạn tại đây...'}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 shadow-2xs pr-12 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isAiReplying}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-xl bg-brand-600 hover:bg-brand-700 p-2 text-white disabled:opacity-30 disabled:hover:bg-brand-600 transition-colors cursor-pointer shadow-2xs"
              >
                <Send size={15} />
              </button>
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-400">
            {isRecording
              ? '🎙️ Đang thu âm... Hãy nói to, rõ ràng vào microphone để hệ thống nhận dạng'
              : 'Nhấn vào Micro để nói hoặc gõ phím để gửi phản hồi đàm thoại cùng trợ lý AI'}
          </p>
        </div>
      </div>
    </div>
  )
}

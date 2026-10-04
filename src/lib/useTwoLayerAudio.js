import { useState, useEffect, useCallback, useRef } from 'react'
import { playTwoLayerAudio, stopAllTwoLayerAudio } from './twoLayerAudio'

/**
 * Hook quản lý phát âm thanh 2 tầng (Audio link BE + Web Speech fallback)
 */
export function useTwoLayerAudio() {
  const [playingId, setPlayingId] = useState(null)
  const [activeLayer, setActiveLayer] = useState(null) // 'audio' | 'speech' | null
  const stopRef = useRef(null)

  const stop = useCallback(() => {
    if (stopRef.current) {
      stopRef.current()
      stopRef.current = null
    }
    stopAllTwoLayerAudio()
    setPlayingId(null)
    setActiveLayer(null)
  }, [])

  const play = useCallback((id, { audioUrl, fallbackText, lang = 'en-US', rate = 0.9 }) => {
    // Nếu đang phát chính câu này thì bấm lần 2 sẽ tạm dừng
    if (playingId === id) {
      stop()
      return
    }

    stop()
    setPlayingId(id)

    stopRef.current = playTwoLayerAudio({
      audioUrl,
      fallbackText,
      lang,
      rate,
      onStart: (layer) => {
        setActiveLayer(layer)
      },
      onEnd: () => {
        setPlayingId(null)
        setActiveLayer(null)
        stopRef.current = null
      },
      onError: () => {
        setPlayingId(null)
        setActiveLayer(null)
        stopRef.current = null
      },
    })
  }, [playingId, stop])

  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  return {
    playingId,
    activeLayer,
    isPlaying: Boolean(playingId),
    play,
    stop,
  }
}

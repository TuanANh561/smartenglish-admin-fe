import { afterEach, describe, expect, it, vi } from 'vitest'
import { playListeningLessonFull, seekListeningAudio, stopAudio } from './ipaHelper'

class FakeAudio {
  constructor(src) {
    this.src = src
    this.currentTime = 0
    this.duration = NaN
  }
  play() {
    return Promise.resolve()
  }
  pause() {}
  load() {}
  addEventListener() {}
  removeAttribute() {}
}

describe('tua bài nghe bằng file audio', () => {
  afterEach(() => {
    stopAudio()
    vi.unstubAllGlobals()
  })

  it('tua đúng vị trí trên file đang phát và báo tiến độ thật', () => {
    let created
    vi.stubGlobal('Audio', function Audio(src) {
      created = new FakeAudio(src)
      return created
    })
    const onProgress = vi.fn()
    playListeningLessonFull({ audioUrl: 'https://cdn.test/a.mp3' }, null, { onProgress })

    created.duration = 95
    created.onloadedmetadata()
    expect(onProgress).toHaveBeenLastCalledWith({ currentTime: 0, duration: 95 })

    expect(seekListeningAudio(42.5)).toBe(true)
    expect(created.currentTime).toBe(42.5)
    created.ontimeupdate()
    expect(onProgress).toHaveBeenLastCalledWith({ currentTime: 42.5, duration: 95 })

    seekListeningAudio(500)
    expect(created.currentTime).toBe(95)
  })

  it('phát từ vị trí được chọn khi bài chưa phát', () => {
    let created
    vi.stubGlobal('Audio', function Audio(src) {
      created = new FakeAudio(src)
      return created
    })
    playListeningLessonFull({ audioUrl: 'https://cdn.test/a.mp3' }, null, { startAt: 30 })
    created.duration = 60
    created.onloadedmetadata()
    expect(created.currentTime).toBe(30)
  })

  it('không có file thì không tua được', () => {
    stopAudio()
    expect(seekListeningAudio(10)).toBe(false)
  })
})

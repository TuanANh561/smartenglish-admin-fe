let activeOwner = null
let activeStop = null

export function claimAppAudio(owner, stop) {
  if (activeOwner !== owner && activeStop) {
    try {
      activeStop()
    } catch {
      // Cleanup is best-effort.
    }
  }
  activeOwner = owner
  activeStop = stop
}

export function releaseAppAudio(owner) {
  if (activeOwner === owner) {
    activeOwner = null
    activeStop = null
  }
}

export function stopAllAppAudio() {
  const stop = activeStop
  activeOwner = null
  activeStop = null
  try {
    stop?.()
  } catch {
    // Cleanup is best-effort.
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel()
    } catch {
      // Cleanup is best-effort.
    }
  }
}

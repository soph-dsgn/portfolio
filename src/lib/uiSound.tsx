import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocale } from '../i18n/locale'
import { SoundContext, useUISound, type SoundKind } from './soundContext'

/* Interface sounds, synthesised with Web Audio (no audio files): soft digital ticks on hover, a short
   "clack" on press, a zip when a sticker is peeled and a thud when it sticks back, a whoosh for previews.
   Every play detunes slightly at random so repeated hovers never sound mechanical.
   Sound is on by default and starts after the first click or key press (browsers require a gesture);
   the speaker toggle next to the language switch turns it off and the choice is remembered. */

const soundKey = 'portfolio.sound'
const jitter = (amount: number) => 1 + (Math.random() * 2 - 1) * amount

type Voice = { audio: AudioContext; out: GainNode; noise: AudioBuffer }

function tone({ audio, out }: Voice, at: number, { from, to = from, length, volume, type = 'sine' }: {
  from: number; to?: number; length: number; volume: number; type?: OscillatorType
}) {
  const oscillator = audio.createOscillator(), gain = audio.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(from, at)
  oscillator.frequency.exponentialRampToValueAtTime(to, at + length)
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.004)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length)
  oscillator.connect(gain).connect(out)
  oscillator.start(at); oscillator.stop(at + length + 0.02)
}

function hiss({ audio, out, noise }: Voice, at: number, { filter = 'bandpass', from, to = from, q = 1, length, volume }: {
  filter?: BiquadFilterType; from: number; to?: number; q?: number; length: number; volume: number
}) {
  const source = audio.createBufferSource(), band = audio.createBiquadFilter(), gain = audio.createGain()
  source.buffer = noise
  band.type = filter; band.Q.value = q
  band.frequency.setValueAtTime(from, at)
  band.frequency.exponentialRampToValueAtTime(to, at + length)
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length)
  source.connect(band).connect(gain).connect(out)
  source.start(at, Math.random() * 0.5); source.stop(at + length + 0.02)
}

const recipes: Record<SoundKind, (voice: Voice, at: number) => void> = {
  hover: (v, at) => {
    const p = jitter(0.06)
    tone(v, at, { from: 1100 * p, to: 950 * p, length: 0.03, volume: 0.016 })
  },
  click: (v, at) => {
    const p = jitter(0.04)
    hiss(v, at, { from: 2400 * p, to: 1800 * p, q: 1.4, length: 0.03, volume: 0.07 })
    tone(v, at, { from: 220 * p, to: 110 * p, length: 0.07, volume: 0.05 })
  },
  switch: (v, at) => {
    const p = jitter(0.03)
    tone(v, at, { from: 660 * p, length: 0.07, volume: 0.035, type: 'triangle' })
    tone(v, at + 0.055, { from: 990 * p, length: 0.09, volume: 0.03, type: 'triangle' })
  },
  peel: (v, at) => {
    const p = jitter(0.06)
    hiss(v, at, { from: 700 * p, to: 3600 * p, q: 2.5, length: 0.2, volume: 0.05 })
    tone(v, at + 0.02, { from: 420 * p, to: 760 * p, length: 0.12, volume: 0.012 })
  },
  stick: (v, at) => {
    const p = jitter(0.05)
    tone(v, at, { from: 150 * p, to: 70 * p, length: 0.11, volume: 0.07 })
    hiss(v, at, { filter: 'lowpass', from: 900, to: 300, length: 0.05, volume: 0.05 })
  },
  open: (v, at) => {
    hiss(v, at, { filter: 'lowpass', from: 300, to: 2600, length: 0.24, volume: 0.035 })
    tone(v, at + 0.03, { from: 520, to: 780, length: 0.18, volume: 0.018 })
  },
  close: (v, at) => {
    hiss(v, at, { filter: 'lowpass', from: 2400, to: 280, length: 0.2, volume: 0.03 })
    tone(v, at, { from: 760, to: 500, length: 0.14, volume: 0.016 })
  },
  on: (v, at) => {
    tone(v, at, { from: 880, length: 0.12, volume: 0.03 })
    tone(v, at + 0.07, { from: 1320, length: 0.16, volume: 0.026 })
  },
}

/** Speaker icon toggle; sits next to the language switch. */
export function SoundControl() {
  const { enabled, toggle } = useUISound()
  const { locale } = useLocale()
  const label = locale === 'en' ? 'Interface sounds' : 'Звуки интерфейса'
  return <button type="button" className="sc-sound" data-sound-toggle aria-pressed={enabled} aria-label={label} title={label} onClick={toggle}>
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z" fill="currentColor" />
      {enabled ? <><path d="M15.5 9a4 4 0 0 1 0 6" /><path d="M18 6.5a7.5 7.5 0 0 1 0 11" /></> : <path d="m16 9.5 5 5m0-5-5 5" />}
    </svg>
  </button>
}

export function UISoundProvider({ children }: { children: ReactNode }) {
  const voice = useRef<Voice | null>(null)
  const last = useRef<Partial<Record<SoundKind, number>>>({})
  const lastAny = useRef(-Infinity)
  const [enabled, setEnabled] = useState(() => {
    try { return localStorage.getItem(soundKey) !== 'off' } catch { return true }
  })

  const unlock = useCallback(() => {
    try {
      if (!voice.current) {
        const audio = new AudioContext({ latencyHint: 'interactive' })
        // Output chain: a gentle low-pass removes the hiss above ~7 kHz and a compressor keeps
        // overlapping sounds from summing into clipping (heard as a harsh, high whine).
        const out = audio.createGain(), tame = audio.createBiquadFilter(), limit = audio.createDynamicsCompressor()
        out.gain.value = 0.8
        tame.type = 'lowpass'; tame.frequency.value = 7000
        limit.threshold.value = -18; limit.knee.value = 12; limit.ratio.value = 8; limit.attack.value = 0.002; limit.release.value = 0.12
        out.connect(tame).connect(limit).connect(audio.destination)
        const noise = audio.createBuffer(1, audio.sampleRate, audio.sampleRate)
        const data = noise.getChannelData(0)
        for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1
        voice.current = { audio, out, noise }
      }
      if (voice.current.audio.state === 'suspended') void voice.current.audio.resume().catch(() => {})
    } catch { /* Audio is optional. */ }
  }, [])

  const play = useCallback((kind: SoundKind) => {
    const current = voice.current
    if (!enabled || current?.audio.state !== 'running' || document.hidden) return
    // Each kind has its own cooldown, and any sound waits a little after the previous one,
    // so fast pointer sweeps and drags never stack into a buzz.
    const now = performance.now(), gap = kind === 'hover' ? 110 : 70
    if (now - (last.current[kind] ?? -Infinity) < gap || now - lastAny.current < 35) return
    last.current[kind] = now; lastAny.current = now
    recipes[kind](current, current.audio.currentTime + 0.01)
  }, [enabled])

  const toggle = () => {
    const next = !enabled
    if (next) { unlock(); window.setTimeout(() => { if (voice.current?.audio.state === 'running') recipes.on(voice.current, voice.current.audio.currentTime + 0.01) }, 30) }
    else if (voice.current?.audio.state === 'running') void voice.current.audio.suspend().catch(() => {})
    setEnabled(next)
    try { localStorage.setItem(soundKey, next ? 'on' : 'off') } catch { /* Session preference still works. */ }
  }

  useEffect(() => {
    if (!enabled) return
    // The first gesture unlocks audio; until then browsers keep the context suspended.
    const gesture = () => unlock()
    const control = (target: EventTarget | null) => target instanceof Element
      ? target.closest<HTMLElement>('a[href], button, [role="button"], summary, label')
      : null
    const onClick = (event: MouseEvent) => {
      const element = control(event.target)
      if (!element || element.matches(':disabled, [aria-disabled="true"], [data-sound-toggle], [data-sound-skip], [data-sound-skip] *')) return
      play(element.matches('[aria-pressed], [role="switch"], [data-sound-switch], .language-selector button') ? 'switch' : 'click')
    }
    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.buttons) return
      const element = control(event.target)
      if (!element || element.matches(':disabled')) return
      if (event.relatedTarget instanceof Node && element.contains(event.relatedTarget)) return
      play('hover')
    }
    // A context left running in a background tab can glitch when the tab returns; pause it while hidden.
    const visibility = () => {
      const audio = voice.current?.audio
      if (!audio) return
      if (document.hidden) { if (audio.state === 'running') void audio.suspend().catch(() => {}) }
      else if (audio.state === 'suspended') void audio.resume().catch(() => {})
    }
    document.addEventListener('visibilitychange', visibility)
    document.addEventListener('pointerdown', gesture, true)
    document.addEventListener('keydown', gesture, true)
    document.addEventListener('click', onClick, true)
    document.addEventListener('pointerover', onPointerOver)
    return () => {
      document.removeEventListener('pointerdown', gesture, true)
      document.removeEventListener('keydown', gesture, true)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('pointerover', onPointerOver)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [enabled, play, unlock])

  useEffect(() => () => { void voice.current?.audio.close() }, [])

  return <SoundContext.Provider value={{ enabled, toggle, play }}>{children}</SoundContext.Provider>
}

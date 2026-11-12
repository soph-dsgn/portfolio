import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocale } from '../i18n/locale'
import { SoundContext, useUISound, type SoundKind } from './soundContext'

const soundKey = 'portfolio.sound'

export function SoundControl() {
  const { enabled, toggle } = useUISound()
  const { locale } = useLocale()
  return <button type="button" className="story-sound" data-sound-toggle aria-pressed={enabled} onClick={toggle}>
    <span aria-hidden="true" />{locale === 'en' ? (enabled ? 'Sound on' : 'Sound off') : (enabled ? 'Звук вкл.' : 'Звук выкл.')}
  </button>
}

function makeTone(context: AudioContext, frequency: number, start: number, duration: number, volume: number) {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, start)
  oscillator.frequency.exponentialRampToValueAtTime(frequency * .92, start + duration)
  gain.gain.setValueAtTime(.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + .008)
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(start)
  oscillator.stop(start + duration + .01)
}

export function UISoundProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<AudioContext | null>(null)
  const lastSound = useRef(-Infinity)
  const [enabled, setEnabled] = useState(() => {
    try { return localStorage.getItem(soundKey) === 'on' } catch { return false }
  })

  const unlock = useCallback(() => {
    try {
      audioRef.current ??= new AudioContext({ latencyHint: 'interactive' })
      if (audioRef.current.state === 'suspended') void audioRef.current.resume().catch(() => {})
    } catch { /* Audio is optional. */ }
  }, [])

  const play = useCallback((kind: SoundKind) => {
    const audio = audioRef.current
    if (!enabled || audio?.state !== 'running' || performance.now() - lastSound.current < 85) return
    lastSound.current = performance.now()
    const now = audio.currentTime + .004
    if (kind === 'switch') {
      makeTone(audio, 360, now, .075, .018)
      makeTone(audio, 540, now + .045, .085, .014)
    } else if (kind === 'click') {
      makeTone(audio, 430, now, .055, .012)
    } else {
      makeTone(audio, kind === 'chip' ? 245 : 490, now, .045, .006)
    }
  }, [enabled])

  const toggle = () => {
    if (!enabled) unlock()
    else if (audioRef.current?.state === 'running') void audioRef.current.suspend().catch(() => {})
    setEnabled(!enabled)
    try { localStorage.setItem(soundKey, enabled ? 'off' : 'on') } catch { /* Session preference still works. */ }
  }

  useEffect(() => {
    if (!enabled) return
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return
      const control = event.target.closest<HTMLElement>('a, button, [role="button"]')
      if (!control || control.matches(':disabled, [aria-disabled="true"], [data-sound-toggle]')) return
      unlock()
      const switched = control.matches('[aria-pressed], [role="switch"], .canvas-zone-indicator button, .language-selector button')
      play(switched ? 'switch' : 'click')
    }
    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !(event.target instanceof Element)) return
      const target = event.target.closest('[data-sound-hover]')
      if (target && !(event.relatedTarget instanceof Node && target.contains(event.relatedTarget))) play('hover')
    }
    document.addEventListener('click', onClick, true)
    document.addEventListener('pointerover', onPointerOver)
    return () => {
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('pointerover', onPointerOver)
    }
  }, [enabled, play, unlock])

  useEffect(() => () => { void audioRef.current?.close() }, [])

  return <SoundContext.Provider value={{ enabled, toggle, play }}>{children}</SoundContext.Provider>
}

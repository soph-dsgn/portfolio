import { useCallback, useEffect, useRef, type ReactNode } from 'react'

type SoundKind = 'click' | 'switch'

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

  const context = useCallback(() => {
    if (!audioRef.current) audioRef.current = new AudioContext({ latencyHint: 'interactive' })
    if (audioRef.current.state === 'suspended') void audioRef.current.resume()
    return audioRef.current
  }, [])

  const play = useCallback((kind: SoundKind) => {
    const audio = context()
    const now = audio.currentTime + .004
    if (kind === 'switch') {
      makeTone(audio, 360, now, .075, .018)
      makeTone(audio, 540, now + .045, .085, .014)
    } else {
      makeTone(audio, 430, now, .055, .012)
    }
  }, [context])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return
      const control = event.target.closest<HTMLElement>('a, button, [role="button"]')
      if (!control || control.matches(':disabled, [aria-disabled="true"]')) return
      const switched = control.matches('[aria-pressed], [role="switch"], .canvas-zone-indicator button, .language-selector button')
      play(switched ? 'switch' : 'click')
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [play])

  useEffect(() => () => { void audioRef.current?.close() }, [])

  return children
}

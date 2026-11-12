import { createContext, useContext } from 'react'

export type SoundKind = 'hover' | 'click' | 'switch' | 'peel' | 'stick' | 'open' | 'close' | 'on'
export const SoundContext = createContext({ enabled: false, toggle: () => {}, play: (_kind: SoundKind) => {} })
export const useUISound = () => useContext(SoundContext)

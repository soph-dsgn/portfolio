import { createContext, useContext } from 'react'

export type SoundKind = 'click' | 'switch' | 'hover' | 'chip'
export const SoundContext = createContext({ enabled: false, toggle: () => {}, play: (_kind: SoundKind) => {} })
export const useUISound = () => useContext(SoundContext)

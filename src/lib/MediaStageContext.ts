import { createContext } from 'react'

// No provider on project covers: their entrance is owned by ProjectCard.
export const MediaStageContext = createContext<boolean | null>(null)

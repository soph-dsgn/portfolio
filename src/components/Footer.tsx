import { StoryFooter } from './StoryChrome'

export function Footer({ variant = 'page' }: { variant?: 'page' | 'case' }) {
  return <StoryFooter location={variant} />
}

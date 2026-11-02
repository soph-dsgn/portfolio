import { ArrowIcon } from './ArrowIcon'

export type IconName =
  | 'external'
  | 'arrow-up-right'
  | 'back'
  | 'forward'
  | 'chevron-down'
  | 'telegram'
  | 'document'
  | 'linkedin'
  | 'mail'
  | 'heart'
  | 'check'
  | 'search'
  | 'filter'
  | 'plus'
  | 'grid'
  | 'clock'
  | 'user'
  | 'card'
  | 'backspace'
  | 'status'
  | 'play'
  | 'pause'
  | 'replay'
  | 'menu'
  | 'close'
  | 'arrow-left'

// Rounded, filled silhouettes share a single optical size.
const paths: Record<Exclude<IconName, 'external' | 'arrow-up-right'>, string> = {
  back: 'M10.4 4.4a1.5 1.5 0 0 1 0 2.2L6.5 10.5H20a1.5 1.5 0 0 1 0 3H6.5l3.9 3.9a1.5 1.5 0 0 1-2.1 2.2l-6.5-6.5a1.5 1.5 0 0 1 0-2.2l6.5-6.5a1.5 1.5 0 0 1 2.1 0Z',
  forward: 'M13.6 4.4a1.5 1.5 0 0 0 0 2.2l3.9 3.9H4a1.5 1.5 0 0 0 0 3h13.5l-3.9 3.9a1.5 1.5 0 0 0 2.1 2.2l6.5-6.5a1.5 1.5 0 0 0 0-2.2l-6.5-6.5a1.5 1.5 0 0 0-2.1 0Z',
  'chevron-down': 'M5 8a1.5 1.5 0 0 1 2.1 0l4.9 4.9L16.9 8a1.5 1.5 0 0 1 2.1 2.1l-6 6a1.5 1.5 0 0 1-2.1 0l-6-6A1.5 1.5 0 0 1 5 8Z',
  telegram: 'M21.7 3.3c.5.2.7.7.5 1.5l-3.3 15.4c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.3-8.4c.4-.4-.1-.6-.6-.3L6.3 13.7l-5-1.6c-1.1-.3-1.1-1.1.2-1.6L20.8 3c.4-.1.7 0 .9.3Z',
  document: 'M6 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V9h-5a2 2 0 0 1-2-2V2H6Zm10 .6V7h4.4L16 2.6ZM8 12a1 1 0 0 0 0 2h8a1 1 0 0 0 0-2H8Zm0 4a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2H8Z',
  linkedin: 'M5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H5Zm.7 5.1a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM6 10h2.5v8H6v-8Zm4.5 0H13v1.1c.6-.9 1.4-1.3 2.6-1.3 2.3 0 3.4 1.4 3.4 3.8V18h-2.5v-4c0-1.4-.4-2-1.5-2-1.2 0-2 .8-2 2.2V18h-2.5v-8Z',
  mail: 'M5 4a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H5Zm-.3 3.2a1 1 0 0 1 1.4-.1l5.9 4.7 5.9-4.7a1 1 0 1 1 1.2 1.6l-6.5 5.2a1 1 0 0 1-1.2 0L4.9 8.7a1 1 0 0 1-.2-1.5Z',
  heart:
    'M12 21c-.4 0-.8-.2-1.1-.4C7.7 17.8 2 13.5 2 8.5A5.5 5.5 0 0 1 12 5.3a5.5 5.5 0 0 1 10 3.2c0 5-5.7 9.3-8.9 12.1-.3.2-.7.4-1.1.4Z',
  check:
    'M19.9 5.9a1.5 1.5 0 0 1 .2 2.1l-9 11a1.5 1.5 0 0 1-2.2.1l-5-5a1.5 1.5 0 0 1 2.2-2.2l3.8 3.8 7.9-9.6a1.5 1.5 0 0 1 2.1-.2Z',
  search:
    'M10 2a8 8 0 1 0 4.5 14.6l5 5a1.5 1.5 0 0 0 2.1-2.1l-5-5A8 8 0 0 0 10 2Zm0 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z',
  filter:
    'M3 5a1.5 1.5 0 0 0 0 3h18a1.5 1.5 0 0 0 0-3H3Zm4 5.5a1.5 1.5 0 0 0 0 3h10a1.5 1.5 0 0 0 0-3H7Zm3 5.5a1.5 1.5 0 0 0 0 3h4a1.5 1.5 0 0 0 0-3h-4Z',
  plus: 'M12 3a1.5 1.5 0 0 0-1.5 1.5v6h-6a1.5 1.5 0 0 0 0 3h6v6a1.5 1.5 0 0 0 3 0v-6h6a1.5 1.5 0 0 0 0-3h-6v-6A1.5 1.5 0 0 0 12 3Z',
  grid: 'M5 3a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Zm10 0a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-4ZM5 13a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5Zm10 0a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-4Z',
  clock:
    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 5a1 1 0 0 1 2 0v4.4l3.5 2a1 1 0 0 1-1 1.8l-4-2.3a1 1 0 0 1-.5-.9V7Z',
  user: 'M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 12c-5 0-8 2.5-8 5a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3c0-2.5-3-5-8-5Z',
  card: 'M5 3a3 3 0 0 0-3 3v1h20V6a3 3 0 0 0-3-3H5ZM2 10v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-8H2Zm4 5h4a1 1 0 0 1 0 2H6a1 1 0 0 1 0-2Z',
  backspace:
    'M9 4a3 3 0 0 0-2.3 1.1l-5 6a1.5 1.5 0 0 0 0 1.8l5 6A3 3 0 0 0 9 20h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H9Zm2.3 4.3L14 11l2.7-2.7a1 1 0 1 1 1.4 1.4L15.4 12l2.7 2.7a1 1 0 1 1-1.4 1.4L14 13.4l-2.7 2.7a1 1 0 1 1-1.4-1.4l2.7-2.7-2.7-2.3a1 1 0 1 1 1.4-1.4Z',
  status:
    'M3 15a1 1 0 0 0-1 1v4h3v-4a1 1 0 0 0-1-1H3Zm5-5a1 1 0 0 0-1 1v9h3v-9a1 1 0 0 0-1-1H8Zm5-5a1 1 0 0 0-1 1v14h3V6a1 1 0 0 0-1-1h-1Zm5-3a1 1 0 0 0-1 1v17h3V3a1 1 0 0 0-1-1h-1Z',
  play: 'M7 3.5c0-.8.9-1.3 1.6-.9l12.1 7.6a2.1 2.1 0 0 1 0 3.6L8.6 21.4c-.7.4-1.6-.1-1.6-.9v-17Z',
  pause: 'M6 3a2 2 0 0 0-2 2v14a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2Zm12 0a2 2 0 0 0-2 2v14a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2Z',
  replay: 'M12 3a9 9 0 1 0 8.8 11 1.5 1.5 0 1 0-2.9-.7A6 6 0 1 1 12 6c1.8 0 3.4.8 4.5 2H14a1.5 1.5 0 0 0 0 3.1h6a1.5 1.5 0 0 0 1.5-1.6V3.7a1.5 1.5 0 0 0-3 0v1.8A8.9 8.9 0 0 0 12 3Z',
  menu: 'M4 6.5h16M4 12h16M4 17.5h16',
  close: 'M5 5l14 14M19 5 5 19',
  'arrow-left': 'M19 12H5m0 0 6-6m-6 6 6 6',
}

export function Icon({
  name,
  className = '',
}: {
  name: IconName
  className?: string
}) {
  if (name === 'external') return <ArrowIcon direction="up-right" decorative className={`icon ${className}`} />
  if (name === 'arrow-up-right') return <svg className={`icon ${className}`} width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M4.5 19.5 19.5 4.5M8 4.5h11.5V16" />
  </svg>
  const isStroke = name === 'menu' || name === 'close' || name === 'arrow-left'
  return (
    <svg
      className={`icon ${className}`}
      data-icon={name}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={isStroke ? 'none' : 'currentColor'}
      stroke={isStroke ? 'currentColor' : undefined}
      strokeWidth={isStroke ? 2 : undefined}
      strokeLinecap={isStroke ? 'round' : undefined}
      strokeLinejoin={isStroke ? 'round' : undefined}
      aria-hidden="true"
      focusable="false"
    >
      <path fillRule={isStroke ? undefined : 'evenodd'} clipRule={isStroke ? undefined : 'evenodd'} d={paths[name]} />
    </svg>
  )
}

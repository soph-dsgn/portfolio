import { useId } from 'react'
import { useLocale } from '../i18n/locale'
import { LayoutGroup, motion } from 'framer-motion'
import { useMotionSystem } from '../lib/motion'
import { NavigationLabel } from './NavigationLabel'
export function LanguageSelector() {
  const scope = useId()
  const { locale, setLocale } = useLocale()
  const { navInteraction: press } = useMotionSystem()
  return <LayoutGroup id={scope}><div className="language-selector" role="group" aria-label="Выбор языка">
    <motion.button {...press} type="button" lang="ru" aria-pressed={locale === 'ru'} onClick={() => setLocale('ru')}><NavigationLabel active={locale === 'ru'}>RU</NavigationLabel></motion.button>
    <motion.button {...press} type="button" lang="en" aria-pressed={locale === 'en'} onClick={() => setLocale('en')}><NavigationLabel active={locale === 'en'}>ENG</NavigationLabel></motion.button>
  </div></LayoutGroup>
}

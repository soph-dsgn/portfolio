import { motion } from 'framer-motion'
import { useAdaptivePress } from '../lib/useAdaptivePress'

type Option = { value: string; label: string }

export function SegmentedControl({
  label,
  value,
  options,
  controls,
  onChange,
}: {
  label: string
  value: string
  options: Option[]
  controls: string
  onChange: (value: string) => void
}) {
  const press = useAdaptivePress()
  return (
    <div
      className="segmented-group version-switch"
      role="group"
      aria-label={label}
    >
      {options.map((option) => (
        <motion.button {...press}
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          aria-controls={controls}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </motion.button>
      ))}
    </div>
  )
}

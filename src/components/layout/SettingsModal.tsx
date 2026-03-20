import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

export type PlannerLayoutPreset = 'compact' | 'normal' | 'comfort'

interface SettingsModalProps {
  open: boolean
  value: PlannerLayoutPreset
  onChange: (next: PlannerLayoutPreset) => void
  onClose: () => void
}

export const SettingsModal = ({ open, value, onChange, onClose }: SettingsModalProps) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <motion.div
            className="w-full max-w-md rounded-2xl border border-ink/10 bg-white/95 shadow-2xl backdrop-blur p-5"
            initial={{ y: 16, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="font-serif text-xl text-ink">Настройки</div>
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-full border border-ink/10 bg-white/80 grid place-items-center hover:bg-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-sm text-ink/60 mb-3">
              Размер шрифта и плотность строк для недельного разворота
            </div>

            <div className="grid grid-cols-3 gap-2">
              <PresetButton active={value === 'compact'} onClick={() => onChange('compact')}>
                XS
              </PresetButton>
              <PresetButton active={value === 'normal'} onClick={() => onChange('normal')}>
                M
              </PresetButton>
              <PresetButton active={value === 'comfort'} onClick={() => onChange('comfort')}>
                L
              </PresetButton>
            </div>

            <div className="mt-4 text-xs text-ink/50 leading-relaxed">
              XS — чтобы на неделе комфортно помещалось 20 строк. L — для более крупного чтения.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const PresetButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 rounded-xl border transition-all font-serif ${
        active ? 'border-[#642D90]/40 bg-[#642D90]/10 text-ink shadow-sm' : 'border-ink/10 bg-white text-ink/60 hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

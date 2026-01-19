import { motion } from 'framer-motion'
import { Languages } from 'lucide-react'
import type { Language } from '../i18n/translations'

interface LanguageSelectorProps {
  currentLanguage: Language
  onLanguageChange: (language: Language) => void
  darkMode: boolean
}

export default function LanguageSelector({
  currentLanguage,
  onLanguageChange,
  darkMode,
}: LanguageSelectorProps) {
  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ur', name: 'اردو', flag: '🇵🇰' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'tl', name: 'Tagalog', flag: '🇵🇭' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 1002,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 8px',
        background: darkMode
          ? 'rgba(42, 34, 32, 0.9)'
          : 'rgba(255, 255, 255, 0.9)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
      }}
    >
      <Languages size={18} color={darkMode ? '#f97316' : '#667eea'} />
      <select
        value={currentLanguage}
        onChange={(e) => onLanguageChange(e.target.value as Language)}
        style={{
          background: darkMode
            ? 'rgba(58, 47, 45, 0.8)'
            : 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '8px 12px',
          color: darkMode ? 'white' : '#2c3e50',
          fontSize: '0.95em',
          fontWeight: 500,
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          outline: 'none',
        }}
        aria-label="Select language"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </motion.div>
  )
}

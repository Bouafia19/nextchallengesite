import { createI18n } from 'vue-i18n'
import fr from '../locales/fr.json'
import en from '../locales/en.json'
import ar from '../locales/ar.json'

export const SUPPORTED_LOCALES = [
  { code: 'fr', name: 'Français', nativeName: 'Français', dir: 'ltr' },
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'ar', name: 'العربية', nativeName: 'العربية', dir: 'rtl' }
]

export const DEFAULT_LOCALE = 'fr'
export const STORAGE_KEY = 'nextchallenge_lang'

export const messages = {
  fr,
  en,
  ar
}

/**
 * Determine the initial language:
 * - First-time visitor -> French (default)
 * - Saved valid preference in localStorage -> restored
 * - Invalid or corrupted preference -> falls back to French
 * - Never override explicit selection with browser language
 */
export function getInitialLocale() {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && ['fr', 'en', 'ar'].includes(saved)) {
      return saved
    }
  } catch (err) {
    console.warn('[i18n] Could not read localStorage preference:', err)
  }
  return DEFAULT_LOCALE
}

/**
 * Apply HTML document attributes, CSS RTL classes, and SEO metadata
 */
export function applyLocaleToDocument(lang) {
  if (typeof document === 'undefined') return
  const isRtl = lang === 'ar'

  // Update HTML tag attributes
  document.documentElement.lang = lang
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr'

  if (isRtl) {
    document.documentElement.classList.add('is-rtl')
    document.body.classList.add('is-rtl')
  } else {
    document.documentElement.classList.remove('is-rtl')
    document.body.classList.remove('is-rtl')
  }

  // Update Document Title and SEO Metadata
  const langMessages = messages[lang]
  if (langMessages && langMessages.meta) {
    const meta = langMessages.meta
    if (meta.title) {
      document.title = meta.title
    }
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc && meta.description) {
      metaDesc.setAttribute('content', meta.description)
    }
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle && meta.title) {
      ogTitle.setAttribute('content', meta.title)
    }
    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc && meta.description) {
      ogDesc.setAttribute('content', meta.description)
    }
    const ogLocale = document.querySelector('meta[property="og:locale"]')
    if (ogLocale && meta.ogLocale) {
      ogLocale.setAttribute('content', meta.ogLocale)
    }
    const twTitle = document.querySelector('meta[name="twitter:title"]')
    if (twTitle && meta.title) {
      twTitle.setAttribute('content', meta.title)
    }
    const twDesc = document.querySelector('meta[name="twitter:description"]')
    if (twDesc && meta.description) {
      twDesc.setAttribute('content', meta.description)
    }
  }
}

const initialLocale = getInitialLocale()

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: DEFAULT_LOCALE,
  messages
})

// Initialize document state immediately on startup
if (typeof window !== 'undefined') {
  applyLocaleToDocument(initialLocale)
}

/**
 * Reactive function to switch language across the application
 */
export function switchLanguage(lang) {
  if (!['fr', 'en', 'ar'].includes(lang)) return
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch (err) {
    console.warn('[i18n] Could not persist language selection:', err)
  }
  i18n.global.locale.value = lang
  applyLocaleToDocument(lang)
}

export default i18n

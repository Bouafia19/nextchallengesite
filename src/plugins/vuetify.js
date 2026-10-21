import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'
import { useI18n } from 'vue-i18n'
import { i18n } from './i18n.js'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const nextChallengeDarkTheme = {
  dark: true,
  colors: {
    background: '#090d16',
    surface: '#101626',
    'surface-variant': '#1a2238',
    'surface-bright': '#232d47',
    primary: '#5b54e8',
    'primary-darken-1': '#463ec7',
    'primary-lighten-1': '#756ef0',
    secondary: '#14b8a6',
    'secondary-darken-1': '#0f766e',
    'secondary-lighten-1': '#2dd4bf',
    accent: '#8b5cf6',
    error: '#f43f5e',
    info: '#38bdf8',
    success: '#10b981',
    warning: '#f59e0b',
    onBackground: '#f8fafc',
    onSurface: '#f1f5f9'
  }
}

const nextChallengeLightTheme = {
  dark: false,
  colors: {
    background: '#f8fafc',
    surface: '#ffffff',
    'surface-variant': '#f1f5f9',
    'surface-bright': '#e2e8f0',
    primary: '#4f46e5',
    'primary-darken-1': '#4338ca',
    'primary-lighten-1': '#6366f1',
    secondary: '#0d9488',
    'secondary-darken-1': '#115e59',
    'secondary-lighten-1': '#14b8a6',
    accent: '#7c3aed',
    error: '#e11d48',
    info: '#0284c7',
    success: '#059669',
    warning: '#d97706',
    onBackground: '#0f172a',
    onSurface: '#1e293b'
  }
}

export default createVuetify({
  locale: {
    adapter: createVueI18nAdapter({ i18n, useI18n })
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  },
  theme: {
    defaultTheme: 'nextChallengeDark',
    themes: {
      nextChallengeDark: nextChallengeDarkTheme,
      nextChallengeLight: nextChallengeLightTheme
    }
  },
  defaults: {
    VBtn: {
      rounded: 'lg',
      elevation: 0,
      style: [{ textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' }]
    },
    VCard: {
      rounded: 'xl',
      elevation: 0
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary'
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary'
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary'
    },
    VChip: {
      rounded: 'lg'
    }
  }
})

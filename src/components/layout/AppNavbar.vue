<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTheme } from 'vuetify'
import { useI18n } from 'vue-i18n'
import BrandLogo from './BrandLogo.vue'
import LanguageSelector from '../ui/LanguageSelector.vue'
import { siteConfig } from '@/config/site.js'

const theme = useTheme()
const { t, locale } = useI18n()
const isScrolled = ref(false)
const drawer = ref(false)

const isRtl = computed(() => locale.value === 'ar')
const drawerLocation = computed(() => (isRtl.value ? 'left' : 'right'))

const toggleTheme = () => {
  theme.global.name.value =
    theme.global.name.value === 'nextChallengeDark' ? 'nextChallengeLight' : 'nextChallengeDark'
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const emit = defineEmits(['open-admin', 'navigate'])

const openAdminPortal = () => {
  drawer.value = false
  emit('open-admin')
  window.dispatchEvent(new CustomEvent('open-admin-portal'))
}

const navigateTo = (href) => {
  drawer.value = false
  emit('navigate', href)
  const target = document.querySelector(href)
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <header
    class="app-navbar"
    :class="{ 'app-navbar--scrolled': isScrolled }"
  >
    <div class="app-navbar__container">
      <!-- 1. Brand Logo / Site Title Area -->
      <div class="app-navbar__brand">
        <BrandLogo :size="40" />
      </div>

      <!-- 2. Desktop Navigation Links (Occupies strictly separate middle area, hidden on mobile) -->
      <nav class="app-navbar__nav align-center" aria-label="Main Navigation">
        <v-btn
          v-for="item in siteConfig.navLinks"
          :key="item.key"
          :href="item.href"
          variant="text"
          class="nav-link font-weight-medium"
          size="default"
          @click.prevent="navigateTo(item.href)"
        >
          {{ t('nav.' + item.key) }}
        </v-btn>
      </nav>

      <!-- 3. Desktop Action Controls (Language + Theme + Admin + CTA, hidden on mobile) -->
      <div class="app-navbar__actions align-center">
        <!-- Language Selector -->
        <LanguageSelector variant="menu" />

        <!-- Theme Toggle -->
        <v-btn
          icon
          variant="text"
          density="comfortable"
          :aria-label="theme.global.current.value.dark ? t('nav.themeLight') : t('nav.themeDark')"
          @click="toggleTheme"
        >
          <v-icon
            :icon="theme.global.current.value.dark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'"
            size="20"
          />
        </v-btn>

        <!-- Admin Portal Direct Access -->
        <v-tooltip text="Admin Portal" location="bottom">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              icon
              variant="text"
              density="comfortable"
              aria-label="Admin Portal"
              color="#38bdf8"
              @click="openAdminPortal"
            >
              <v-icon icon="mdi-shield-lock-outline" size="20" />
            </v-btn>
          </template>
        </v-tooltip>

        <!-- Prominent CTA: Let's Talk -->
        <v-btn
          href="#contact"
          color="primary"
          variant="flat"
          class="btn-shimmer nav-cta-btn font-weight-bold"
          size="default"
          prepend-icon="mdi-chat-processing-outline"
          @click.prevent="navigateTo('#contact')"
        >
          {{ t('nav.cta') }}
        </v-btn>
      </div>

      <!-- 4. Mobile Controls (Language + Theme Toggle + Accessible Drawer Hamburger, hidden on desktop) -->
      <div class="app-navbar__mobile align-center ga-1">
        <LanguageSelector variant="menu" />

        <v-btn
          icon
          variant="text"
          density="comfortable"
          :aria-label="theme.global.current.value.dark ? t('nav.themeLight') : t('nav.themeDark')"
          @click="toggleTheme"
        >
          <v-icon
            :icon="theme.global.current.value.dark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'"
            size="20"
          />
        </v-btn>

        <v-btn
          icon
          variant="text"
          density="comfortable"
          :aria-label="drawer ? t('nav.closeMenu') : t('nav.openMenu')"
          :aria-expanded="drawer ? 'true' : 'false'"
          aria-controls="mobile-nav-drawer"
          class="mobile-menu-toggle"
          @click="drawer = !drawer"
        >
          <v-icon :icon="drawer ? 'mdi-close' : 'mdi-menu'" size="26" />
        </v-btn>
      </div>
    </div>
  </header>

  <!-- Mobile Responsive Navigation Drawer -->
  <v-navigation-drawer
    id="mobile-nav-drawer"
    v-model="drawer"
    :location="drawerLocation"
    temporary
    width="320"
    class="mobile-drawer"
  >
    <div class="pa-5 d-flex flex-column h-100 justify-space-between">
      <div>
        <!-- Drawer Header -->
        <div class="d-flex align-center justify-space-between mb-4 pb-3 border-b">
          <BrandLogo :size="36" @click="drawer = false" />
          <v-btn
            icon="mdi-close"
            variant="text"
            density="comfortable"
            :aria-label="t('nav.closeMenu')"
            @click="drawer = false"
          />
        </div>

        <!-- Mobile Language Selector in Drawer -->
        <div class="mb-4 pb-4 border-b">
          <LanguageSelector variant="drawer" />
        </div>

        <!-- Navigation Links List -->
        <v-list density="comfortable" nav class="px-0">
          <v-list-item
            v-for="item in siteConfig.navLinks"
            :key="item.key"
            :value="item.key"
            rounded="lg"
            class="mb-1 mobile-nav-item"
            @click="navigateTo(item.href)"
          >
            <template #prepend>
              <v-icon
                :icon="
                  item.key === 'home' ? 'mdi-home-outline' :
                  item.key === 'services' ? 'mdi-briefcase-outline' :
                  item.key === 'products' ? 'mdi-cube-outline' :
                  item.key === 'courses' ? 'mdi-school-outline' :
                  item.key === 'capabilities' ? 'mdi-lightning-bolt-outline' :
                  item.key === 'whyUs' ? 'mdi-shield-star-outline' :
                  item.key === 'about' ? 'mdi-information-outline' : 'mdi-email-outline'
                "
                :class="isRtl ? 'ml-3' : 'mr-3'"
                size="20"
                color="primary"
              />
            </template>
            <v-list-item-title class="font-weight-semibold text-body-1">
              {{ t('nav.' + item.key) }}
            </v-list-item-title>
          </v-list-item>
          <!-- Admin Portal Link in Mobile Drawer -->
          <v-list-item
            rounded="lg"
            class="mb-1 mobile-nav-item"
            @click="openAdminPortal"
          >
            <template #prepend>
              <v-icon
                icon="mdi-shield-lock-outline"
                :class="isRtl ? 'ml-3' : 'mr-3'"
                size="20"
                color="#38bdf8"
              />
            </template>
            <v-list-item-title class="font-weight-semibold text-body-1 text-cyan-lighten-2">
              Admin Portal
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </div>

      <!-- Drawer Footer Contact Details & CTA -->
      <div class="pt-4 border-t">
        <div class="mb-4">
          <div class="text-caption text-medium-emphasis mb-2 font-weight-medium">
            {{ t('nav.directReach') }}
          </div>
          <a
            :href="siteConfig.phoneTel"
            class="d-flex align-center text-decoration-none text-body-2 mb-2 ga-2 ltr-text"
            dir="ltr"
          >
            <v-icon icon="mdi-phone-outline" size="16" color="secondary" />
            <span class="font-weight-medium text-high-emphasis">{{ siteConfig.phone }}</span>
          </a>
          <a
            :href="siteConfig.emailMailto"
            class="d-flex align-center text-decoration-none text-body-2 ga-2 ltr-text"
            dir="ltr"
          >
            <v-icon icon="mdi-email-outline" size="16" color="secondary" />
            <span class="font-weight-medium text-high-emphasis">{{ siteConfig.email }}</span>
          </a>
        </div>

        <v-btn
          block
          color="primary"
          variant="flat"
          size="large"
          prepend-icon="mdi-chat-processing-outline"
          class="btn-shimmer font-weight-bold"
          @click="navigateTo('#contact')"
        >
          {{ t('nav.cta') }}
        </v-btn>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
.app-navbar {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(9, 13, 22, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  width: 100%;
}

.v-theme--nextChallengeLight .app-navbar {
  background: rgba(255, 255, 255, 0.85);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.app-navbar--scrolled {
  background: rgba(9, 13, 22, 0.94);
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
  border-bottom: 1px solid rgba(91, 84, 232, 0.2);
}

.v-theme--nextChallengeLight .app-navbar--scrolled {
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.08);
}

/* Header Container: Full-width responsive flex container with generous max-width */
.app-navbar__container {
  width: 100%;
  max-width: 1536px;
  margin: 0 auto;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-sizing: border-box;
}

@media (min-width: 960px) {
  .app-navbar__container {
    padding: 12px 20px;
    gap: 16px;
  }
}

@media (min-width: 1280px) {
  .app-navbar__container {
    padding: 12px 28px;
    gap: 20px;
  }
}

@media (min-width: 1440px) {
  .app-navbar__container {
    padding: 12px 36px;
    gap: 28px;
  }
}

/* 1. Brand Logo: Locked flex-shrink: 0, guaranteed site title visibility */
.app-navbar__brand {
  flex-shrink: 0 !important;
  display: flex;
  align-items: center;
  z-index: 2;
}

/* 2. Navigation: Hidden on mobile (< 960px), strictly confined on desktop */
.app-navbar__nav {
  display: none !important;
}

@media (min-width: 960px) {
  .app-navbar__nav {
    display: flex !important;
    flex: 1 1 auto;
    min-width: 0;
    align-items: center;
    justify-content: center;
    gap: 2px;
    overflow: hidden;
  }
}

/* 3. Action Controls: Hidden on mobile (< 960px), desktop actions on >= 960px */
.app-navbar__actions {
  display: none !important;
}

@media (min-width: 960px) {
  .app-navbar__actions {
    display: flex !important;
    flex-shrink: 0 !important;
    align-items: center;
    gap: 8px;
    z-index: 2;
  }
}

@media (min-width: 1280px) {
  .app-navbar__actions {
    gap: 12px;
  }
}

/* 4. Mobile Controls: Displayed on mobile (< 960px), hidden on desktop (>= 960px) */
.app-navbar__mobile {
  display: flex !important;
  align-items: center;
  flex-shrink: 0 !important;
}

@media (min-width: 960px) {
  .app-navbar__mobile {
    display: none !important;
  }
}

/* Nav Link Base Styles */
.nav-link {
  color: rgba(255, 255, 255, 0.8) !important;
  font-size: 0.8125rem !important; /* 13px base */
  padding: 0 6px !important;
  height: 34px !important;
  min-width: auto !important;
  border-radius: 8px;
  white-space: nowrap;
  letter-spacing: -0.01em;
  transition: all 0.2s ease;
}

.v-theme--nextChallengeLight .nav-link {
  color: rgba(15, 23, 42, 0.8) !important;
}

.nav-link:hover {
  color: #ffffff !important;
  background: rgba(255, 255, 255, 0.08) !important;
}

.v-theme--nextChallengeLight .nav-link:hover {
  color: #4f46e5 !important;
  background: rgba(79, 70, 229, 0.08) !important;
}

.nav-link:focus-visible,
.mobile-menu-toggle:focus-visible,
.nav-cta-btn:focus-visible {
  outline: 2px solid #5b54e8 !important;
  outline-offset: 2px !important;
}

/* Tablet adjustments (960px - 1279px) */
@media (min-width: 960px) and (max-width: 1279px) {
  .app-navbar__nav {
    gap: 1px;
  }
  .nav-link {
    font-size: 0.8rem !important;
    padding: 0 5px !important;
    height: 32px !important;
  }
  /* On compact tablet, hide the redundant CTA button so all 8 links fit with generous margin */
  .nav-cta-btn {
    display: none !important;
  }
}

/* Desktop sizing (1280px - 1439px) */
@media (min-width: 1280px) {
  .app-navbar__nav {
    gap: 3px;
  }
  .nav-link {
    font-size: 0.875rem !important;
    padding: 0 9px !important;
    height: 36px !important;
  }
}

/* Large desktop (>= 1440px) */
@media (min-width: 1440px) {
  .app-navbar__nav {
    gap: 6px;
  }
  .nav-link {
    font-size: 0.925rem !important;
    padding: 0 12px !important;
    height: 38px !important;
  }
}

/* Nav CTA button */
.nav-cta-btn {
  padding: 0 18px !important;
  font-size: 0.875rem !important;
  height: 38px !important;
  white-space: nowrap;
}

@media (min-width: 1440px) {
  .nav-cta-btn {
    padding: 0 22px !important;
    font-size: 0.925rem !important;
    height: 40px !important;
  }
}

.mobile-drawer {
  background: rgba(16, 22, 38, 0.98) !important;
  backdrop-filter: blur(20px);
}

.v-theme--nextChallengeLight .mobile-drawer {
  background: rgba(255, 255, 255, 0.98) !important;
}

.mobile-nav-item:hover {
  background: rgba(91, 84, 232, 0.12) !important;
}
</style>

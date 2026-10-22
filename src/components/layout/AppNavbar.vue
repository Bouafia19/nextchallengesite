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
const drawerLocation = computed(() => isRtl.value ? 'left' : 'right')

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

const emit = defineEmits(['open-admin'])

const openAdminPortal = () => {
  drawer.value = false
  emit('open-admin')
  window.dispatchEvent(new CustomEvent('open-admin-portal'))
}

const navigateTo = (href) => {
  drawer.value = false
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
    <v-container class="d-flex align-center justify-space-between py-3 px-4 px-md-6">
      <!-- Brand Logo -->
      <BrandLogo :size="42" />

      <!-- Desktop Navigation Links -->
      <nav class="d-none d-md-flex align-center ga-1" aria-label="Main Navigation">
        <v-btn
          v-for="item in siteConfig.navLinks"
          :key="item.key"
          :href="item.href"
          variant="text"
          class="nav-link font-weight-medium px-3"
          size="default"
          @click.prevent="navigateTo(item.href)"
        >
          {{ t('nav.' + item.key) }}
        </v-btn>
      </nav>

      <!-- Desktop Action Buttons -->
      <div class="d-none d-md-flex align-center ga-3">
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
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
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
          class="btn-shimmer px-5 font-weight-bold"
          size="default"
          prepend-icon="mdi-chat-processing-outline"
          @click.prevent="navigateTo('#contact')"
        >
          {{ t('nav.cta') }}
        </v-btn>
      </div>

      <!-- Mobile Controls (Language + Theme Toggle + Drawer Hamburger) -->
      <div class="d-flex d-md-none align-center ga-1">
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
          :aria-label="t('nav.openMenu')"
          @click="drawer = !drawer"
        >
          <v-icon icon="mdi-menu" size="26" />
        </v-btn>
      </div>
    </v-container>
  </header>

  <!-- Mobile Responsive Navigation Drawer -->
  <v-navigation-drawer
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
}

.v-theme--nextChallengeLight .app-navbar {
  background: rgba(255, 255, 255, 0.82);
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

.nav-link {
  color: rgba(255, 255, 255, 0.75) !important;
  font-size: 0.925rem;
  transition: all 0.2s ease;
  border-radius: 8px;
}

.v-theme--nextChallengeLight .nav-link {
  color: rgba(15, 23, 42, 0.75) !important;
}

.nav-link:hover {
  color: #ffffff !important;
  background: rgba(255, 255, 255, 0.06) !important;
}

.v-theme--nextChallengeLight .nav-link:hover {
  color: #4f46e5 !important;
  background: rgba(79, 70, 229, 0.06) !important;
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

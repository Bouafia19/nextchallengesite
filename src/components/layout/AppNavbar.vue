<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useTheme } from 'vuetify'
import BrandLogo from './BrandLogo.vue'
import { siteConfig } from '@/config/site.js'

const theme = useTheme()
const isScrolled = ref(false)
const drawer = ref(false)

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
      <BrandLogo :size="36" />

      <!-- Desktop Navigation Links -->
      <nav class="d-none d-md-flex align-center ga-1" aria-label="Main Navigation">
        <v-btn
          v-for="item in siteConfig.navLinks"
          :key="item.label"
          :href="item.href"
          variant="text"
          class="nav-link font-weight-medium px-3"
          size="default"
          @click.prevent="navigateTo(item.href)"
        >
          {{ item.label }}
        </v-btn>
      </nav>

      <!-- Desktop Action Buttons -->
      <div class="d-none d-md-flex align-center ga-3">
        <!-- Theme Toggle -->
        <v-btn
          icon
          variant="text"
          density="comfortable"
          :aria-label="theme.global.current.value.dark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleTheme"
        >
          <v-icon
            :icon="theme.global.current.value.dark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'"
            size="20"
          />
        </v-btn>

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
          Let's Talk
        </v-btn>
      </div>

      <!-- Mobile Controls (Theme Toggle + Drawer Hamburger) -->
      <div class="d-flex d-md-none align-center ga-1">
        <v-btn
          icon
          variant="text"
          density="comfortable"
          :aria-label="theme.global.current.value.dark ? 'Switch to light mode' : 'Switch to dark mode'"
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
          aria-label="Open navigation menu"
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
    location="right"
    temporary
    width="320"
    class="mobile-drawer"
  >
    <div class="pa-5 d-flex flex-column h-100 justify-space-between">
      <div>
        <!-- Drawer Header -->
        <div class="d-flex align-center justify-space-between mb-6 pb-3 border-b">
          <BrandLogo :size="32" @click="drawer = false" />
          <v-btn
            icon="mdi-close"
            variant="text"
            density="comfortable"
            aria-label="Close navigation menu"
            @click="drawer = false"
          />
        </div>

        <!-- Navigation Links List -->
        <v-list density="comfortable" nav class="px-0">
          <v-list-item
            v-for="item in siteConfig.navLinks"
            :key="item.label"
            :value="item.label"
            rounded="lg"
            class="mb-1 mobile-nav-item"
            @click="navigateTo(item.href)"
          >
            <template #prepend>
              <v-icon
                :icon="
                  item.label === 'Home' ? 'mdi-home-outline' :
                  item.label === 'Services' ? 'mdi-briefcase-outline' :
                  item.label === 'Products' ? 'mdi-cube-outline' :
                  item.label === 'Capabilities' ? 'mdi-lightning-bolt-outline' :
                  item.label === 'Why Us' ? 'mdi-shield-star-outline' :
                  item.label === 'About Us' ? 'mdi-information-outline' : 'mdi-email-outline'
                "
                class="mr-3"
                size="20"
                color="primary"
              />
            </template>
            <v-list-item-title class="font-weight-semibold text-body-1">
              {{ item.label }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </div>

      <!-- Drawer Footer Contact Details & CTA -->
      <div class="pt-4 border-t">
        <div class="mb-4">
          <div class="text-caption text-medium-emphasis mb-2 font-weight-medium">
            Direct Reach
          </div>
          <a
            :href="siteConfig.phoneTel"
            class="d-flex align-center text-decoration-none text-body-2 mb-2 ga-2"
          >
            <v-icon icon="mdi-phone-outline" size="16" color="secondary" />
            <span class="font-weight-medium text-high-emphasis">{{ siteConfig.phone }}</span>
          </a>
          <a
            :href="siteConfig.emailMailto"
            class="d-flex align-center text-decoration-none text-body-2 ga-2"
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
          Let's Talk
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

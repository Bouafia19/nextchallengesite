<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AppNavbar from './components/layout/AppNavbar.vue'
import HeroSection from './components/sections/HeroSection.vue'
import ServicesSection from './components/sections/ServicesSection.vue'
import ProductsSection from './components/sections/ProductsSection.vue'
import CoursesSection from './components/sections/CoursesSection.vue'
import TechSection from './components/sections/TechSection.vue'
import WhyUsSection from './components/sections/WhyUsSection.vue'
import AboutSection from './components/sections/AboutSection.vue'
import ContactSection from './components/sections/ContactSection.vue'
import AppFooter from './components/layout/AppFooter.vue'
import AdminPanel from './components/admin/AdminPanel.vue'

const { t } = useI18n()
const showBackToTop = ref(false)
const currentView = ref('site') // 'site' | 'admin'

const checkRoute = () => {
  const hash = window.location.hash.toLowerCase()
  const path = window.location.pathname.toLowerCase()
  if (path === '/admin' || hash === '#admin' || hash === '#/admin') {
    currentView.value = 'admin'
  } else {
    currentView.value = 'site'
  }
}

const showAdmin = () => {
  currentView.value = 'admin'
  window.location.hash = '#admin'
}

const showSite = () => {
  currentView.value = 'site'
  if (window.location.pathname === '/admin') {
    window.history.pushState(null, '', '/')
  } else {
    window.location.hash = ''
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 400
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  checkRoute()
  window.addEventListener('hashchange', checkRoute)
  window.addEventListener('popstate', checkRoute)
  window.addEventListener('open-admin-portal', showAdmin)
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('hashchange', checkRoute)
  window.removeEventListener('popstate', checkRoute)
  window.removeEventListener('open-admin-portal', showAdmin)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <v-app class="nc-application">
    <!-- Admin Dashboard View -->
    <template v-if="currentView === 'admin'">
      <AdminPanel @back="showSite" />
    </template>

    <!-- Main Public Website View -->
    <template v-else>
      <!-- Sticky Navigation Bar -->
      <AppNavbar @open-admin="showAdmin" />

      <!-- Main Website Content Sections -->
      <v-main>
        <HeroSection />
        <ServicesSection />
        <ProductsSection />
        <CoursesSection />
        <TechSection />
        <WhyUsSection />
        <AboutSection />
        <ContactSection />
      </v-main>

      <!-- Footer -->
      <AppFooter @open-admin="showAdmin" />

      <!-- Floating Back to Top Button -->
      <v-fade-transition>
        <v-btn
          v-if="showBackToTop"
          icon="mdi-chevron-up"
          color="primary"
          variant="elevated"
          size="large"
          class="back-to-top-btn"
          :aria-label="t('footer.backToTop')"
          elevation="6"
          @click="scrollToTop"
        />
      </v-fade-transition>
    </template>
  </v-app>
</template>

<style scoped>
.nc-application {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.back-to-top-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 999;
  border-radius: 50% !important;
  box-shadow: 0 8px 24px rgba(91, 84, 232, 0.4) !important;
}

:deep([dir="rtl"]) .back-to-top-btn,
:global([dir="rtl"] .back-to-top-btn) {
  right: auto !important;
  left: 24px !important;
}
</style>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AppNavbar from './components/layout/AppNavbar.vue'
import HeroSection from './components/sections/HeroSection.vue'
import ServicesSection from './components/sections/ServicesSection.vue'
import ProductsSection from './components/sections/ProductsSection.vue'
import TechSection from './components/sections/TechSection.vue'
import WhyUsSection from './components/sections/WhyUsSection.vue'
import AboutSection from './components/sections/AboutSection.vue'
import ContactSection from './components/sections/ContactSection.vue'
import AppFooter from './components/layout/AppFooter.vue'

const showBackToTop = ref(false)

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 400
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <v-app class="nc-application">
    <!-- Sticky Navigation Bar -->
    <AppNavbar />

    <!-- Main Website Content Sections -->
    <v-main>
      <HeroSection />
      <ServicesSection />
      <ProductsSection />
      <TechSection />
      <WhyUsSection />
      <AboutSection />
      <ContactSection />
    </v-main>

    <!-- Footer -->
    <AppFooter />

    <!-- Floating Back to Top Button -->
    <v-fade-transition>
      <v-btn
        v-if="showBackToTop"
        icon="mdi-chevron-up"
        color="primary"
        variant="elevated"
        size="large"
        class="back-to-top-btn"
        aria-label="Back to top of page"
        elevation="6"
        @click="scrollToTop"
      />
    </v-fade-transition>
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
</style>

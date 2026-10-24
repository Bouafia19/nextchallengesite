<script setup>
import { ref, computed, onMounted, onUnmounted, watch, defineAsyncComponent } from 'vue'
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

// Lazy-load administrative and secondary views to drastically reduce initial visitor bundle size
const AdminPanel = defineAsyncComponent(() => import('./components/admin/AdminPanel.vue'))
const ProductDetailView = defineAsyncComponent(() => import('./components/products/ProductDetailView.vue'))
import { siteConfig } from './config/site.js'
import { messages } from './plugins/i18n.js'

const { t, locale } = useI18n()
const showBackToTop = ref(false)
const currentView = ref('site') // 'site' | 'admin' | 'product-detail'
const selectedProductSlug = ref('')

const defaultTitle = computed(() => {
  return messages[locale.value]?.meta?.title || 'Next Challenge | Développement Logiciel & Solutions Numériques'
})

// Sync title when locale changes
watch(locale, () => {
  if (currentView.value === 'site') {
    document.title = defaultTitle.value
  } else if (currentView.value === 'admin') {
    document.title = 'Administration | Next Challenge'
  } else if (currentView.value === 'product-detail' && selectedProductSlug.value) {
    const matched = siteConfig.products.find(
      (p) => p.slug === selectedProductSlug.value || p.id === selectedProductSlug.value
    )
    if (matched) {
      document.title = `${matched.name} — ${matched.category} | Next Challenge`
    }
  }
})

const checkRoute = () => {
  const hash = window.location.hash.toLowerCase()
  const path = window.location.pathname.toLowerCase()

  if (path === '/admin' || hash === '#admin' || hash === '#/admin') {
    currentView.value = 'admin'
    selectedProductSlug.value = ''
    document.title = 'Administration | Next Challenge'
    return
  }

  // Match /products/:slug or #/products/:slug or #products/:slug
  const productMatch =
    path.match(/^\/products\/([a-z0-9_-]+)/) ||
    hash.match(/^#\/?products\/([a-z0-9_-]+)/)

  if (productMatch) {
    let slug = productMatch[1]
    if (slug === 'inventory-demo') slug = 'inventory-v2'
    const matchedProduct = siteConfig.products.find(
      (p) => p.slug === slug || p.id === slug
    )
    if (matchedProduct) {
      currentView.value = 'product-detail'
      selectedProductSlug.value = matchedProduct.slug
      document.title = `${matchedProduct.name} — ${matchedProduct.category} | Next Challenge`
      return
    }
  }

  currentView.value = 'site'
  selectedProductSlug.value = ''
  document.title = defaultTitle.value
}

const showAdmin = () => {
  currentView.value = 'admin'
  selectedProductSlug.value = ''
  document.title = 'Administration | Next Challenge'
  window.location.hash = '#admin'
}

const showSite = () => {
  currentView.value = 'site'
  selectedProductSlug.value = ''
  if (window.location.pathname === '/admin') {
    window.history.pushState(null, '', '/')
  } else {
    window.location.hash = ''
  }
  document.title = defaultTitle.value
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const openProductDetail = (slug) => {
  const normalized = slug === 'inventory-demo' ? 'inventory-v2' : slug
  const matched = siteConfig.products.find(
    (p) => p.slug === normalized || p.id === normalized
  )
  const finalSlug = matched ? matched.slug : normalized

  selectedProductSlug.value = finalSlug
  currentView.value = 'product-detail'
  window.history.pushState(null, '', `/products/${finalSlug}`)
  window.scrollTo({ top: 0, behavior: 'instant' })

  if (matched) {
    document.title = `${matched.name} — ${matched.category} | Next Challenge`
  }
}

const showProductsSection = () => {
  currentView.value = 'site'
  selectedProductSlug.value = ''
  window.history.pushState(null, '', '/#products')
  document.title = defaultTitle.value
  setTimeout(() => {
    const el = document.getElementById('products')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, 60)
}

const handleNavbarNavigate = (href) => {
  if (currentView.value !== 'site') {
    currentView.value = 'site'
    selectedProductSlug.value = ''
    window.history.pushState(null, '', `/${href}`)
    document.title = defaultTitle.value
    setTimeout(() => {
      const el = document.querySelector(href)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }, 80)
  }
}

const handleNavHome = () => {
  if (currentView.value !== 'site') {
    showSite()
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
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
  window.addEventListener('nav-home', handleNavHome)
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('hashchange', checkRoute)
  window.removeEventListener('popstate', checkRoute)
  window.removeEventListener('open-admin-portal', showAdmin)
  window.removeEventListener('nav-home', handleNavHome)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <v-app class="nc-application">
    <!-- Admin Dashboard View -->
    <template v-if="currentView === 'admin'">
      <AdminPanel @back="showSite" />
    </template>

    <!-- Public Website & Product Detail Views -->
    <template v-else>
      <!-- Sticky Navigation Bar -->
      <AppNavbar @open-admin="showAdmin" @navigate="handleNavbarNavigate" />

      <!-- Product Detail View -->
      <v-main v-if="currentView === 'product-detail'">
        <ProductDetailView
          :slug="selectedProductSlug"
          @back="showProductsSection"
          @select-product="openProductDetail"
        />
      </v-main>

      <!-- Main Website Content Sections -->
      <v-main v-else>
        <HeroSection />
        <ServicesSection />
        <ProductsSection @select-product="openProductDetail" />
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

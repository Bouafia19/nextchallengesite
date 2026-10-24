<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { siteConfig } from '@/config/site.js'

const props = defineProps({
  slug: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['back', 'select-product'])

const { t, tm, locale } = useI18n()
const isRtl = computed(() => locale.value === 'ar')

const product = computed(() => {
  const normalized = props.slug === 'inventory-demo' ? 'inventory-v2' : props.slug
  return (
    siteConfig.products.find((p) => p.slug === normalized || p.id === normalized) ||
    siteConfig.products[0]
  )
})

const goBack = () => {
  emit('back')
}

const scrollToApkSection = () => {
  const el = document.getElementById('apk-downloads-section')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'instant' })
  if (product.value) {
    document.title = `${product.value.name} — ${product.value.category} | Next Challenge`
  }
})
</script>

<template>
  <div v-if="product" class="product-detail-view tech-bg-mesh">
    <!-- Breadcrumb & Back Navigation Header -->
    <section class="detail-header-nav py-4 border-b border-subtle">
      <v-container class="d-flex align-center justify-space-between flex-wrap ga-3">
        <div class="d-flex align-center ga-2 text-caption text-medium-emphasis">
          <v-btn
            variant="text"
            density="compact"
            class="px-2 font-weight-medium btn-back-to-products"
            @click="goBack"
          >
            <v-icon :icon="isRtl ? 'mdi-chevron-right' : 'mdi-chevron-left'" start size="18" />
            {{ t('productDetail.backToProducts') }}
          </v-btn>
          <span class="opacity-50">/</span>
          <span class="font-weight-bold text-high-emphasis">{{ product.name }}</span>
        </div>

        <div class="d-flex align-center ga-2">
          <v-chip size="small" color="primary" variant="tonal" class="font-weight-medium">
            <span class="pulsing-dot mr-1"></span>
            {{ t('productDetail.liveDeployment') }}
          </v-chip>
          <v-chip size="small" variant="outlined" class="mono-font opacity-80">
            {{ product.category }}
          </v-chip>
        </div>
      </v-container>
    </section>

    <!-- Hero Banner Section -->
    <section class="product-hero-section py-12 py-md-16" :style="{ background: product.gradient }">
      <v-container>
        <v-row align="center" class="gy-8">
          <!-- Logo & Identity Column -->
          <v-col cols="12" md="4" class="text-center text-md-start">
            <div class="product-hero-badge-wrap d-inline-block pa-4 rounded-xxl nc-glass-card elevation-12">
              <img
                v-if="product.logo"
                :src="product.logo"
                :alt="product.logoAlt || product.name"
                class="product-hero-logo"
                loading="eager"
              />
              <v-icon
                v-else
                :icon="product.icon"
                size="96"
                color="white"
                class="product-hero-icon"
              />
            </div>
          </v-col>

          <!-- Headline & Actions Column -->
          <v-col cols="12" md="8">
            <div class="d-flex flex-wrap align-center ga-2 mb-3">
              <v-chip size="small" color="white" variant="flat" class="text-black font-weight-bold">
                {{ product.badge }}
              </v-chip>
              <v-chip size="small" color="white" variant="outlined" class="text-white font-weight-medium">
                {{ t('productDetail.verifiedProduction') }}
              </v-chip>
            </div>

            <h1 class="text-h3 text-md-h2 font-weight-extrabold text-white mb-3 tracking-tight">
              {{ product.name }}
            </h1>

            <p class="text-h6 font-weight-medium text-white opacity-90 mb-4 line-height-relaxed">
              {{ product.tagline }}
            </p>

            <p class="text-body-1 text-white opacity-85 mb-8 max-w-750 line-height-relaxed">
              {{ product.overview }}
            </p>

            <!-- Action Buttons Group -->
            <div class="d-flex flex-wrap align-center ga-3">
              <!-- Primary CTA: Open Live Demo / Web App -->
              <v-btn
                :href="product.url"
                target="_blank"
                rel="noopener noreferrer"
                color="white"
                variant="flat"
                size="x-large"
                class="text-black font-weight-bold btn-hero-cta elevation-4"
                append-icon="mdi-open-in-new"
              >
                {{ product.demoCta || t('productDetail.openLiveDemo') }}
              </v-btn>

              <!-- Conditional APK Anchor Button -->
              <v-btn
                v-if="product.apks && product.apks.length > 0"
                variant="outlined"
                color="white"
                size="x-large"
                class="font-weight-bold elevation-2"
                prepend-icon="mdi-android"
                @click="scrollToApkSection"
              >
                {{ t('productDetail.downloadApk') }}
              </v-btn>

              <!-- Back Button -->
              <v-btn
                variant="text"
                color="white"
                size="x-large"
                class="font-weight-medium"
                :prepend-icon="isRtl ? 'mdi-arrow-right' : 'mdi-arrow-left'"
                @click="goBack"
              >
                {{ t('productDetail.backToProducts') }}
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Main Content Body -->
    <v-container class="py-12 py-md-16">
      <!-- Section 1: Supported Platforms Bar -->
      <div v-if="product.platforms && product.platforms.length > 0" class="mb-14">
        <h2 class="text-h5 font-weight-bold mb-6 d-flex align-center ga-2">
          <v-icon icon="mdi-devices" color="primary" />
          {{ t('productDetail.platformsTitle') }}
        </h2>
        <v-row class="gy-4">
          <v-col
            v-for="(plat, idx) in product.platforms"
            :key="idx"
            cols="12"
            sm="6"
            lg="3"
          >
            <v-card class="nc-glass-card pa-4 rounded-xl d-flex align-center ga-3 h-100" elevation="2">
              <v-avatar :color="plat.color || 'primary'" variant="tonal" rounded="lg" size="48">
                <v-icon :icon="plat.icon || 'mdi-check'" size="24" :color="plat.color || 'primary'" />
              </v-avatar>
              <div>
                <div class="text-subtitle-2 font-weight-bold">{{ plat.name }}</div>
                <div class="text-caption text-medium-emphasis">Production Ready</div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Section 2: Application Ecosystem & Live Portals (Grouped Links) -->
      <div class="mb-14">
        <div class="mb-8">
          <span class="badge-pill mb-2">
            <v-icon icon="mdi-web" size="14" color="secondary" class="mr-1" />
            {{ t('productDetail.applicationsTitle') }}
          </span>
          <h2 class="text-h4 font-weight-bold mb-2 tracking-tight">
            {{ product.name }} Application Ecosystem
          </h2>
          <p class="text-body-1 text-medium-emphasis max-w-750">
            {{ t('productDetail.applicationsSubtitle') }}
          </p>
        </div>

        <v-row class="gy-6">
          <v-col
            v-for="(app, idx) in product.applications"
            :key="idx"
            cols="12"
            :md="product.applications.length > 1 ? 6 : 12"
            class="d-flex"
          >
            <v-card
              class="nc-glass-card portal-card w-100 pa-6 rounded-2xl d-flex flex-column justify-space-between"
              elevation="3"
            >
              <div>
                <!-- Top Portal Info -->
                <div class="d-flex align-start justify-space-between ga-3 mb-4">
                  <div class="d-flex align-center ga-3">
                    <v-avatar :color="app.accent || product.accentColor" variant="tonal" size="52" rounded="xl">
                      <v-icon :icon="app.icon || 'mdi-web'" size="28" :color="app.accent || product.accentColor" />
                    </v-avatar>
                    <div>
                      <div class="text-h6 font-weight-bold">{{ app.name }}</div>
                      <div class="text-caption text-medium-emphasis">{{ app.role }}</div>
                    </div>
                  </div>
                  <v-chip size="small" :color="app.accent || 'primary'" variant="tonal" class="font-weight-bold">
                    {{ app.badge }}
                  </v-chip>
                </div>

                <!-- Description -->
                <p class="text-body-2 text-medium-emphasis mb-6 line-height-relaxed">
                  {{ app.description }}
                </p>
              </div>

              <!-- Portal Launch Action -->
              <div class="pt-4 border-t border-subtle d-flex align-center justify-space-between">
                <span class="text-caption mono-font text-truncate opacity-75 mr-2">
                  {{ app.url.replace(/^https?:\/\//, '') }}
                </span>
                <v-btn
                  :href="app.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="primary"
                  variant="flat"
                  size="default"
                  class="font-weight-bold btn-shimmer"
                  append-icon="mdi-open-in-new"
                >
                  {{ t('productDetail.launchApp') }}
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Section 3: Verified Android APK Downloads (CONDITIONAL) -->
      <div
        v-if="product.apks && product.apks.length > 0"
        id="apk-downloads-section"
        class="mb-14"
      >
        <v-card class="nc-glass-card apk-container-card pa-6 pa-md-8 rounded-2xl elevation-4 border-accent">
          <div class="d-flex align-start ga-4 mb-6 flex-wrap">
            <v-avatar color="#3ddc84" variant="tonal" size="56" rounded="xl">
              <v-icon icon="mdi-android" size="36" color="#3ddc84" />
            </v-avatar>
            <div class="flex-grow-1">
              <div class="d-flex align-center ga-2 flex-wrap mb-1">
                <h2 class="text-h5 font-weight-bold">
                  {{ t('productDetail.apkAvailable') }}
                </h2>
                <v-chip size="x-small" color="#3ddc84" variant="flat" class="text-black font-weight-bold">
                  Verified Production Artifacts
                </v-chip>
              </div>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ t('productDetail.apkDescription') }}
              </p>
            </div>
          </div>

          <!-- APK List Grid -->
          <v-row class="gy-4">
            <v-col
              v-for="(apk, idx) in product.apks"
              :key="idx"
              cols="12"
              :md="product.apks.length === 1 ? 12 : 6"
            >
              <v-card class="pa-5 rounded-xl border-subtle bg-surface-variant d-flex flex-column justify-space-between h-100" variant="outlined">
                <div class="mb-4">
                  <div class="d-flex align-center justify-space-between ga-2 mb-2">
                    <span class="text-subtitle-1 font-weight-bold">
                      {{ (locale === 'fr' ? apk.nameFr : locale === 'ar' ? apk.nameAr : apk.nameEn) || apk.name }}
                    </span>
                    <v-chip size="x-small" color="success" variant="tonal" class="font-weight-bold">
                      {{ apk.size }}
                    </v-chip>
                  </div>
                  <div class="text-caption text-medium-emphasis mb-1">
                    <v-icon icon="mdi-shield-check" size="14" color="success" class="mr-1" />
                    {{ t('productDetail.target') }}: {{ (locale === 'fr' ? apk.targetFr : locale === 'ar' ? apk.targetAr : apk.targetEn) || apk.target }}
                  </div>
                  <div class="text-caption mono-font opacity-75 d-flex align-center">
                    <v-icon icon="mdi-android" size="14" color="medium-emphasis" class="mr-1" />
                    <span>{{ t('productDetail.compatibility') }}: {{ apk.platform }}</span>
                  </div>
                </div>

                <v-btn
                  block
                  :href="apk.file"
                  download
                  color="success"
                  variant="flat"
                  size="large"
                  class="font-weight-bold btn-shimmer"
                  prepend-icon="mdi-download"
                >
                  {{ t('productDetail.directDownload') }} ({{ apk.size }})
                </v-btn>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </div>

      <!-- Section 4: Key Capabilities & Engineering Features Matrix -->
      <div class="mb-14">
        <div class="mb-8">
          <span class="badge-pill mb-2">
            <v-icon icon="mdi-star-check-outline" size="14" color="secondary" class="mr-1" />
            {{ t('productDetail.featuresTitle') }}
          </span>
          <h2 class="text-h4 font-weight-bold mb-2 tracking-tight">
            Production-Grade Capabilities
          </h2>
          <p class="text-body-1 text-medium-emphasis max-w-750">
            Engineered with modern architectural standards, verified security headers, and high-throughput workflows.
          </p>
        </div>

        <v-row class="gy-6">
          <v-col
            v-for="(feat, idx) in product.features"
            :key="idx"
            cols="12"
            md="6"
            lg="4"
            class="d-flex"
          >
            <v-card class="nc-glass-card feature-card w-100 pa-6 rounded-2xl d-flex flex-column" elevation="2">
              <v-avatar :color="product.accentColor" variant="tonal" size="48" rounded="lg" class="mb-4">
                <v-icon :icon="feat.icon" size="24" :color="product.accentColor" />
              </v-avatar>
              <h3 class="text-subtitle-1 font-weight-bold mb-2">
                {{ feat.title }}
              </h3>
              <p class="text-body-2 text-medium-emphasis mb-0 line-height-relaxed flex-grow-1">
                {{ feat.description }}
              </p>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Section 5: Target Audience & Business Use Cases -->
      <div class="mb-14">
        <div class="mb-8">
          <span class="badge-pill mb-2">
            <v-icon icon="mdi-target-account" size="14" color="secondary" class="mr-1" />
            {{ t('productDetail.useCasesTitle') }}
          </span>
          <h2 class="text-h4 font-weight-bold mb-2 tracking-tight">
            Tailored for Strategic Business Operations
          </h2>
          <p class="text-body-1 text-medium-emphasis max-w-750">
            Designed to address specific operational bottlenecks and streamline multi-stakeholder workflows.
          </p>
        </div>

        <v-row class="gy-6">
          <v-col
            v-for="(uc, idx) in product.useCases"
            :key="idx"
            cols="12"
            md="4"
            class="d-flex"
          >
            <v-card class="nc-glass-card usecase-card w-100 pa-6 rounded-2xl d-flex flex-column" elevation="2">
              <div class="d-flex align-center ga-3 mb-4">
                <v-avatar :color="product.accentColor" variant="tonal" size="44" rounded="lg">
                  <v-icon :icon="uc.icon" size="22" :color="product.accentColor" />
                </v-avatar>
                <div class="text-subtitle-1 font-weight-bold">{{ uc.title }}</div>
              </div>
              <p class="text-body-2 text-medium-emphasis mb-0 line-height-relaxed">
                {{ uc.description }}
              </p>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Section 6: Enterprise Contact / Custom Deployment Banner -->
      <v-card class="nc-glass-card enterprise-cta-card pa-8 pa-md-12 rounded-3xl text-center elevation-8 border-gradient-top">
        <div class="max-w-750 mx-auto">
          <v-avatar color="primary" variant="tonal" size="64" class="mb-4">
            <v-icon icon="mdi-handshake-outline" size="36" color="primary" />
          </v-avatar>
          <h2 class="text-h4 font-weight-bold mb-3 tracking-tight">
            {{ t('productDetail.contactCtaTitle') }}
          </h2>
          <p class="text-body-1 text-medium-emphasis mb-8 line-height-relaxed">
            {{ t('productDetail.contactCtaSubtitle') }}
          </p>
          <div class="d-flex flex-wrap align-center justify-center ga-4">
            <v-btn
              href="#contact"
              color="primary"
              variant="flat"
              size="x-large"
              class="font-weight-bold btn-shimmer"
              append-icon="mdi-send"
              @click="goBack"
            >
              {{ t('productDetail.contactCtaBtn') }}
            </v-btn>
            <v-btn
              variant="outlined"
              size="x-large"
              class="font-weight-medium"
              :prepend-icon="isRtl ? 'mdi-arrow-right' : 'mdi-arrow-left'"
              @click="goBack"
            >
              {{ t('productDetail.backToProducts') }}
            </v-btn>
          </div>
        </div>
      </v-card>
    </v-container>
  </div>
</template>

<style scoped>
.product-detail-view {
  min-height: 100vh;
}

.max-w-750 {
  max-width: 750px;
}

.line-height-relaxed {
  line-height: 1.7;
}

.product-hero-section {
  position: relative;
  overflow: hidden;
}

.product-hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 80% 30%, rgba(255, 255, 255, 0.12) 0%, transparent 65%);
  pointer-events: none;
}

.product-hero-badge-wrap {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 180px;
  height: 180px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.product-hero-logo {
  max-width: 130px;
  max-height: 130px;
  object-fit: contain;
  filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.35));
}

.portal-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.portal-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15) !important;
}

.feature-card,
.usecase-card {
  transition: transform 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.feature-card:hover,
.usecase-card:hover {
  transform: translateY(-4px);
}

.apk-container-card {
  background: linear-gradient(135deg, rgba(61, 220, 132, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%);
  border: 1px solid rgba(61, 220, 132, 0.25);
}

.border-subtle {
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.v-theme--nextChallengeLight .border-subtle {
  border-color: rgba(0, 0, 0, 0.08) !important;
}

.v-theme--nextChallengeLight .portal-card,
.v-theme--nextChallengeLight .feature-card,
.v-theme--nextChallengeLight .usecase-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
}
</style>

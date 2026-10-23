<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { siteConfig } from '@/config/site.js'

const emit = defineEmits(['select-product'])

const { t, tm, locale } = useI18n()
const isRtl = computed(() => locale.value === 'ar')

const navigateToDetail = (slug) => {
  emit('select-product', slug)
}
</script>

<template>
  <section id="products" class="section-pad border-gradient-top tech-bg-mesh">
    <v-container>
      <!-- Section Header -->
      <div class="text-center max-w-700 mx-auto mb-14">
        <span class="badge-pill mb-3">
          <v-icon icon="mdi-rocket-launch-outline" size="16" color="secondary" class="mr-1" />
          {{ t('products.badge') }}
        </span>
        <h2 class="text-h3 font-weight-bold mb-4 tracking-tight">
          {{ t('products.title') }}
        </h2>
        <p class="text-h6 font-weight-regular text-medium-emphasis">
          {{ t('products.subtitle') }}
        </p>
      </div>

      <!-- Products Grid -->
      <v-row class="gy-8">
        <v-col
          v-for="product in siteConfig.products"
          :key="product.id"
          cols="12"
          lg="4"
          md="6"
          class="d-flex"
        >
          <v-card
            class="nc-glass-card product-card w-100 d-flex flex-column justify-space-between cursor-pointer"
            rounded="xl"
            role="button"
            tabindex="0"
            :aria-label="product.name + ' - ' + t('products.cardExploreHint')"
            @click="navigateToDetail(product.slug)"
            @keydown.enter.prevent="navigateToDetail(product.slug)"
            @keydown.space.prevent="navigateToDetail(product.slug)"
          >
            <!-- Card Visual Banner -->
            <div
              class="product-banner pa-5 d-flex flex-column justify-space-between"
              :style="{ background: product.gradient }"
            >
              <div class="d-flex flex-wrap align-center justify-space-between ga-2 mb-2">
                <v-chip
                  size="x-small"
                  color="white"
                  variant="flat"
                  class="text-black font-weight-bold"
                >
                  <span class="pulsing-dot mr-1"></span>
                  {{ t('products.liveDeployment') }}
                </v-chip>
                <div class="product-badge text-caption text-white font-weight-bold">
                  {{ t('products.items.' + product.key + '.badge') }}
                </div>
              </div>

              <!-- Center Product Graphic Element (Authentic Brand Logo) -->
              <div class="py-5 text-center">
                <div class="product-brand-logo-wrap mb-2">
                  <img
                    v-if="product.logo"
                    :src="product.logo"
                    :alt="product.logoAlt || product.name"
                    class="product-brand-img"
                    loading="lazy"
                  />
                  <v-icon
                    v-else
                    :icon="product.icon"
                    size="64"
                    color="white"
                    class="product-visual-icon"
                  />
                </div>
                <div class="text-white text-h5 font-weight-extrabold mt-1 tracking-tight">
                  {{ product.name }}
                </div>
                <div class="text-caption text-white opacity-85 font-weight-medium">
                  {{ t('products.items.' + product.key + '.category') }}
                </div>
              </div>

              <!-- Micro Status & Detail Page Affordance -->
              <div class="d-flex align-center justify-space-between text-caption text-white opacity-90 mono-font">
                <span>{{ t('products.verifiedBuild') }}</span>
                <span class="d-flex align-center font-weight-bold">
                  {{ t('products.viewDetails') }}
                  <v-icon :icon="isRtl ? 'mdi-chevron-left' : 'mdi-chevron-right'" size="14" class="ml-1" />
                </span>
              </div>
            </div>

            <!-- Card Body Content -->
            <div class="pa-6 d-flex flex-column flex-grow-1 justify-space-between">
              <div>
                <!-- Tagline -->
                <div class="text-subtitle-2 font-weight-bold text-primary mb-2">
                  {{ t('products.items.' + product.key + '.tagline') }}
                </div>

                <!-- Main Description -->
                <p class="text-body-2 text-medium-emphasis mb-4 line-height-relaxed">
                  {{ t('products.items.' + product.key + '.description') }}
                </p>

                <!-- Platform Badges -->
                <div v-if="product.platforms && product.platforms.length > 0" class="d-flex flex-wrap ga-1 mb-4">
                  <v-chip
                    v-for="(plat, pIdx) in product.platforms.slice(0, 3)"
                    :key="pIdx"
                    size="x-small"
                    color="primary"
                    variant="tonal"
                    class="font-weight-medium"
                  >
                    <v-icon :icon="plat.icon || 'mdi-check'" start size="12" />
                    {{ plat.name }}
                  </v-chip>
                </div>

                <!-- Key Highlights -->
                <div class="mb-5">
                  <div
                    v-for="(highlight, idx) in tm('products.items.' + product.key + '.highlights')"
                    :key="idx"
                    class="d-flex align-start ga-2 mb-2"
                  >
                    <v-icon
                      icon="mdi-check-circle-outline"
                      size="18"
                      :color="product.accentColor"
                      class="mt-1 flex-shrink-0"
                    />
                    <span class="text-caption text-high-emphasis font-weight-medium">
                      {{ highlight }}
                    </span>
                  </div>
                </div>

                <!-- Tech Stack Chips -->
                <div class="d-flex flex-wrap ga-1 mb-6">
                  <v-chip
                    v-for="tag in product.tags"
                    :key="tag"
                    size="x-small"
                    variant="tonal"
                    class="font-weight-medium opacity-80"
                  >
                    {{ tag }}
                  </v-chip>
                </div>
              </div>

              <!-- CTA Actions Area: Open Detail Page (Primary) + Direct Link Icon -->
              <div class="pt-4 border-t border-subtle d-flex align-center justify-space-between ga-2">
                <v-btn
                  color="primary"
                  variant="flat"
                  size="large"
                  class="font-weight-bold flex-grow-1 btn-shimmer"
                  :append-icon="isRtl ? 'mdi-arrow-left' : 'mdi-arrow-right'"
                  @click.stop="navigateToDetail(product.slug)"
                >
                  {{ t('products.viewDetails') }}
                </v-btn>

                <v-tooltip :text="t('productDetail.openLiveDemo')" location="top">
                  <template #activator="{ props: tooltipProps }">
                    <v-btn
                      v-bind="tooltipProps"
                      :href="product.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      icon="mdi-open-in-new"
                      variant="outlined"
                      color="primary"
                      size="large"
                      :aria-label="product.name + ' - ' + t('productDetail.openLiveDemo')"
                      @click.stop
                    />
                  </template>
                </v-tooltip>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<style scoped>
.max-w-700 {
  max-width: 740px;
}

.cursor-pointer {
  cursor: pointer;
}

.product-card {
  overflow: hidden;
  border-radius: 24px !important;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease, border-color 0.35s ease;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.25) !important;
  border-color: rgba(59, 130, 246, 0.4);
}

.product-banner {
  min-height: 210px;
  position: relative;
  overflow: hidden;
}

.product-banner::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.2) 0%, transparent 60%);
  pointer-events: none;
}

.product-brand-logo-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 76px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.product-brand-img {
  max-width: 54px;
  max-height: 54px;
  object-fit: contain;
}

.product-card:hover .product-brand-logo-wrap {
  transform: scale(1.12) rotate(-2deg);
}

.product-visual-icon {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
}

.product-card:hover .product-visual-icon {
  transform: scale(1.12) rotate(-3deg);
}

.product-badge {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  padding: 4px 10px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.border-subtle {
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.v-theme--nextChallengeLight .border-subtle {
  border-color: rgba(0, 0, 0, 0.08) !important;
}

.line-height-relaxed {
  line-height: 1.65;
}
</style>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import TechVisualGraphic from '../ui/TechVisualGraphic.vue'

const { t, locale } = useI18n()
const isRtl = computed(() => locale.value === 'ar')

const scrollTo = (href) => {
  const target = document.querySelector(href)
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <section id="home" class="hero-section tech-bg-mesh bg-grid-pattern">
    <v-container class="py-10 py-md-14">
      <v-row align="center" class="gy-8">
        <!-- Left Hero Content -->
        <v-col cols="12" lg="6" :class="isRtl ? 'text-right' : 'text-left'">
          <!-- Eyebrow Badge -->
          <div class="mb-5">
            <span class="badge-pill">
              <span class="pulsing-dot"></span>
              <span>{{ t('hero.locationBadge') }}</span>
            </span>
          </div>

          <!-- Main Headline -->
          <h1 class="hero-title mb-4">
            <span>{{ t('hero.titleBuild') }}</span>
            <span class="text-gradient mx-2">{{ t('hero.titleInnovate') }}</span>
            <span>{{ t('hero.titleTransform') }}</span>
          </h1>

          <!-- Subtitle -->
          <h2 class="hero-subtitle mb-6 text-high-emphasis">
            {{ t('hero.subtitle') }}
          </h2>

          <!-- Description Paragraph -->
          <p class="hero-description mb-8 text-medium-emphasis">
            {{ t('hero.description') }}
          </p>

          <!-- CTAs -->
          <div class="d-flex flex-wrap align-center ga-4 mb-10">
            <!-- Primary CTA -->
            <v-btn
              color="primary"
              variant="flat"
              size="x-large"
              class="btn-shimmer font-weight-bold px-8"
              prepend-icon="mdi-email-fast-outline"
              @click="scrollTo('#contact')"
            >
              {{ t('hero.ctaContact') }}
            </v-btn>

            <!-- Secondary CTA -->
            <v-btn
              variant="outlined"
              color="secondary"
              size="x-large"
              class="font-weight-bold px-7"
              :append-icon="isRtl ? 'mdi-arrow-left' : 'mdi-arrow-right'"
              @click="scrollTo('#products')"
            >
              {{ t('hero.ctaProducts') }}
            </v-btn>
          </div>

          <!-- Trust Badges & Highlights Strip -->
          <div class="trust-strip pt-6 border-t d-flex flex-wrap align-center ga-6">
            <div class="d-flex align-center ga-2">
              <v-icon icon="mdi-code-json" size="20" color="primary" />
              <span class="text-caption font-weight-semibold text-medium-emphasis">
                {{ t('hero.trustTailored') }}
              </span>
            </div>
            <div class="d-flex align-center ga-2">
              <v-icon icon="mdi-shield-check-outline" size="20" color="secondary" />
              <span class="text-caption font-weight-semibold text-medium-emphasis">
                {{ t('hero.trustEnterprise') }}
              </span>
            </div>
            <div class="d-flex align-center ga-2">
              <v-icon icon="mdi-map-marker-radius-outline" size="20" color="info" />
              <span class="text-caption font-weight-semibold text-medium-emphasis">
                {{ t('hero.trustLocation') }}
              </span>
            </div>
          </div>
        </v-col>

        <!-- Right Hero Visual Graphic -->
        <v-col cols="12" lg="6" class="d-flex justify-center justify-lg-end" dir="ltr">
          <TechVisualGraphic />
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<style scoped>
.hero-section {
  position: relative;
  min-height: 600px;
  display: flex;
  align-items: center;
  padding-block: 40px 60px;
}

@media (min-height: 800px) and (min-width: 960px) {
  .hero-section {
    min-height: min(820px, calc(100vh - 80px));
  }
}

.hero-title {
  font-size: clamp(2.4rem, 5.5vw, 4.2rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.035em;
}

.hero-subtitle {
  font-size: clamp(1.25rem, 2.5vw, 1.75rem);
  font-weight: 600;
  line-height: 1.35;
  letter-spacing: -0.02em;
}

.hero-description {
  font-size: clamp(1rem, 1.8vw, 1.15rem);
  line-height: 1.75;
  max-width: 620px;
}

.trust-strip {
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.v-theme--nextChallengeLight .trust-strip {
  border-color: rgba(0, 0, 0, 0.08) !important;
}
</style>

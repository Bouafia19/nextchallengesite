<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { siteConfig } from '@/config/site.js'

const { t, tm, locale } = useI18n()
const isRtl = computed(() => locale.value === 'ar')

const scrollToContact = (serviceTitle) => {
  const target = document.querySelector('#contact')
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' })
    // Dispatch custom event or let the contact form know which service was clicked
    window.dispatchEvent(
      new CustomEvent('select-contact-subject', { detail: { subject: serviceTitle } })
    )
  }
}
</script>

<template>
  <section id="services" class="section-pad border-gradient-top">
    <v-container>
      <!-- Section Header -->
      <div class="text-center max-w-700 mx-auto mb-14">
        <span class="badge-pill mb-3">
          <v-icon icon="mdi-cogs" size="16" color="primary" class="mr-1" />
          {{ t('services.badge') }}
        </span>
        <h2 class="text-h3 font-weight-bold mb-4 tracking-tight">
          {{ t('services.title') }}
        </h2>
        <p class="text-h6 font-weight-regular text-medium-emphasis">
          {{ t('services.subtitle') }}
        </p>
      </div>

      <!-- Services Grid (All 10 Services) -->
      <v-row class="g-6">
        <v-col
          v-for="service in siteConfig.services"
          :key="service.id"
          cols="12"
          sm="6"
          lg="4"
          class="d-flex"
        >
          <v-card
            class="nc-glass-card service-card pa-6 w-100 d-flex flex-column justify-space-between"
            rounded="xl"
            @click="scrollToContact(t('services.items.' + service.key + '.title'))"
          >
            <!-- Card Top: Icon & Action -->
            <div>
              <div class="d-flex align-center justify-space-between mb-5">
                <div
                  class="service-icon-box"
                  :style="{
                    backgroundColor: `${service.color}15`,
                    borderColor: `${service.color}40`,
                    color: service.color
                  }"
                >
                  <v-icon :icon="service.icon" size="28" />
                </div>
                <v-icon
                  :icon="isRtl ? 'mdi-arrow-top-left' : 'mdi-arrow-top-right'"
                  size="20"
                  class="service-arrow text-medium-emphasis"
                />
              </div>

              <!-- Title -->
              <h3 class="text-h6 font-weight-bold mb-3 service-title">
                {{ t('services.items.' + service.key + '.title') }}
              </h3>

              <!-- Description -->
              <p class="text-body-2 text-medium-emphasis line-height-relaxed mb-4">
                {{ t('services.items.' + service.key + '.description') }}
              </p>
            </div>

            <!-- Card Bottom: Feature Tags & Action -->
            <div>
              <div class="d-flex flex-wrap ga-2 pt-2 border-t border-subtle">
                <v-chip
                  v-for="tag in tm('services.items.' + service.key + '.tags')"
                  :key="tag"
                  size="x-small"
                  variant="tonal"
                  class="font-weight-medium"
                >
                  {{ tag }}
                </v-chip>
              </div>

              <div class="mt-4 pt-2">
                <v-btn
                  variant="text"
                  color="primary"
                  density="compact"
                  class="px-0 font-weight-semibold"
                  :append-icon="isRtl ? 'mdi-chevron-left' : 'mdi-chevron-right'"
                  @click.stop="scrollToContact(t('services.items.' + service.key + '.title'))"
                >
                  {{ t('services.actionBtn') }}
                </v-btn>
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

.service-card {
  cursor: pointer;
  border-radius: 20px !important;
}

.service-icon-box {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
}

.service-card:hover .service-icon-box {
  transform: scale(1.1) rotate(2deg);
  box-shadow: 0 8px 20px -4px currentColor;
}

.service-arrow {
  transition: transform 0.3s ease, color 0.3s ease;
}

.service-card:hover .service-arrow {
  transform: translate(2px, -2px);
  color: var(--nc-primary) !important;
}

.service-title {
  letter-spacing: -0.015em;
  transition: color 0.2s ease;
}

.service-card:hover .service-title {
  color: var(--nc-primary);
}

.border-subtle {
  border-color: rgba(255, 255, 255, 0.06) !important;
}

.v-theme--nextChallengeLight .border-subtle {
  border-color: rgba(0, 0, 0, 0.06) !important;
}

.line-height-relaxed {
  line-height: 1.65;
}
</style>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { siteConfig } from '@/config/site.js'
import BrandLogo from '../layout/BrandLogo.vue'

const { t, tm, locale } = useI18n()
const isRtl = computed(() => locale.value === 'ar')
</script>

<template>
  <section id="about" class="section-pad border-gradient-top">
    <v-container>
      <v-row class="gy-8" align="center">
        <!-- Left: Company Profile & Story -->
        <v-col cols="12" lg="7">
          <span class="badge-pill mb-3">
            <v-icon icon="mdi-office-building-marker-outline" size="16" color="primary" class="mr-1" />
            {{ t('about.badge') }}
          </span>
          <h2 class="text-h3 font-weight-bold mb-5 tracking-tight">
            {{ t('about.title') }}
          </h2>
          <p
            class="text-body-1 text-high-emphasis font-weight-medium line-height-relaxed mb-4"
            v-html="t('about.lead')"
          ></p>
          <p class="text-body-2 text-medium-emphasis line-height-relaxed mb-6">
            {{ t('about.story') }}
          </p>

          <!-- Core Specializations Chips -->
          <div class="mb-6">
            <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-3 letter-spacing-1">
              {{ t('about.specializationsTitle') }}
            </div>
            <div class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="item in tm('about.specializations')"
                :key="item"
                variant="outlined"
                color="primary"
                size="small"
                class="font-weight-medium"
              >
                <v-icon icon="mdi-check" size="14" :class="isRtl ? 'ml-1' : 'mr-1'" />
                {{ item }}
              </v-chip>
            </div>
          </div>
        </v-col>

        <!-- Right: Official Company Information Card -->
        <v-col cols="12" lg="5">
          <v-card class="nc-glass-card company-card pa-8" rounded="xl">
            <div class="d-flex align-center justify-space-between mb-6 pb-4 border-b border-subtle">
              <BrandLogo :size="46" />
              <div class="text-caption text-medium-emphasis font-weight-medium mono-font text-right" dir="ltr">
                {{ siteConfig.legalName }}
              </div>
            </div>

            <!-- Contact & Location Rows -->
            <div class="d-flex flex-column ga-5">
              <!-- Location -->
              <div class="d-flex align-start ga-3">
                <div class="info-icon-wrapper">
                  <v-icon icon="mdi-map-marker-outline" size="20" color="primary" />
                </div>
                <div>
                  <div class="text-caption text-medium-emphasis font-weight-semibold">
                    {{ t('about.headquarters') }}
                  </div>
                  <div class="text-body-2 font-weight-bold text-high-emphasis">
                    📍 {{ siteConfig.location }}
                  </div>
                </div>
              </div>

              <!-- Phone -->
              <div class="d-flex align-start ga-3">
                <div class="info-icon-wrapper">
                  <v-icon icon="mdi-phone-outline" size="20" color="primary" />
                </div>
                <div>
                  <div class="text-caption text-medium-emphasis font-weight-semibold">
                    {{ t('about.directPhone') }}
                  </div>
                  <a
                    :href="siteConfig.phoneTel"
                    class="text-body-1 font-weight-bold text-secondary text-decoration-none hover-underline ltr-text"
                    dir="ltr"
                  >
                    📞 {{ siteConfig.phone }}
                  </a>
                </div>
              </div>

              <!-- Email -->
              <div class="d-flex align-start ga-3">
                <div class="info-icon-wrapper">
                  <v-icon icon="mdi-email-outline" size="20" color="primary" />
                </div>
                <div>
                  <div class="text-caption text-medium-emphasis font-weight-semibold">
                    {{ t('about.officialEmail') }}
                  </div>
                  <a
                    :href="siteConfig.emailMailto"
                    class="text-body-1 font-weight-bold text-secondary text-decoration-none hover-underline text-break ltr-text"
                    dir="ltr"
                  >
                    ✉️ {{ siteConfig.email }}
                  </a>
                </div>
              </div>

              <!-- Domain -->
              <div class="d-flex align-start ga-3">
                <div class="info-icon-wrapper">
                  <v-icon icon="mdi-web" size="20" color="primary" />
                </div>
                <div>
                  <div class="text-caption text-medium-emphasis font-weight-semibold">
                    {{ t('about.primaryDomain') }}
                  </div>
                  <a
                    :href="siteConfig.siteUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-body-2 font-weight-bold text-high-emphasis text-decoration-none mono-font ltr-text"
                    dir="ltr"
                  >
                    🌐 {{ siteConfig.domain }}
                  </a>
                </div>
              </div>
            </div>

            <!-- Quick Consultation CTA inside card -->
            <div class="mt-6 pt-6 border-t border-subtle">
              <v-btn
                block
                color="secondary"
                variant="tonal"
                class="font-weight-bold"
                href="#contact"
                prepend-icon="mdi-send-outline"
              >
                {{ t('about.scheduleConsultation') }}
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<style scoped>
.company-card {
  border-radius: 24px !important;
}

.company-badge-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(20, 184, 166, 0.12);
  border: 1px solid rgba(20, 184, 166, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(91, 84, 232, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hover-underline:hover {
  text-decoration: underline !important;
}

.border-subtle {
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.v-theme--nextChallengeLight .border-subtle {
  border-color: rgba(0, 0, 0, 0.08) !important;
}

.line-height-relaxed {
  line-height: 1.7;
}

.letter-spacing-1 {
  letter-spacing: 0.06em;
}
</style>

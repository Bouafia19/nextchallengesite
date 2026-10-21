<script setup>
import { useI18n } from 'vue-i18n'
import { siteConfig } from '@/config/site.js'

const { t } = useI18n()
</script>

<template>
  <section id="why-us" class="section-pad border-gradient-top tech-bg-mesh">
    <v-container>
      <!-- Section Header -->
      <div class="text-center max-w-700 mx-auto mb-14">
        <span class="badge-pill mb-3">
          <v-icon icon="mdi-shield-star-outline" size="16" color="secondary" class="mr-1" />
          {{ t('whyUs.badge') }}
        </span>
        <h2 class="text-h3 font-weight-bold mb-4 tracking-tight">
          {{ t('whyUs.title') }}
        </h2>
        <p class="text-h6 font-weight-regular text-medium-emphasis">
          {{ t('whyUs.subtitle') }}
        </p>
      </div>

      <!-- 6 Key Pillars Grid -->
      <v-row class="g-6">
        <v-col
          v-for="(pillar, index) in siteConfig.whyChooseUs"
          :key="pillar.id"
          cols="12"
          md="6"
          lg="4"
          class="d-flex"
        >
          <v-card class="nc-glass-card pillar-card pa-6 w-100 d-flex flex-column" rounded="xl">
            <div class="d-flex align-center justify-space-between mb-4">
              <div
                class="pillar-icon-box"
                :style="{
                  backgroundColor: `${pillar.color}15`,
                  borderColor: `${pillar.color}35`,
                  color: pillar.color
                }"
              >
                <v-icon :icon="pillar.icon" size="26" />
              </div>
              <span class="mono-font text-caption font-weight-bold text-medium-emphasis opacity-60">
                0{{ index + 1 }}
              </span>
            </div>

            <h3 class="text-h6 font-weight-bold mb-3 tracking-tight">
              {{ pillar.key ? t('whyUs.pillars.' + pillar.key + '.title') : pillar.title }}
            </h3>

            <p class="text-body-2 text-medium-emphasis line-height-relaxed flex-grow-1">
              {{ pillar.key ? t('whyUs.pillars.' + pillar.key + '.description') : pillar.description }}
            </p>
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

.pillar-card {
  border-radius: 20px !important;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease;
}

.pillar-card:hover {
  transform: translateY(-5px);
  border-color: rgba(91, 84, 232, 0.35) !important;
}

.pillar-icon-box {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid;
  transition: transform 0.3s ease;
}

.pillar-card:hover .pillar-icon-box {
  transform: scale(1.1);
}

.line-height-relaxed {
  line-height: 1.65;
}
</style>

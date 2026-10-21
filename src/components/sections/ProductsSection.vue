<script setup>
import { siteConfig } from '@/config/site.js'
</script>

<template>
  <section id="products" class="section-pad border-gradient-top tech-bg-mesh">
    <v-container>
      <!-- Section Header -->
      <div class="text-center max-w-700 mx-auto mb-14">
        <span class="badge-pill mb-3">
          <v-icon icon="mdi-rocket-launch-outline" size="16" color="secondary" class="mr-1" />
          Production Engineering
        </span>
        <h2 class="text-h3 font-weight-bold mb-4 tracking-tight">
          Our Products &amp; Projects
        </h2>
        <p class="text-h6 font-weight-regular text-medium-emphasis">
          Real technology products developed by Next Challenge.
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
            class="nc-glass-card product-card w-100 d-flex flex-column justify-space-between"
            rounded="xl"
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
                  Live Deployment
                </v-chip>
                <div class="product-badge text-caption text-white font-weight-bold">
                  {{ product.badge }}
                </div>
              </div>

              <!-- Center Product Graphic Element -->
              <div class="py-6 text-center">
                <v-icon :icon="product.icon" size="64" color="white" class="product-visual-icon" />
                <div class="text-white text-h5 font-weight-extrabold mt-2 tracking-tight">
                  {{ product.name }}
                </div>
                <div class="text-caption text-white opacity-80 font-weight-medium">
                  {{ product.category }}
                </div>
              </div>

              <!-- Micro Status -->
              <div class="d-flex align-center justify-space-between text-caption text-white opacity-90 mono-font">
                <span>Verified Build</span>
                <span>Render Production</span>
              </div>
            </div>

            <!-- Card Body Content -->
            <div class="pa-6 d-flex flex-column flex-grow-1 justify-space-between">
              <div>
                <!-- Tagline -->
                <div class="text-subtitle-2 font-weight-bold text-primary mb-2">
                  {{ product.tagline }}
                </div>

                <!-- Main Description -->
                <p class="text-body-2 text-medium-emphasis mb-5 line-height-relaxed">
                  {{ product.description }}
                </p>

                <!-- Key Highlights -->
                <div class="mb-5">
                  <div
                    v-for="(highlight, idx) in product.highlights"
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
                    class="font-weight-medium"
                  >
                    {{ tag }}
                  </v-chip>
                </div>
              </div>

              <!-- CTA Button (New Window / Tab) -->
              <div class="pt-4 border-t border-subtle">
                <v-btn
                  block
                  :href="product.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="primary"
                  variant="flat"
                  size="large"
                  class="font-weight-bold btn-shimmer"
                  append-icon="mdi-open-in-new"
                >
                  {{ product.buttonText }}
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

.product-card {
  overflow: hidden;
  border-radius: 24px !important;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease;
}

.product-card:hover {
  transform: translateY(-8px);
}

.product-banner {
  min-height: 190px;
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

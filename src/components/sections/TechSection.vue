<script setup>
import { siteConfig } from '@/config/site.js'
</script>

<template>
  <section id="capabilities" class="section-pad border-gradient-top bg-grid-pattern">
    <v-container>
      <!-- Section Header -->
      <div class="text-center max-w-700 mx-auto mb-14">
        <span class="badge-pill mb-3">
          <v-icon icon="mdi-code-braces" size="16" color="primary" class="mr-1" />
          Technical Expertise
        </span>
        <h2 class="text-h3 font-weight-bold mb-4 tracking-tight">
          Capabilities &amp; Technology Stack
        </h2>
        <p class="text-h6 font-weight-regular text-medium-emphasis">
          Modern engineering stack powering high-performance, fault-tolerant digital systems.
        </p>
      </div>

      <!-- Capabilities Grid -->
      <v-row class="g-6">
        <v-col
          v-for="cap in siteConfig.capabilities"
          :key="cap.title"
          cols="12"
          sm="6"
          lg="4"
          class="d-flex"
        >
          <v-card class="nc-glass-card capability-card pa-6 w-100 d-flex flex-column justify-space-between" rounded="xl">
            <div>
              <!-- Header with Icon and Title -->
              <div class="d-flex align-center ga-3 mb-3">
                <div class="cap-icon-box">
                  <v-icon :icon="cap.icon" size="24" color="primary" />
                </div>
                <div>
                  <h3 class="text-subtitle-1 font-weight-bold tracking-tight">
                    {{ cap.title }}
                  </h3>
                </div>
              </div>

              <!-- Subtitle Description -->
              <p class="text-caption text-medium-emphasis mb-4">
                {{ cap.subtitle }}
              </p>
            </div>

            <!-- Tech Badges -->
            <div class="d-flex flex-wrap ga-2 pt-3 border-t border-subtle">
              <span
                v-for="tech in cap.technologies"
                :key="tech"
                class="tech-chip mono-font"
              >
                {{ tech }}
              </span>
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

.capability-card {
  border-radius: 18px !important;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.capability-card:hover {
  transform: translateY(-4px);
  border-color: rgba(91, 84, 232, 0.4) !important;
}

.cap-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(91, 84, 232, 0.12);
  border: 1px solid rgba(91, 84, 232, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.capability-card:hover .cap-icon-box {
  transform: scale(1.1);
  background: rgba(91, 84, 232, 0.2);
}

.tech-chip {
  font-size: 0.75rem;
  padding: 3px 9px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.85);
  transition: all 0.2s ease;
}

.v-theme--nextChallengeLight .tech-chip {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.08);
  color: #1e293b;
}

.capability-card:hover .tech-chip {
  border-color: rgba(91, 84, 232, 0.3);
  color: #a5b4fc;
}

.v-theme--nextChallengeLight .capability-card:hover .tech-chip {
  color: #4338ca;
}

.border-subtle {
  border-color: rgba(255, 255, 255, 0.06) !important;
}

.v-theme--nextChallengeLight .border-subtle {
  border-color: rgba(0, 0, 0, 0.06) !important;
}
</style>

<script setup>
import { siteConfig } from '@/config/site.js'

const specializations = [
  'Web Development',
  'Mobile Development',
  'Enterprise Software',
  'ERP Platforms',
  'REST & GraphQL APIs',
  'AI Integration',
  'Cloud Infrastructure',
  'DevOps Automation',
  'Business Intelligence',
  'E-Commerce Solutions',
  'UI/UX Design'
]
</script>

<template>
  <section id="about" class="section-pad border-gradient-top">
    <v-container>
      <v-row class="gy-8" align="center">
        <!-- Left: Company Profile & Story -->
        <v-col cols="12" lg="7">
          <span class="badge-pill mb-3">
            <v-icon icon="mdi-office-building-marker-outline" size="16" color="primary" class="mr-1" />
            Company Profile
          </span>
          <h2 class="text-h3 font-weight-bold mb-5 tracking-tight">
            About Next Challenge
          </h2>
          <p class="text-body-1 text-high-emphasis font-weight-medium line-height-relaxed mb-4">
            Next Challenge is a technology company based in
            <strong class="text-secondary">El Hidab, Sétif, Algeria</strong>,
            focused on building modern digital solutions for businesses.
          </p>
          <p class="text-body-2 text-medium-emphasis line-height-relaxed mb-6">
            We partner with forward-thinking enterprises, startups, and institutions to engineer tailored software that solves tangible operational problems. Our focus is on scalable architectures, clean codebases, intuitive interfaces, and robust systems that empower organizations to automate workflows and serve their customers with confidence.
          </p>

          <!-- Core Specializations Chips -->
          <div class="mb-6">
            <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis mb-3 letter-spacing-1">
              Core Technical Specializations
            </div>
            <div class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="item in specializations"
                :key="item"
                variant="outlined"
                color="primary"
                size="small"
                class="font-weight-medium"
              >
                <v-icon icon="mdi-check" size="14" class="mr-1" />
                {{ item }}
              </v-chip>
            </div>
          </div>
        </v-col>

        <!-- Right: Official Company Information Card -->
        <v-col cols="12" lg="5">
          <v-card class="nc-glass-card company-card pa-8" rounded="xl">
            <div class="d-flex align-center ga-3 mb-6 pb-4 border-b border-subtle">
              <div class="company-badge-icon">
                <v-icon icon="mdi-shield-check" size="28" color="secondary" />
              </div>
              <div>
                <h3 class="text-h6 font-weight-bold tracking-tight">
                  {{ siteConfig.name }}
                </h3>
                <div class="text-caption text-medium-emphasis font-weight-medium mono-font">
                  {{ siteConfig.legalName }}
                </div>
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
                  <div class="text-caption text-medium-emphasis font-weight-semibold">Headquarters</div>
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
                  <div class="text-caption text-medium-emphasis font-weight-semibold">Direct Telephone</div>
                  <a
                    :href="siteConfig.phoneTel"
                    class="text-body-1 font-weight-bold text-secondary text-decoration-none hover-underline"
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
                  <div class="text-caption text-medium-emphasis font-weight-semibold">Official Inquiries</div>
                  <a
                    :href="siteConfig.emailMailto"
                    class="text-body-1 font-weight-bold text-secondary text-decoration-none hover-underline text-break"
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
                  <div class="text-caption text-medium-emphasis font-weight-semibold">Production Domain</div>
                  <a
                    :href="siteConfig.siteUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-body-2 font-weight-bold text-high-emphasis text-decoration-none mono-font"
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
                Schedule a Consultation
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

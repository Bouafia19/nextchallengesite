<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BrandLogo from './BrandLogo.vue'
import { siteConfig } from '@/config/site.js'

const { t, tm, locale } = useI18n()
const isRtl = computed(() => locale.value === 'ar')

const scrollTo = (href) => {
  const target = document.querySelector(href)
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <footer class="app-footer border-gradient-top">
    <v-container class="py-12 py-md-16">
      <v-row class="gy-8">
        <!-- Col 1: Brand Info & Socials -->
        <v-col cols="12" md="4" :class="isRtl ? 'pl-md-8' : 'pr-md-8'">
          <div class="mb-4">
            <BrandLogo :size="36" />
          </div>
          <p class="text-body-2 text-medium-emphasis line-height-relaxed mb-6">
            {{ t('footer.tagline') }}
          </p>

          <!-- Social Links -->
          <div class="d-flex align-center ga-3 mb-6">
            <!-- Facebook -->
            <v-btn
              :href="siteConfig.social.facebook || '#contact'"
              :target="siteConfig.social.facebook ? '_blank' : undefined"
              :rel="siteConfig.social.facebook ? 'noopener noreferrer' : undefined"
              icon
              variant="tonal"
              density="comfortable"
              color="primary"
              aria-label="Next Challenge on Facebook"
            >
              <v-icon icon="mdi-facebook" size="20" />
            </v-btn>

            <!-- Instagram -->
            <v-btn
              :href="siteConfig.social.instagram || '#contact'"
              :target="siteConfig.social.instagram ? '_blank' : undefined"
              :rel="siteConfig.social.instagram ? 'noopener noreferrer' : undefined"
              icon
              variant="tonal"
              density="comfortable"
              color="primary"
              aria-label="Next Challenge on Instagram"
            >
              <v-icon icon="mdi-instagram" size="20" />
            </v-btn>

            <!-- LinkedIn -->
            <v-btn
              :href="siteConfig.social.linkedin || '#contact'"
              :target="siteConfig.social.linkedin ? '_blank' : undefined"
              :rel="siteConfig.social.linkedin ? 'noopener noreferrer' : undefined"
              icon
              variant="tonal"
              density="comfortable"
              color="primary"
              aria-label="Next Challenge on LinkedIn"
            >
              <v-icon icon="mdi-linkedin" size="20" />
            </v-btn>
          </div>

          <div class="text-caption text-medium-emphasis mono-font ltr-text" dir="ltr">
            {{ siteConfig.domain }}
          </div>
        </v-col>

        <!-- Col 2: Navigation Links -->
        <v-col cols="6" sm="4" md="2">
          <h4 class="text-subtitle-2 font-weight-bold text-high-emphasis text-uppercase tracking-wider mb-4">
            {{ t('footer.navTitle') }}
          </h4>
          <ul class="footer-links-list">
            <li><a href="#home" @click.prevent="scrollTo('#home')">{{ t('nav.home') }}</a></li>
            <li><a href="#services" @click.prevent="scrollTo('#services')">{{ t('nav.services') }}</a></li>
            <li><a href="#products" @click.prevent="scrollTo('#products')">{{ t('nav.products') }}</a></li>
            <li><a href="#about" @click.prevent="scrollTo('#about')">{{ t('nav.about') }}</a></li>
            <li><a href="#contact" @click.prevent="scrollTo('#contact')">{{ t('nav.contact') }}</a></li>
          </ul>
        </v-col>

        <!-- Col 3: Services Links -->
        <v-col cols="6" sm="4" md="3">
          <h4 class="text-subtitle-2 font-weight-bold text-high-emphasis text-uppercase tracking-wider mb-4">
            {{ t('footer.servicesTitle') }}
          </h4>
          <ul class="footer-links-list">
            <li v-for="serv in tm('footer.servicesList')" :key="serv">
              <a href="#services" @click.prevent="scrollTo('#services')">
                {{ serv }}
              </a>
            </li>
          </ul>
        </v-col>

        <!-- Col 4: Contact Details -->
        <v-col cols="12" sm="4" md="3">
          <h4 class="text-subtitle-2 font-weight-bold text-high-emphasis text-uppercase tracking-wider mb-4">
            {{ t('footer.contactTitle') }}
          </h4>
          <div class="d-flex flex-column ga-3 text-body-2 text-medium-emphasis">
            <div class="d-flex align-start ga-2">
              <v-icon icon="mdi-map-marker-outline" size="18" color="secondary" class="mt-1 flex-shrink-0" />
              <span>{{ siteConfig.location }}</span>
            </div>

            <div class="d-flex align-center ga-2">
              <v-icon icon="mdi-phone-outline" size="18" color="secondary" class="flex-shrink-0" />
              <a :href="siteConfig.phoneTel" class="contact-link font-weight-medium ltr-text" dir="ltr">
                {{ siteConfig.phone }}
              </a>
            </div>

            <div class="d-flex align-start ga-2">
              <v-icon icon="mdi-email-outline" size="18" color="secondary" class="mt-1 flex-shrink-0" />
              <a :href="siteConfig.emailMailto" class="contact-link font-weight-medium email-text ltr-text" dir="ltr">
                {{ siteConfig.email }}
              </a>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Bottom Copyright Row -->
      <div class="footer-bottom mt-12 pt-6 border-t d-flex flex-column flex-sm-row align-center justify-space-between ga-4">
        <div class="text-caption text-medium-emphasis text-center text-sm-left">
          &copy; 2026 Next Challenge. {{ t('footer.allRightsReserved') }}
        </div>
        <div class="d-flex align-center ga-6 text-caption text-medium-emphasis">
          <span class="mono-font ltr-text" dir="ltr">{{ siteConfig.legalName }}</span>
          <span>&bull;</span>
          <a :href="siteConfig.siteUrl" class="text-medium-emphasis text-decoration-none ltr-text" dir="ltr">
            nextchallenge.tech
          </a>
        </div>
      </div>
    </v-container>
  </footer>
</template>

<style scoped>
.app-footer {
  background: rgba(9, 13, 22, 0.95);
  position: relative;
}

.v-theme--nextChallengeLight .app-footer {
  background: #f1f5f9;
}

.footer-links-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-links-list a {
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s ease, transform 0.2s ease;
  display: inline-block;
}

.v-theme--nextChallengeLight .footer-links-list a {
  color: rgba(15, 23, 42, 0.7);
}

.footer-links-list a:hover {
  color: #5b54e8;
  transform: translateX(2px);
}

.v-theme--nextChallengeLight .footer-links-list a:hover {
  color: #4f46e5;
}

.contact-link {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
}

.email-text {
  word-break: break-all;
}

.contact-link:hover {
  color: var(--nc-secondary);
  text-decoration: underline;
}

.footer-bottom {
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.v-theme--nextChallengeLight .footer-bottom {
  border-color: rgba(0, 0, 0, 0.08) !important;
}

.line-height-relaxed {
  line-height: 1.65;
}

.tracking-wider {
  letter-spacing: 0.05em;
}
</style>

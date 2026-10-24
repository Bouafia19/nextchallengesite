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
            <BrandLogo :size="48" />
          </div>
          <p class="text-body-2 text-medium-emphasis line-height-relaxed mb-6">
            {{ t('footer.tagline') }}
          </p>

          <!-- Social Links -->
          <div class="d-flex align-center ga-3 mb-6">
            <v-btn
              v-for="item in siteConfig.socialLinks"
              :key="item.platform"
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer"
              icon
              variant="tonal"
              density="comfortable"
              class="social-btn"
              :class="`social-btn--${item.platform}`"
              :aria-label="t(item.ariaLabelKey)"
            >
              <v-icon :icon="item.icon" size="20" />
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
          &copy; 2021 Next Challenge. {{ t('footer.allRightsReserved') }}
        </div>
        <div class="d-flex align-center flex-wrap ga-4 ga-md-6 text-caption text-medium-emphasis">
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

.social-btn {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50% !important;
}

.social-btn:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 3px;
}

.social-btn:hover {
  transform: translateY(-2px);
}

/* LinkedIn: Official Platform Blue (#0A66C2) */
.social-btn--linkedin {
  color: #0A66C2 !important;
  background: rgba(10, 102, 194, 0.12) !important;
  border: 1px solid rgba(10, 102, 194, 0.35) !important;
}
.social-btn--linkedin:hover {
  background: #0A66C2 !important;
  color: #ffffff !important;
  box-shadow: 0 4px 14px rgba(10, 102, 194, 0.45);
}

/* Facebook: Official Platform Blue (#1877F2) */
.social-btn--facebook {
  color: #1877F2 !important;
  background: rgba(24, 119, 242, 0.12) !important;
  border: 1px solid rgba(24, 119, 242, 0.35) !important;
}
.social-btn--facebook:hover {
  background: #1877F2 !important;
  color: #ffffff !important;
  box-shadow: 0 4px 14px rgba(24, 119, 242, 0.45);
}

/* Instagram: Authentic Multicolor Brand Gradient Treatment */
.social-btn--instagram {
  color: #e4405f !important;
  background: rgba(228, 64, 95, 0.12) !important;
  border: 1px solid rgba(228, 64, 95, 0.35) !important;
}
.social-btn--instagram .v-icon {
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}
.social-btn--instagram:hover {
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%) !important;
  border-color: transparent !important;
  box-shadow: 0 4px 14px rgba(228, 64, 95, 0.45);
}
.social-btn--instagram:hover .v-icon {
  background: none;
  -webkit-text-fill-color: #ffffff;
  color: #ffffff !important;
}

/* Light Theme Enhancements */
.v-theme--nextChallengeLight .social-btn--linkedin {
  background: rgba(10, 102, 194, 0.08) !important;
  border-color: rgba(10, 102, 194, 0.3) !important;
}
.v-theme--nextChallengeLight .social-btn--facebook {
  background: rgba(24, 119, 242, 0.08) !important;
  border-color: rgba(24, 119, 242, 0.3) !important;
}
.v-theme--nextChallengeLight .social-btn--instagram {
  background: rgba(228, 64, 95, 0.08) !important;
  border-color: rgba(228, 64, 95, 0.3) !important;
}
</style>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { SUPPORTED_LOCALES, switchLanguage } from '@/plugins/i18n.js'

const props = defineProps({
  variant: {
    type: String,
    default: 'menu', // 'menu' for navbar, 'drawer' for mobile drawer
    validator: (v) => ['menu', 'drawer'].includes(v)
  }
})

const { locale, t } = useI18n()

const currentLocaleObj = computed(() => {
  return SUPPORTED_LOCALES.find((l) => l.code === locale.value) || SUPPORTED_LOCALES[0]
})

const handleSelect = (code) => {
  if (code !== locale.value) {
    switchLanguage(code)
  }
}
</script>

<template>
  <!-- Desktop / Navbar Dropdown Menu Variant -->
  <v-menu
    v-if="variant === 'menu'"
    location="bottom end"
    offset="8"
    transition="slide-y-transition"
    aria-label="Language selection menu"
  >
    <template #activator="{ props: menuProps }">
      <v-btn
        v-bind="menuProps"
        variant="tonal"
        color="surface-variant"
        class="lang-selector-btn font-weight-medium px-3 text-high-emphasis"
        size="default"
        rounded="lg"
        :aria-label="t('nav.language') + ': ' + currentLocaleObj.nativeName"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="globe-icon me-1 text-secondary"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span class="lang-label mx-1 font-weight-semibold">{{ currentLocaleObj.nativeName }}</span>
        <v-icon icon="mdi-chevron-down" size="16" class="text-medium-emphasis ms-1" />
      </v-btn>
    </template>

    <v-card class="nc-glass-card lang-menu-card pa-1" min-width="160" elevation="10" rounded="xl">
      <v-list density="compact" nav class="pa-1 bg-transparent" role="menu">
        <v-list-item
          v-for="item in SUPPORTED_LOCALES"
          :key="item.code"
          :value="item.code"
          :active="item.code === locale"
          class="lang-menu-item mb-1 rounded-lg"
          role="menuitem"
          :aria-current="item.code === locale ? 'true' : undefined"
          @click="handleSelect(item.code)"
        >
          <v-list-item-title class="font-weight-medium text-body-2">
            {{ item.nativeName }}
          </v-list-item-title>

          <template #append>
            <v-icon
              v-if="item.code === locale"
              icon="mdi-check"
              size="18"
              color="secondary"
            />
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>

  <!-- Mobile Navigation Drawer Variant -->
  <div v-else class="lang-drawer-container">
    <div class="text-caption text-medium-emphasis mb-2 font-weight-medium d-flex align-center ga-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="globe-icon me-1 text-secondary"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      <span>{{ t('nav.language') }}</span>
    </div>
    <div class="lang-chips-grid">
      <v-btn
        v-for="item in SUPPORTED_LOCALES"
        :key="item.code"
        :variant="item.code === locale ? 'flat' : 'outlined'"
        :color="item.code === locale ? 'primary' : 'surface-variant'"
        size="small"
        class="lang-chip-btn font-weight-semibold"
        rounded="lg"
        :aria-pressed="item.code === locale"
        @click="handleSelect(item.code)"
      >
        <span>{{ item.nativeName }}</span>
        <v-icon v-if="item.code === locale" icon="mdi-check" size="14" class="ms-1" />
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.lang-selector-btn {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  transition: all 0.2s ease;
  height: 40px !important;
}

.v-theme--nextChallengeLight .lang-selector-btn {
  background: rgba(0, 0, 0, 0.04) !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
}

.lang-selector-btn:hover {
  background: rgba(91, 84, 232, 0.12) !important;
  border-color: rgba(91, 84, 232, 0.3) !important;
}

.globe-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
  transition: transform 0.25s ease;
}

.lang-selector-btn:hover .globe-icon {
  transform: rotate(20deg);
}

.lang-menu-card {
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  box-shadow: 0 16px 36px -4px rgba(0, 0, 0, 0.5) !important;
}

.lang-menu-item {
  transition: all 0.2s ease;
}

.lang-menu-item:hover {
  background: rgba(91, 84, 232, 0.15) !important;
}

.lang-drawer-container {
  width: 100%;
}

.lang-chips-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.lang-chip-btn {
  min-width: 0 !important;
  padding: 0 8px !important;
  font-size: 0.8rem !important;
  text-transform: none !important;
}
</style>

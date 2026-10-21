<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: [Number, String],
    default: 34
  },
  compact: {
    type: Boolean,
    default: false
  },
  to: {
    type: String,
    default: '#home'
  }
})

// Unique gradient ID per instance
const gradientId = computed(() => `nc-logo-grad-${Math.random().toString(36).substring(2, 9)}`)
</script>

<template>
  <a :href="to" class="brand-logo" aria-label="Next Challenge Home">
    <svg
      class="brand-logo__glyph"
      :width="size"
      :height="size"
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#5b54e8" />
          <stop offset="100%" stop-color="#14b8a6" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="8" :fill="`url(#${gradientId})`" />
      <path
        d="M9.5 22.5V9.5l13 13V9.5"
        fill="none"
        stroke="#ffffff"
        stroke-width="2.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <span v-if="!compact" class="brand-logo__wordmark">
      <span class="brand-logo__word-next">Next</span>
      <span class="brand-logo__word-challenge">Challenge</span>
    </span>
  </a>
</template>

<style scoped>
.brand-logo {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  cursor: pointer;
  user-select: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.brand-logo:hover {
  opacity: 0.95;
  transform: translateY(-1px);
}

.brand-logo__glyph {
  flex-shrink: 0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(91, 84, 232, 0.25);
  display: block;
}

.brand-logo__wordmark {
  font-family: var(--nc-font-sans);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  display: inline-flex;
  align-items: center;
}

.brand-logo__word-next {
  color: #ffffff;
}

.v-theme--nextChallengeLight .brand-logo__word-next {
  color: #0f172a;
}

.brand-logo__word-challenge {
  color: #5b54e8;
  margin-left: 2px;
}

.v-theme--nextChallengeLight .brand-logo__word-challenge {
  color: #4f46e5;
}
</style>

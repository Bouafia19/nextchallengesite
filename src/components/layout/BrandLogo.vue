<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: [Number, String],
    default: 42
  },
  height: {
    type: [Number, String],
    default: null
  },
  compact: {
    type: Boolean,
    default: false
  },
  showText: {
    type: Boolean,
    default: true
  },
  to: {
    type: String,
    default: '#home'
  }
})

const computedHeight = computed(() => {
  const h = props.height || props.size || 42
  return typeof h === 'number' ? `${h}px` : h
})
</script>

<template>
  <a :href="to" class="brand-logo" aria-label="Next Challenge Home">
    <img
      src="/next-challenge-modernized-logo.png"
      alt="Next Challenge Logo"
      class="brand-logo__img"
      :style="{ height: computedHeight }"
      loading="eager"
      decoding="async"
    />
    <span v-if="!compact && showText" class="brand-logo__wordmark">
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
  direction: ltr !important;
  unicode-bidi: isolate !important;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.brand-logo:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

.brand-logo__img {
  width: auto;
  max-width: 100%;
  object-fit: contain;
  display: block;
  border-radius: 8px;
  /* 1:1 Aspect ratio for circular emblem */
  aspect-ratio: 1 / 1;
}

.brand-logo__wordmark {
  font-family: var(--nc-font-sans);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.brand-logo__word-next {
  color: #ffffff;
}

.v-theme--nextChallengeLight .brand-logo__word-next {
  color: #0f172a;
}

.brand-logo__word-challenge {
  color: #00d2ff;
  margin-left: 3px;
}

.v-theme--nextChallengeLight .brand-logo__word-challenge {
  color: #0284c7;
}

@media (max-width: 420px) {
  .brand-logo {
    gap: 8px;
  }
  .brand-logo__wordmark {
    font-size: 1.05rem;
  }
}
</style>

<script setup>
// Interactive Technology Architecture Visual
</script>

<template>
  <div class="tech-visual-container">
    <!-- Ambient Backdrop Glow -->
    <div class="ambient-glow ambient-glow--indigo"></div>
    <div class="ambient-glow ambient-glow--cyan"></div>

    <!-- Main Architecture Frame -->
    <div class="visual-card">
      <!-- Window Title Bar -->
      <div class="visual-card__header">
        <div class="traffic-lights">
          <span class="light light--red"></span>
          <span class="light light--yellow"></span>
          <span class="light light--green"></span>
        </div>
        <div class="header-title mono-font">
          <v-icon icon="mdi-shield-check-outline" size="14" class="mr-1 text-secondary" />
          nextchallenge.engine/v4.2 — production
        </div>
        <div class="header-status">
          <span class="pulsing-dot mr-1"></span>
          <span class="mono-font text-caption text-secondary font-weight-medium">ACTIVE</span>
        </div>
      </div>

      <!-- Vector Architecture Canvas -->
      <div class="visual-canvas">
        <svg
          viewBox="0 0 600 420"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="w-100 h-100"
        >
          <defs>
            <linearGradient id="grid-grad" x1="0" y1="0" x2="600" y2="420" gradientUnits="userSpaceOnUse">
              <stop stop-color="#5b54e8" stop-opacity="0.2" />
              <stop offset="1" stop-color="#14b8a6" stop-opacity="0.2" />
            </linearGradient>

            <linearGradient id="core-grad" x1="240" y1="160" x2="360" y2="260" gradientUnits="userSpaceOnUse">
              <stop stop-color="#5b54e8" />
              <stop offset="1" stop-color="#14b8a6" />
            </linearGradient>

            <linearGradient id="line-grad-1" x1="300" y1="210" x2="140" y2="100">
              <stop stop-color="#5b54e8" />
              <stop offset="1" stop-color="#38bdf8" />
            </linearGradient>

            <linearGradient id="line-grad-2" x1="300" y1="210" x2="460" y2="100">
              <stop stop-color="#5b54e8" />
              <stop offset="1" stop-color="#a855f7" />
            </linearGradient>

            <linearGradient id="line-grad-3" x1="300" y1="210" x2="140" y2="320">
              <stop stop-color="#14b8a6" />
              <stop offset="1" stop-color="#10b981" />
            </linearGradient>

            <linearGradient id="line-grad-4" x1="300" y1="210" x2="460" y2="320">
              <stop stop-color="#14b8a6" />
              <stop offset="1" stop-color="#f59e0b" />
            </linearGradient>

            <filter id="glow-blur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <!-- Perspective Tech Grid Floor -->
          <g opacity="0.4" stroke="url(#grid-grad)" stroke-width="0.8">
            <line x1="80" y1="360" x2="520" y2="360" />
            <line x1="120" y1="380" x2="480" y2="380" />
            <line x1="160" y1="400" x2="440" y2="400" />
            <line x1="100" y1="350" x2="200" y2="410" />
            <line x1="200" y1="350" x2="260" y2="410" />
            <line x1="300" y1="350" x2="300" y2="410" />
            <line x1="400" y1="350" x2="340" y2="410" />
            <line x1="500" y1="350" x2="400" y2="410" />
          </g>

          <!-- Interconnection Circuit Paths -->
          <!-- Path 1: Core -> Web & Cloud -->
          <path
            d="M 300 210 Q 220 155 140 100"
            stroke="url(#line-grad-1)"
            stroke-width="2.2"
            stroke-dasharray="6 4"
            class="circuit-flow"
          />

          <!-- Path 2: Core -> AI & Analytics -->
          <path
            d="M 300 210 Q 380 155 460 100"
            stroke="url(#line-grad-2)"
            stroke-width="2.2"
            stroke-dasharray="6 4"
            class="circuit-flow"
          />

          <!-- Path 3: Core -> Mobile & Edge -->
          <path
            d="M 300 210 Q 220 265 140 320"
            stroke="url(#line-grad-3)"
            stroke-width="2.2"
            stroke-dasharray="6 4"
            class="circuit-flow"
          />

          <!-- Path 4: Core -> ERP & Database -->
          <path
            d="M 300 210 Q 380 265 460 320"
            stroke="url(#line-grad-4)"
            stroke-width="2.2"
            stroke-dasharray="6 4"
            class="circuit-flow"
          />

          <!-- Peripheral Node 1: Web & Cloud Architecture -->
          <g class="tech-node" transform="translate(140, 100)">
            <circle r="36" fill="#131b2e" stroke="#38bdf8" stroke-width="1.8" />
            <circle r="42" fill="none" stroke="#38bdf8" stroke-width="0.8" opacity="0.3" class="node-pulse" />
            <!-- Cloud Icon Path -->
            <path
              d="M-10 6 A 7 7 0 0 1 -7 -6 A 11 11 0 0 1 11 -3 A 7 7 0 0 1 10 6 Z"
              fill="#38bdf8"
              opacity="0.85"
            />
            <text x="0" y="55" text-anchor="middle" fill="#94a3b8" font-size="11" font-weight="600" font-family="'Plus Jakarta Sans', sans-serif">Cloud &amp; Web</text>
          </g>

          <!-- Peripheral Node 2: AI & Machine Learning -->
          <g class="tech-node" transform="translate(460, 100)">
            <circle r="36" fill="#131b2e" stroke="#a855f7" stroke-width="1.8" />
            <circle r="42" fill="none" stroke="#a855f7" stroke-width="0.8" opacity="0.3" class="node-pulse" />
            <!-- Brain / AI Icon -->
            <circle cx="-6" cy="-4" r="3.5" fill="#c084fc" />
            <circle cx="6" cy="-4" r="3.5" fill="#c084fc" />
            <circle cx="0" cy="5" r="3.5" fill="#c084fc" />
            <line x1="-6" y1="-4" x2="6" y2="-4" stroke="#c084fc" stroke-width="1.6" />
            <line x1="-6" y1="-4" x2="0" y2="5" stroke="#c084fc" stroke-width="1.6" />
            <line x1="6" y1="-4" x2="0" y2="5" stroke="#c084fc" stroke-width="1.6" />
            <text x="0" y="55" text-anchor="middle" fill="#94a3b8" font-size="11" font-weight="600" font-family="'Plus Jakarta Sans', sans-serif">AI Solutions</text>
          </g>

          <!-- Peripheral Node 3: Mobile Apps & Capacitor -->
          <g class="tech-node" transform="translate(140, 320)">
            <circle r="36" fill="#131b2e" stroke="#10b981" stroke-width="1.8" />
            <circle r="42" fill="none" stroke="#10b981" stroke-width="0.8" opacity="0.3" class="node-pulse" />
            <!-- Smartphone Shape -->
            <rect x="-8" y="-12" width="16" height="24" rx="3" fill="none" stroke="#34d399" stroke-width="1.8" />
            <line x1="-3" y1="8" x2="3" y2="8" stroke="#34d399" stroke-width="1.6" stroke-linecap="round" />
            <text x="0" y="55" text-anchor="middle" fill="#94a3b8" font-size="11" font-weight="600" font-family="'Plus Jakarta Sans', sans-serif">Mobile Apps</text>
          </g>

          <!-- Peripheral Node 4: ERP & High-Scale Database -->
          <g class="tech-node" transform="translate(460, 320)">
            <circle r="36" fill="#131b2e" stroke="#f59e0b" stroke-width="1.8" />
            <circle r="42" fill="none" stroke="#f59e0b" stroke-width="0.8" opacity="0.3" class="node-pulse" />
            <!-- Database Cylinders -->
            <ellipse cx="0" cy="-6" rx="10" ry="3.5" fill="none" stroke="#fbbf24" stroke-width="1.6" />
            <path d="M-10 -6 v 6 c 0 2 4.5 3.5 10 3.5 s 10 -1.5 10 -3.5 v -6" fill="none" stroke="#fbbf24" stroke-width="1.6" />
            <path d="M-10 0 v 6 c 0 2 4.5 3.5 10 3.5 s 10 -1.5 10 -3.5 v -6" fill="none" stroke="#fbbf24" stroke-width="1.6" />
            <text x="0" y="55" text-anchor="middle" fill="#94a3b8" font-size="11" font-weight="600" font-family="'Plus Jakarta Sans', sans-serif">ERP &amp; Data</text>
          </g>

          <!-- Central Core Engine Node -->
          <g class="central-core" transform="translate(300, 210)">
            <circle r="52" fill="url(#core-grad)" filter="url(#glow-blur)" opacity="0.35" />
            <circle r="46" fill="#0b1020" stroke="url(#core-grad)" stroke-width="2.5" />
            
            <!-- Concentric Tech Rings -->
            <circle r="38" fill="none" stroke="rgba(255,255,255,0.15)" stroke-dasharray="4 4" />
            
            <!-- Next Challenge Iconic 'N' glyph -->
            <path
              d="M-12 12 V-12 L12 12 V-12"
              fill="none"
              stroke="#ffffff"
              stroke-width="3.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            
            <text x="0" y="70" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700" font-family="'Plus Jakarta Sans', sans-serif">NEXT CHALLENGE</text>
            <text x="0" y="85" text-anchor="middle" fill="#14b8a6" font-size="10" font-weight="600" letter-spacing="1">DIGITAL CORE</text>
          </g>
        </svg>

        <!-- Floating Telemetry Badges -->
        <div class="telemetry-badge telemetry-badge--top-left mono-font">
          <div class="d-flex align-center ga-2">
            <span class="pulsing-dot"></span>
            <span class="text-caption font-weight-bold">REST API</span>
          </div>
          <div class="text-caption text-secondary font-weight-medium">24ms Latency</div>
        </div>

        <div class="telemetry-badge telemetry-badge--bottom-right mono-font">
          <div class="d-flex align-center ga-2">
            <v-icon icon="mdi-shield-lock-outline" size="14" color="info" />
            <span class="text-caption font-weight-bold">Security SLA</span>
          </div>
          <div class="text-caption text-success font-weight-medium">99.99% Uptime</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tech-visual-container {
  position: relative;
  width: 100%;
  max-width: 580px;
  margin: 0 auto;
}

.ambient-glow {
  position: absolute;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;
  z-index: 0;
}

.ambient-glow--indigo {
  top: -20px;
  right: -20px;
  background: rgba(91, 84, 232, 0.25);
}

.ambient-glow--cyan {
  bottom: -20px;
  left: -20px;
  background: rgba(20, 184, 166, 0.2);
}

.visual-card {
  position: relative;
  z-index: 1;
  background: rgba(13, 19, 33, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(91, 84, 232, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.v-theme--nextChallengeLight .visual-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 25px 50px -12px rgba(79, 70, 229, 0.12), 0 0 30px rgba(79, 70, 229, 0.08);
}

.visual-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.v-theme--nextChallengeLight .visual-card__header {
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.traffic-lights {
  display: flex;
  gap: 6px;
}

.light {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.light--red { background-color: #ef4444; }
.light--yellow { background-color: #f59e0b; }
.light--green { background-color: #10b981; }

.header-title {
  font-size: 0.785rem;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
}

.v-theme--nextChallengeLight .header-title {
  color: rgba(15, 23, 42, 0.7);
}

.visual-canvas {
  position: relative;
  padding: 24px 16px;
  min-height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Animations */
.circuit-flow {
  animation: circuit-dash 20s linear infinite;
}

@keyframes circuit-dash {
  to {
    stroke-dashoffset: -100;
  }
}

.node-pulse {
  animation: node-ring-scale 3s ease-out infinite;
  transform-origin: center;
}

@keyframes node-ring-scale {
  0% {
    r: 36px;
    opacity: 0.6;
  }
  100% {
    r: 48px;
    opacity: 0;
  }
}

.central-core {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.central-core:hover {
  transform: scale(1.05);
}

.tech-node {
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.tech-node:hover {
  transform: translateY(-4px);
}

/* Floating Badges */
.telemetry-badge {
  position: absolute;
  background: rgba(16, 24, 40, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 8px 14px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  z-index: 2;
  animation: float-telemetry 4s ease-in-out infinite alternate;
}

.v-theme--nextChallengeLight .telemetry-badge {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.telemetry-badge--top-left {
  top: 30px;
  left: 20px;
  animation-delay: 0s;
}

.telemetry-badge--bottom-right {
  bottom: 24px;
  right: 20px;
  animation-delay: 2s;
}

@keyframes float-telemetry {
  0% { transform: translateY(0px); }
  100% { transform: translateY(-6px); }
}
</style>

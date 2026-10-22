import os

out_dir = "/home/next/next projects/nextchallengesite/logo-proposals"

svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070A11"/>
      <stop offset="50%" stop-color="#0B0F19"/>
      <stop offset="100%" stop-color="#03152E"/>
    </linearGradient>

    <!-- Cyan Neon Accent -->
    <linearGradient id="cyan-glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00D2FF"/>
      <stop offset="100%" stop-color="#00F0FF"/>
    </linearGradient>

    <!-- Deep Navy Accent -->
    <linearGradient id="navy-accent" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00366F"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>

    <!-- Ring Gradient -->
    <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284C7"/>
      <stop offset="50%" stop-color="#00E5FF"/>
      <stop offset="100%" stop-color="#00366F"/>
    </linearGradient>

    <!-- Top Text Arc: Clockwise over the top (Radius 385) -->
    <path id="top-arc" d="M 115,500 A 385,385 0 0,1 885,500" fill="none"/>

    <!-- Bottom Text Arc: Counter-Clockwise under the bottom (Radius 385) -->
    <path id="bottom-arc" d="M 115,500 A 385,385 0 0,0 885,500" fill="none"/>

    <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="1000" height="1000" fill="url(#bg-grad)"/>

  <!-- Subtle Ambient Glow -->
  <circle cx="500" cy="500" r="320" fill="#00366F" opacity="0.18" filter="blur(60px)"/>
  <circle cx="500" cy="500" r="160" fill="#00D2FF" opacity="0.12" filter="blur(40px)"/>

  <!-- ==================== OUTER RING SYSTEM ==================== -->
  <circle cx="500" cy="500" r="470" fill="none" stroke="rgba(0, 210, 255, 0.15)" stroke-width="2"/>
  <circle cx="500" cy="500" r="462" fill="none" stroke="#00366F" stroke-width="4"/>

  <!-- Main Bezel Ring -->
  <circle cx="500" cy="500" r="435" fill="#0D1322" stroke="url(#ring-grad)" stroke-width="3.5"/>
  <circle cx="500" cy="500" r="330" fill="none" stroke="#00D2FF" stroke-width="3" stroke-dasharray="14 10" opacity="0.6"/>
  <circle cx="500" cy="500" r="318" fill="none" stroke="#00366F" stroke-width="2"/>

  <!-- Cardinal Precision Ticks -->
  <line x1="500" y1="26" x2="500" y2="44" stroke="#00E5FF" stroke-width="4" stroke-linecap="round"/>
  <line x1="500" y1="956" x2="500" y2="974" stroke="#00E5FF" stroke-width="4" stroke-linecap="round"/>
  <line x1="26" y1="500" x2="44" y2="500" stroke="#00E5FF" stroke-width="4" stroke-linecap="round"/>
  <line x1="956" y1="500" x2="974" y2="500" stroke="#00E5FF" stroke-width="4" stroke-linecap="round"/>

  <!-- Lateral Tech Dividers -->
  <g transform="translate(105, 500)">
    <circle cx="0" cy="0" r="16" fill="#0B0F19" stroke="#00D2FF" stroke-width="2.5"/>
    <circle cx="0" cy="0" r="6" fill="#00E5FF"/>
    <path d="M -30,0 L -20,0" stroke="#00D2FF" stroke-width="2"/>
    <path d="M 20,0 L 30,0" stroke="#00D2FF" stroke-width="2"/>
  </g>
  <g transform="translate(895, 500)">
    <circle cx="0" cy="0" r="16" fill="#0B0F19" stroke="#00D2FF" stroke-width="2.5"/>
    <circle cx="0" cy="0" r="6" fill="#00E5FF"/>
    <path d="M -30,0 L -20,0" stroke="#00D2FF" stroke-width="2"/>
    <path d="M 20,0 L 30,0" stroke="#00D2FF" stroke-width="2"/>
  </g>

  <!-- ==================== ARC TYPOGRAPHY ==================== -->
  <!-- TOP: "NEXT" -->
  <text font-family="'Plus Jakarta Sans', 'Montserrat', -apple-system, sans-serif" font-size="54" font-weight="900" fill="#FFFFFF" letter-spacing="24">
    <textPath href="#top-arc" startOffset="50%" text-anchor="middle">
      NEXT
    </textPath>
  </text>

  <!-- BOTTOM: "CHALLENGE" -->
  <text font-family="'Plus Jakarta Sans', 'Montserrat', -apple-system, sans-serif" font-size="46" font-weight="900" fill="#00D2FF" letter-spacing="16">
    <textPath href="#bottom-arc" startOffset="50%" text-anchor="middle">
      CHALLENGE
    </textPath>
  </text>

  <!-- ==================== INNER TECH CORE ==================== -->
  <circle cx="500" cy="500" r="305" fill="#090E1A" stroke="#00366F" stroke-width="3"/>

  <!-- Sleek Minimalist Circuit Traces -->
  <g stroke="#00D2FF" stroke-width="2.5" fill="none" opacity="0.65" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 330,340 L 370,340 L 400,380 L 400,430"/>
    <circle cx="330" cy="340" r="4.5" fill="#00E5FF"/>
    <path d="M 310,380 L 360,380 L 380,410"/>
    <circle cx="310" cy="380" r="4.5" fill="#00E5FF"/>

    <path d="M 310,620 L 360,620 L 390,580 L 390,550"/>
    <circle cx="310" cy="620" r="4.5" fill="#00E5FF"/>
    <path d="M 330,660 L 380,660 L 410,620"/>
    <circle cx="330" cy="660" r="4.5" fill="#00E5FF"/>

    <path d="M 670,340 L 630,340 L 600,380 L 600,430"/>
    <circle cx="670" cy="340" r="4.5" fill="#00E5FF"/>
    <path d="M 690,380 L 640,380 L 620,410"/>
    <circle cx="690" cy="380" r="4.5" fill="#00E5FF"/>

    <path d="M 690,620 L 640,620 L 610,580 L 610,550"/>
    <circle cx="690" cy="620" r="4.5" fill="#00E5FF"/>
    <path d="M 670,660 L 620,660 L 590,620"/>
    <circle cx="670" cy="660" r="4.5" fill="#00E5FF"/>
  </g>

  <!-- Discrete Modern Code Badges -->
  <text x="500" y="275" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" fill="#38BDF8" letter-spacing="6" text-anchor="middle" opacity="0.85">0101 &lt;/&gt; 0101</text>
  <text x="270" y="508" font-family="'JetBrains Mono', monospace" font-size="28" font-weight="700" fill="#00E5FF" text-anchor="middle" opacity="0.9">{ }</text>
  <text x="730" y="508" font-family="'JetBrains Mono', monospace" font-size="28" font-weight="700" fill="#00E5FF" text-anchor="middle" opacity="0.9">&lt; / &gt;</text>
  <text x="500" y="735" font-family="'JetBrains Mono', monospace" font-size="15" font-weight="700" fill="#38BDF8" letter-spacing="4" text-anchor="middle" opacity="0.85">return challenge =&gt; next</text>

  <!-- ==================== CENTRAL STYLIZED 'N' ==================== -->
  <g filter="url(#neon-glow)" opacity="0.85">
    <path d="
      M 405,650
      L 405,350
      Q 405,335 420,335
      L 455,335
      Q 468,335 476,346
      L 535,455
      L 535,350
      Q 535,335 550,335
      L 580,335
      Q 595,335 595,350
      L 595,650
      Q 595,665 580,665
      L 545,665
      Q 532,665 524,654
      L 465,545
      L 465,650
      Q 465,665 450,665
      L 420,665
      Q 405,665 405,650 Z
    " fill="#00D2FF" opacity="0.3"/>
  </g>

  <path d="
    M 405,650
    L 405,350
    Q 405,335 420,335
    L 455,335
    Q 468,335 476,346
    L 535,455
    L 535,350
    Q 535,335 550,335
    L 580,335
    Q 595,335 595,350
    L 595,650
    Q 595,665 580,665
    L 545,665
    Q 532,665 524,654
    L 465,545
    L 465,650
    Q 465,665 450,665
    L 420,665
    Q 405,665 405,650 Z
  " fill="#00366F" stroke="#00E5FF" stroke-width="4.5" stroke-linejoin="round"/>

  <!-- Inner High-Tech Circuit Core Conduit -->
  <path d="
    M 435,630
    L 435,370
    Q 435,362 442,362
    L 448,362
    Q 456,362 462,370
    L 552,536
    L 552,370
    Q 552,362 560,362
    L 565,362
    Q 572,362 572,370
    L 572,630
    Q 572,638 565,638
    L 558,638
    Q 550,638 544,630
    L 454,464
    L 454,630
    Q 454,638 446,638
    L 442,638
    Q 435,638 435,630 Z
  " fill="#0B132B" stroke="#00F0FF" stroke-width="3" stroke-linejoin="round"/>

  <!-- Central Energy Core -->
  <path d="M 435,370 L 462,370 L 544,630 L 572,630" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.9"/>
  <circle cx="500" cy="500" r="7" fill="#00F0FF" filter="url(#neon-glow)"/>
  <circle cx="500" cy="500" r="3.5" fill="#FFFFFF"/>
</svg>'''

svg_path = os.path.join(out_dir, "modernized_logo.svg")
with open(svg_path, "w") as f:
    f.write(svg_content)
print(f"Updated SVG written to {svg_path}")

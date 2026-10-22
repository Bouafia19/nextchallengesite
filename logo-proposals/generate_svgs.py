import os

proposals_dir = "/home/next/next projects/nextchallengesite/logo-proposals"
os.makedirs(proposals_dir, exist_ok=True)

# ---------------------------------------------------------------------------
# CONCEPT 1: Geometric Nexus (NC Monogram)
# ---------------------------------------------------------------------------
def get_concept1_icon(dark=True):
    navy = "#38BDF8" if dark else "#00366F"
    navy_base = "#1E40AF" if dark else "#00366F"
    cyan = "#00D2FF"
    
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <linearGradient id="c1-grad-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00D2FF"/>
          <stop offset="100%" stop-color="#00F0FF"/>
        </linearGradient>
        <linearGradient id="c1-grad-navy" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="{navy_base}"/>
          <stop offset="100%" stop-color="#0284C7"/>
        </linearGradient>
      </defs>
      <!-- 'N' Left Pillar -->
      <path d="M 18,80 L 18,22 Q 18,18 22,18 L 32,18 Q 36,18 36,22 L 36,80 Q 36,84 32,84 L 22,84 Q 18,84 18,80 Z" fill="url(#c1-grad-navy)"/>
      <!-- 'N' Diagonal -->
      <path d="M 32,22 L 68,78 Q 71,82 76,82 L 80,82 Q 84,82 84,77 L 84,68 L 48,18 Q 44,14 38,14 L 32,14 Q 28,14 28,18 Z" fill="url(#c1-grad-cyan)"/>
      <!-- 'C' Outer Enclosure Arc / Tech Bracket -->
      <path d="M 52,18 L 74,18 Q 86,18 86,30 L 86,36 Q 86,40 82,40 L 76,40 Q 72,40 72,36 L 72,32 Q 72,28 66,28 L 52,28 Z" fill="url(#c1-grad-cyan)"/>
      <!-- 'C' Bottom Enclosure Arc -->
      <path d="M 52,82 L 74,82 Q 86,82 86,70 L 86,64 Q 86,60 82,60 L 76,60 Q 72,60 72,64 L 72,68 Q 72,72 66,72 L 52,72 Z" fill="url(#c1-grad-navy)"/>
      <!-- Core Energy Node -->
      <circle cx="50" cy="50" r="5" fill="#00E5FF"/>
    </svg>'''

# ---------------------------------------------------------------------------
# CONCEPT 2: The Kinetic Apex (Forward Chevron & Overcoming the Challenge)
# ---------------------------------------------------------------------------
def get_concept2_icon(dark=True):
    navy = "#0284C7" if dark else "#00366F"
    
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <linearGradient id="c2-navy-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="{navy}"/>
          <stop offset="100%" stop-color="#38BDF8"/>
        </linearGradient>
        <linearGradient id="c2-cyan-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#00D2FF"/>
          <stop offset="100%" stop-color="#38BDF8"/>
        </linearGradient>
      </defs>
      <!-- Base Enterprise Chevron (Facing Forward & Up) -->
      <path d="M 14,76 L 42,22 Q 45,16 52,16 L 56,16 Q 60,16 60,20 L 46,76 Q 44,82 38,82 L 20,82 Q 14,82 14,76 Z" fill="url(#c2-navy-grad)"/>
      <!-- Ascending Quantum Chevron (Thrusting Forward, Forming Dynamic 'N') -->
      <path d="M 44,78 L 74,24 Q 78,16 86,22 L 92,26 Q 96,30 92,36 L 64,84 Q 60,90 52,86 L 46,82 Q 42,80 44,78 Z" fill="url(#c2-cyan-grad)"/>
      <!-- Intersecting Speed Blade -->
      <polygon points="34,48 66,24 58,54 26,78" fill="#00E5FF" opacity="0.9"/>
      <!-- Forward Arrow Notch Tip -->
      <polygon points="86,22 96,28 88,36" fill="#FFFFFF" opacity="0.95"/>
    </svg>'''

# ---------------------------------------------------------------------------
# CONCEPT 3: The Digital Stack (Isometric Cloud & AI Prism)
# ---------------------------------------------------------------------------
def get_concept3_icon(dark=True):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <linearGradient id="c3-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38BDF8"/>
          <stop offset="100%" stop-color="#00E5FF"/>
        </linearGradient>
        <linearGradient id="c3-left" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#00366F"/>
          <stop offset="100%" stop-color="#0369A1"/>
        </linearGradient>
        <linearGradient id="c3-right" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#00D2FF"/>
          <stop offset="100%" stop-color="#0284C7"/>
        </linearGradient>
      </defs>
      <!-- Isometric Hexagonal Cube Structure -->
      <!-- Left Face (Navy Enterprise Foundation) -->
      <path d="M 50,50 L 15,31 L 15,70 Q 15,74 19,76 L 47,92 Q 50,94 50,90 Z" fill="url(#c3-left)"/>
      <!-- Right Face (Vibrant Cyan Digital Acceleration) -->
      <path d="M 50,50 L 85,31 L 85,70 Q 85,74 81,76 L 53,92 Q 50,94 50,90 Z" fill="url(#c3-right)"/>
      <!-- Top Face (Cloud / Innovation Surface) -->
      <path d="M 50,12 Q 53,10 57,12 L 83,27 Q 86,29 83,31 L 50,50 L 17,31 Q 14,29 17,27 L 43,12 Q 47,10 50,12 Z" fill="url(#c3-top)"/>
      <!-- Embedded Negative Space 'N' Core -->
      <path d="M 36,36 L 36,68 L 44,68 L 44,48 L 56,68 L 64,68 L 64,36 L 56,36 L 56,56 L 44,36 Z" fill="#FFFFFF" opacity="0.95"/>
    </svg>'''

# ---------------------------------------------------------------------------
# CONCEPT 4: The Infinite Horizon (Continuous Flow & Agile Loop)
# ---------------------------------------------------------------------------
def get_concept4_icon(dark=True):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <linearGradient id="c4-flow" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#00366F"/>
          <stop offset="30%" stop-color="#0284C7"/>
          <stop offset="70%" stop-color="#00D2FF"/>
          <stop offset="100%" stop-color="#00F0FF"/>
        </linearGradient>
      </defs>
      <!-- Elegant continuous tech ribbon forming an 'N' with dynamic infinity feel -->
      <path d="M 22,80 L 22,28 Q 22,18 32,18 Q 40,18 45,26 L 64,58 Q 70,68 76,68 Q 82,68 82,60 L 82,24 Q 82,18 88,18 Q 94,18 94,24 L 94,72 Q 94,82 84,82 Q 76,82 70,72 L 50,40 Q 45,32 40,32 Q 34,32 34,40 L 34,76 Q 34,84 28,84 Q 22,84 22,80 Z" fill="url(#c4-flow)"/>
      <!-- Upward Launch Pulse Indicator -->
      <circle cx="88" cy="20" r="5" fill="#00E5FF"/>
    </svg>'''

def get_icon(c_num, dark=True):
    if c_num == 1:
        return get_concept1_icon(dark)
    elif c_num == 2:
        return get_concept2_icon(dark)
    elif c_num == 3:
        return get_concept3_icon(dark)
    else:
        return get_concept4_icon(dark)

# ---------------------------------------------------------------------------
# HORIZONTAL LOCKUPS (Icon + NEXT CHALLENGE Typography)
# ---------------------------------------------------------------------------
def get_horizontal_lockup(concept_num, dark=True, width=440, height=84):
    bg = "#0B0F19" if dark else "#FFFFFF"
    text_next = "#FFFFFF" if dark else "#00366F"
    text_challenge = "#00D2FF" if dark else "#0284C7"
    border = "rgba(255,255,255,0.08)" if dark else "rgba(0,0,0,0.08)"
    icon_svg = get_icon(concept_num, dark)
        
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
      <rect width="{width}" height="{height}" fill="{bg}" rx="12" stroke="{border}" stroke-width="1"/>
      <g transform="translate(18, 14)">
        <svg width="56" height="56" viewBox="0 0 100 100">
          {icon_svg}
        </svg>
      </g>
      <!-- Typography -->
      <g transform="translate(90, 52)">
        <text font-family="'Plus Jakarta Sans', 'Montserrat', -apple-system, sans-serif" font-size="24" font-weight="900" letter-spacing="1.5" fill="{text_next}">
          NEXT
        </text>
        <text x="76" font-family="'Plus Jakarta Sans', 'Montserrat', -apple-system, sans-serif" font-size="24" font-weight="900" letter-spacing="1.5" fill="{text_challenge}">
          CHALLENGE
        </text>
      </g>
    </svg>'''

print("Writing standalone and lockup SVG files...")
concepts = [
    (1, "The Geometric Nexus", "NC Monogram"),
    (2, "The Kinetic Apex", "Forward Chevron"),
    (3, "The Digital Stack", "Cloud & AI Prism"),
    (4, "The Infinite Horizon", "Continuous Flow")
]

for c_num, name, tag in concepts:
    # Save standalone icons (dark and light)
    with open(f"{proposals_dir}/concept_{c_num}_icon_dark.svg", "w") as f:
        f.write(get_icon(c_num, True))
    with open(f"{proposals_dir}/concept_{c_num}_icon_light.svg", "w") as f:
        f.write(get_icon(c_num, False))
        
    # Save horizontal lockups (dark and light)
    with open(f"{proposals_dir}/concept_{c_num}_horizontal_dark.svg", "w") as f:
        f.write(get_horizontal_lockup(c_num, dark=True))
    with open(f"{proposals_dir}/concept_{c_num}_horizontal_light.svg", "w") as f:
        f.write(get_horizontal_lockup(c_num, dark=False))

print("All SVG mockups generated successfully!")

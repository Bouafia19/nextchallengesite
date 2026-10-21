# Next Challenge — Professional Company Website

> **Build. Innovate. Transform.**  
> Technology solutions built around your business.

A modern, high-performance company showcase website for **Next Challenge** (`nextchallenge.tech`), engineered with **Vue 3**, **Vuetify 4**, and **JavaScript**.

---

## 🏢 Company Profile

| Property | Details |
| :--- | :--- |
| **Company Name** | Next Challenge |
| **Legal Entity** | EURL NEXT CHALLENGE |
| **Production Domain** | [https://nextchallenge.tech](https://nextchallenge.tech) |
| **Headquarters** | El Hidab, Sétif, Algeria |
| **Direct Phone** | [`0552 56 96 54`](tel:0552569654) |
| **Official Email** | [`nextchallenge2021@gmail.com`](mailto:nextchallenge2021@gmail.com) |

---

## 🚀 Live Products & Deployments

The website showcases real products developed by Next Challenge, with direct links opening in new browser tabs:

1. **Fleetora** — *Unified Transportation & Carrier Fleet Platform*  
   - **URL:** [https://fleetora-web.onrender.com](https://fleetora-web.onrender.com)  
   - **Stack:** Vue 3, Vuetify 4, Logistics Ops, Real-time Tracking, Express 5  
   - **Action:** `View Fleetora`

2. **Inventory Demo** — *Modern Stock & Multi-Warehouse Operations*  
   - **URL:** [https://inventory-v2-web-demo.onrender.com](https://inventory-v2-web-demo.onrender.com)  
   - **Stack:** Vue 3, Pinia, Multi-Warehouse, Commercial Invoicing, Barcode Scanner, Algerian Dinar DA  
   - **Action:** `View Demo`

3. **Touriva** — *Comprehensive Tourism Experience Platform*  
   - **URL:** [https://touriva-web.onrender.com](https://touriva-web.onrender.com)  
   - **Stack:** Vue 3, Vuetify 4, Tourism Discovery, Excursions Booking, Artisan Marketplace  
   - **Action:** `Explore Touriva`

---

## 🛠️ Technology Stack

- **Frontend Framework:** Vue 3.5 (Composition API)
- **UI Component System:** Vuetify 4.3 (Custom Design System, Glassmorphic Cards, Dark & Light Themes)
- **Icons:** Material Design Icons (`@mdi/font`)
- **Build Tool:** Vite 6 with `vite-plugin-vuetify` (automatic tree-shaking)
- **Backend API & Preview Server:** Node.js, Express, Nodemailer
- **Styling:** Custom CSS design system, fluid typography, subtle glowing meshes, responsive layouts
- **Automated Verification:** Puppeteer test suite with headless Chrome screenshots

---

## 📂 Project Architecture

```
nextchallengesite/
├── public/
│   ├── favicon.svg             # Next Challenge official brand glyph
│   ├── robots.txt              # Search engine crawler directives
│   ├── sitemap.xml             # XML sitemap for nextchallenge.tech
│   └── _redirects              # Static SPA rewrite rule (/* -> /index.html 200)
├── server/
│   └── server.js               # Express backend API & static asset server
├── src/
│   ├── assets/
│   │   └── css/
│   │       └── main.css        # Tech company design system & glassmorphic tokens
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppNavbar.vue   # Sticky responsive navigation with drawer & "Let's Talk" CTA
│   │   │   ├── AppFooter.vue   # Comprehensive footer with links & social placeholders
│   │   │   └── BrandLogo.vue   # Official Next Challenge logo mark & wordmark
│   │   ├── sections/
│   │   │   ├── HeroSection.vue       # Hero section with primary & secondary CTAs
│   │   │   ├── ServicesSection.vue   # 10 core service cards with hover effects
│   │   │   ├── ProductsSection.vue   # Fleetora, Inventory Demo & Touriva showcase
│   │   │   ├── TechSection.vue       # Capabilities & 11-category technology matrix
│   │   │   ├── WhyUsSection.vue      # 6 key pillars of the Next Challenge advantage
│   │   │   ├── AboutSection.vue      # Company profile & official information card
│   │   │   └── ContactSection.vue    # Validated contact form connected to email API
│   │   └── ui/
│   │       └── TechVisualGraphic.vue # Interactive animated SVG architecture diagram
│   ├── config/
│   │   └── site.js             # Centralized configuration & environment bindings
│   ├── plugins/
│   │   └── vuetify.js          # Vuetify 4 theme setup (nextChallengeDark & Light)
│   ├── App.vue                 # Root application component
│   └── main.js                 # Application bootstrap
├── .env.example                # Documented environment variable template
├── .env                        # Local environment variables
├── index.html                  # SEO metadata, Open Graph, Twitter cards, JSON-LD Schema
├── package.json                # Project dependencies and npm scripts
├── render.yaml                 # Render Blueprint for Static Site & Web Service
├── test-site.js                # Automated browser verification test script
└── vite.config.js              # Vite build configuration
```

---

## 💻 Local Development

### 1. Install Dependencies
```bash
cd nextchallengesite
npm install
```

### 2. Start Vite Development Server
```bash
npm run dev
```
The development server will start at `http://localhost:5173`.

### 3. Start Backend Email API (Optional for Form Submissions)
```bash
npm run server
```
Runs the Express API on `http://localhost:5000` handling `/api/contact`.

---

## 🏗️ Production Build

To build the static production distribution:
```bash
npm run build
```
The optimized bundle is output to the `dist/` directory, ready for instant static deployment.

To preview the built production site locally:
```bash
npm run preview
```
Or run the integrated full-stack server serving the static build:
```bash
npm run start
```

---

## 🌐 Render Deployment

The repository includes `render.yaml` preconfigured for **Render**:

### Option A: Render Static Site (Recommended for Global Edge CDN)
1. In the **Render Dashboard**, click **New +** > **Static Site**.
2. Connect your Git repository.
3. Configure settings:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. In **Settings > Custom Domains**, add:
   - `nextchallenge.tech`
   - Configure DNS CNAME / ALIAS pointing to Render's URL.

### Option B: Unified Fullstack Web Service
1. In **Render Dashboard**, click **New +** > **Web Service**.
2. Settings:
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node server/server.js`
3. Add environment variables:
   - `CONTACT_RECEIVER_EMAIL`: `nextchallenge2021@gmail.com`
   - `SMTP_HOST`: (e.g. `smtp.gmail.com`)
   - `SMTP_USER`: (e.g. your Gmail address)
   - `SMTP_PASS`: (e.g. your Google App Password)
   - `SMTP_PORT`: `465` (with `SMTP_SECURE=true`) or `587`

---

## 🔒 Contact Form & Security

- **Target Email:** `nextchallenge2021@gmail.com`
- **Zero Exposed Credentials:** No SMTP credentials, tokens, or email secrets are stored in the frontend JavaScript bundle.
- **Client-Side Validation:** Validates full name, email format, subject, and message length before submission.
- **Rate Limiting:** The backend server includes rate limiting to prevent spam abuse.
- **Graceful Fallback:** If SMTP credentials are not yet configured on the server, submissions are securely captured in the server audit log with 200 OK client response, preventing user errors while waiting for mail server setup.

---

## 🧪 Automated Testing & Verification

Run the automated Puppeteer verification suite:
```bash
node test-site.js
```
The suite verifies:
- Page load and zero console errors
- SEO title and meta description
- Rendering of all sections (#home, #services, #products, #capabilities, #why-us, #about, #contact, footer)
- Exact URLs for Fleetora, Inventory Demo, and Touriva
- Phone (`tel:0552569654`) and email (`mailto:nextchallenge2021@gmail.com`) clickable links
- Contact form client-side validation and successful submission flow
- Mobile viewport navigation drawer opening
- Light/Dark theme switching
- Saves high-resolution visual proof screenshots in `test-screenshots/`

---

## 📄 License & Ownership

&copy; 2026 **Next Challenge** (EURL NEXT CHALLENGE). All rights reserved.  
El Hidab, Sétif, Algeria.

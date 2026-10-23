/**
 * Next Challenge — Central Website Configuration
 * Production Domain: https://nextchallenge.tech
 */

export const siteConfig = {
  name: 'Next Challenge',
  legalName: 'EURL NEXT CHALLENGE',
  tagline: 'Build. Innovate. Transform.',
  subTagline: 'Technology solutions built around your business.',
  heroDescription:
    'Next Challenge develops modern web applications, mobile apps, APIs, ERP platforms, e-commerce solutions, AI-powered systems, and cloud infrastructure tailored to the needs of modern businesses.',
  aboutDescription:
    'Next Challenge is a forward-thinking technology company based in Sétif, Algeria, dedicated to engineering high-impact digital solutions for modern businesses. We combine solid software engineering, intuitive user experiences, and scalable cloud architectures to transform operational challenges into competitive advantages.',
  
  domain: 'nextchallenge.tech',
  siteUrl: 'https://nextchallenge.tech',
  location: 'El Hidab, Sétif, Algeria',
  phone: '0552 56 96 54',
  phoneTel: 'tel:0552569654',
  email: 'nextchallenge2021@gmail.com',
  emailMailto: 'mailto:nextchallenge2021@gmail.com',

  // API base for contact form submissions
  contactApiEndpoint: import.meta.env.VITE_CONTACT_API_URL || '/api/contact',

  // Social Links
  social: {
    facebook: import.meta.env.VITE_FACEBOOK_URL || '',
    instagram: import.meta.env.VITE_INSTAGRAM_URL || '',
    linkedin: import.meta.env.VITE_LINKEDIN_URL || ''
  },

  // Navigation Links
  navLinks: [
    { key: 'home', label: 'Home', href: '#home' },
    { key: 'services', label: 'Services', href: '#services' },
    { key: 'products', label: 'Products', href: '#products' },
    { key: 'courses', label: 'Courses', href: '#courses' },
    { key: 'capabilities', label: 'Capabilities', href: '#capabilities' },
    { key: 'whyUs', label: 'Why Us', href: '#why-us' },
    { key: 'about', label: 'About Us', href: '#about' },
    { key: 'contact', label: 'Contact', href: '#contact' }
  ],

  // Products & Projects Showcase
  products: [
    {
      id: 'inventory-v2',
      slug: 'inventory-v2',
      key: 'inventoryDemo',
      name: 'Inventory V2',
      badge: 'Commercial Enterprise',
      category: 'Inventory & ERP System',
      tagline: 'Modern Stock & Multi-Warehouse Operations',
      shortDescription:
        'A modern inventory management solution designed to simplify product, stock, and business inventory operations.',
      overview:
        'Inventory V2 is a high-performance inventory, warehouse, and commercial management solution engineered for commercial distributors, retail operations, and multi-depot businesses. It covers the complete Order-to-Cash and Procure-to-Pay enterprise workflow with multi-warehouse stock ledgers, barcode scanning, commercial A4 invoicing, and 80mm thermal receipt printing. The live web demonstration runs 100% client-side with full browser localStorage persistence, zero-server latency, and realistic Algerian fiscal compliance (TVA 19%/9% and legal stamp duty).',
      buttonText: 'View Details',
      cardCta: 'Explore Details',
      demoCta: 'Open Live Demo',
      url: import.meta.env.VITE_INVENTORY_URL || 'https://inventory-v2-web-demo.onrender.com',
      logo: '/assets/products/inventory-v2/pallet.png',
      logoAlt: 'Inventory V2 Logo',
      icon: 'mdi-warehouse',
      gradient: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)',
      accentColor: '#10b981',
      tags: ['Vue 3', 'Pinia', 'Multi-Warehouse', 'Commercial Invoicing', 'Barcode Scanner', 'Algerian Dinar DA'],
      platforms: [
        { name: 'Web Demo (Browser-Native)', icon: 'mdi-web', color: '#10b981' },
        { name: 'Desktop Workstation (Electron / SQLite)', icon: 'mdi-monitor', color: '#38bdf8' },
        { name: 'POS Thermal Printer', icon: 'mdi-printer-pos', color: '#fbbf24' },
        { name: 'Barcode Scanner Hardware', icon: 'mdi-barcode-scan', color: '#a78bfa' }
      ],
      highlights: [
        'Multi-depot stock ledger & transfer tracking',
        'Commercial A4 Invoices & POS thermal receipts',
        'Algerian fiscal compliance (TVA 19%/9% & Timbre)',
        'Standalone client-side execution & offline persistence'
      ],
      applications: [
        {
          name: 'Interactive Web Demonstration',
          role: 'Interactive Live Demo',
          category: 'Browser-Native ERP Demo',
          url: 'https://inventory-v2-web-demo.onrender.com',
          icon: 'mdi-monitor-dashboard',
          badge: 'Live Production',
          accent: '#10b981',
          description:
            'Standalone browser-native demonstration with pre-loaded Algerian hardware catalog, local storage persistence, and zero-server dependency.'
        }
      ],
      apks: [],
      features: [
        {
          title: 'Multi-Warehouse Stock Ledger',
          description: 'Real-time stock counts across primary depots, secondary warehouses, and showroom locations with transactional transfer orders and automated inventory adjustments.',
          icon: 'mdi-warehouse'
        },
        {
          title: 'Algerian Fiscal Compliance',
          description: 'Native tax configuration supporting standard Algerian TVA rates (19% & 9%), legal stamp duty (Timbre fiscal up to 2,500 DA), and centime precision.',
          icon: 'mdi-file-certificate-outline'
        },
        {
          title: 'Document & Receipt Generation',
          description: 'Client-side commercial A4 PDF invoices generated dynamically with jsPDF, and standard 80mm thermal receipt layouts for POS checkout.',
          icon: 'mdi-receipt-text-outline'
        },
        {
          title: 'Barcode & SKU Scanning',
          description: 'Built-in Code128 barcode generation and label printing, fully compatible with standard USB/Bluetooth handheld optical scanners.',
          icon: 'mdi-barcode-scan'
        },
        {
          title: 'Order-to-Cash & Procure-to-Pay',
          description: 'Complete commercial workflow covering sales orders, customer receivables, credit notes, purchase orders, and supplier payables ledgers.',
          icon: 'mdi-swap-horizontal-bold'
        },
        {
          title: 'Offline-First Client Architecture',
          description: 'Operates with lightning speed directly inside the browser using relational localStorage simulation, requiring zero external database setup.',
          icon: 'mdi-shield-check-outline'
        }
      ],
      useCases: [
        {
          title: 'Wholesale Distributors & Importers',
          description: 'Manage high-volume catalog movements, track stock distribution across regional warehouses, and issue compliant commercial invoices.',
          icon: 'mdi-truck-cargo-container'
        },
        {
          title: 'Retail Outlets & Hardware Showrooms',
          description: 'Speed up customer checkout with fast barcode scanning, automatic tax calculations, and instant 80mm thermal receipt printing.',
          icon: 'mdi-storefront-outline'
        },
        {
          title: 'Depot & Inventory Supervisors',
          description: 'Execute accurate inventory audits, manage inter-warehouse stock transfer requisitions, and monitor real-time stock thresholds.',
          icon: 'mdi-clipboard-list-outline'
        }
      ]
    },
    {
      id: 'fleetora',
      slug: 'fleetora',
      key: 'fleetora',
      name: 'Fleetora',
      badge: 'Mobility & Logistics',
      category: 'Transportation Management Platform',
      tagline: 'Unified Transportation & Carrier Fleet Platform',
      shortDescription:
        'A modern fleet and transportation management solution designed to connect customers, drivers, vehicles, and transportation operations through a unified digital platform.',
      overview:
        'Fleetora is an end-to-end transportation and fleet mobility ecosystem engineered to modernize cargo logistics, vehicle routing, and carrier billing. It connects shippers with vetted carrier partners and drivers in real time, coordinated through a central administrative dispatch console. Built on modern cloud technologies (Node.js 24 LTS, Express 5, Vue 3.5, Vuetify 4, Socket.io, and Capacitor 6), Fleetora delivers live GPS telemetry, automated trip dispatching, transparent tariff calculations, and enterprise-grade billing.',
      buttonText: 'View Details',
      cardCta: 'Explore Details',
      demoCta: 'Open Live Demo',
      url: import.meta.env.VITE_FLEETORA_URL || 'https://fleetora-web.onrender.com',
      logo: '/assets/products/fleetora/fleetora-gps-icon.svg',
      logoAlt: 'Fleetora GPS Pin Logo',
      icon: 'mdi-truck-fast-outline',
      gradient: 'linear-gradient(135deg, #001f3f 0%, #00366f 50%, #0284c7 100%)',
      accentColor: '#0284c7',
      tags: ['Vue 3.5', 'Vuetify 4', 'Capacitor 6', 'Node.js 24', 'Express 5', 'Socket.io', 'Mongoose 8'],
      platforms: [
        { name: 'Customer Web & Mobile', icon: 'mdi-cellphone-link', color: '#0284c7' },
        { name: 'Driver Mobile App (Android)', icon: 'mdi-android', color: '#34d399' },
        { name: 'Operations Admin Panel', icon: 'mdi-shield-crown', color: '#f59e0b' },
        { name: 'Real-Time Cloud API (Express 5)', icon: 'mdi-server-network', color: '#a78bfa' }
      ],
      highlights: [
        'End-to-end trip & dispatch management',
        'Customer shipper booking portal',
        'Fleet partner & transporter administration',
        'Live tracking and tariff automation'
      ],
      applications: [
        {
          name: 'Client Booking Application',
          role: 'Customer / Shipper Portal',
          category: 'Shipper Booking & Tracking',
          url: 'https://fleetora-client.onrender.com',
          icon: 'mdi-account-circle-outline',
          badge: 'Customer Portal',
          accent: '#0284c7',
          description:
            'Interactive trip booking, Google Maps route planning, instant pricing estimation, and real-time cargo tracking for shippers.'
        },
        {
          name: 'Partner & Driver Application',
          role: 'Carrier / Driver Dispatch',
          category: 'Driver Dispatch Portal',
          url: 'https://fleetora-partner.onrender.com',
          icon: 'mdi-truck-delivery-outline',
          badge: 'Driver Portal',
          accent: '#10b981',
          description:
            'Real-time trip dispatch reception, GPS navigation, trip acceptance, driver onboarding, and carrier tariff settlement.'
        },
        {
          name: 'Administration Console',
          role: 'Operations & Management',
          category: 'Central Operations & RBAC',
          url: 'https://fleetora-admin.onrender.com',
          icon: 'mdi-shield-crown-outline',
          badge: 'Admin Panel',
          accent: '#f59e0b',
          description:
            'Comprehensive operations console with role-based access control, carrier fleet auditing, live vehicle telemetry, and billing.'
        },
        {
          name: 'Fleetora Web',
          role: 'Public Web Gateway',
          category: 'Public Gateway & Landing',
          url: 'https://fleetora-web.onrender.com',
          icon: 'mdi-web',
          badge: 'Web Gateway',
          accent: '#38bdf8',
          description:
            'Official web landing and booking gateway with service tiers, logistics features, and automated dispatch requests.'
        }
      ],
      apks: [
        {
          name: 'Fleetora Customer Mobile App',
          target: 'Shipper & Customer App',
          version: '1.0.0',
          size: '14 MB',
          file: '/downloads/fleetora/fleetora-client-production.apk',
          package: 'com.nextchallenge.tawssil',
          platform: 'Android 8.0+'
        },
        {
          name: 'Fleetora Partner & Driver App',
          target: 'Transporter & Driver App',
          version: '1.0.0',
          size: '14 MB',
          file: '/downloads/fleetora/fleetora-partner-production.apk',
          package: 'com.nextchallenge.tawssil_patenaire',
          platform: 'Android 8.0+'
        }
      ],
      features: [
        {
          title: 'Real-Time GPS Fleet Telemetry',
          description: 'Continuous driver tracking with sub-second WebSocket updates via Socket.io, Google Maps route visualization, and automated ETA calculation.',
          icon: 'mdi-map-marker-distance'
        },
        {
          title: 'Automated Tariff & Invoicing',
          description: 'Dynamic price estimation based on distance, cargo weight, and vehicle category with automated PDF invoice generation.',
          icon: 'mdi-calculator-variant-outline'
        },
        {
          title: 'Carrier Partner Verification & KYC',
          description: 'Document upload and verification workflows for carrier registration, vehicle inspections, and driver compliance.',
          icon: 'mdi-shield-account-outline'
        },
        {
          title: 'Cross-Platform Mobile Ecosystem',
          description: 'Production-ready Capacitor 6 mobile architecture delivering native performance, push notifications, and geolocation on Android.',
          icon: 'mdi-cellphone-check'
        },
        {
          title: 'Role-Based Administration Console',
          description: 'Fine-grained permissions and CASL ability rules for operations coordinators, fleet managers, and billing accountants.',
          icon: 'mdi-account-group-outline'
        },
        {
          title: 'Resilient Microservices & API Gateway',
          description: 'Dual-mount Express 5 architecture with Helmet protection, intelligent rate limiting, and graceful notification fallbacks.',
          icon: 'mdi-server-security'
        }
      ],
      useCases: [
        {
          title: 'Logistics Companies & Freight Fleets',
          description: 'Coordinate heavy-duty and light commercial vehicles, optimize transport routes, and oversee driver settlements from one portal.',
          icon: 'mdi-truck-trailer'
        },
        {
          title: 'Enterprise Shippers & Manufacturers',
          description: 'Schedule multi-point pick-up and drop-off shipments with real-time status updates and guaranteed delivery confirmations.',
          icon: 'mdi-factory'
        },
        {
          title: 'Independent Carrier Drivers',
          description: 'Receive nearby trip requests directly on mobile, navigate with live turn-by-turn routing, and monitor earned tariffs.',
          icon: 'mdi-account-tie'
        }
      ]
    },
    {
      id: 'touriva',
      slug: 'touriva',
      key: 'touriva',
      name: 'Touriva',
      badge: 'Tourism & Marketplace',
      category: 'Travel & Tourism Platform',
      tagline: 'Comprehensive Tourism Experience Platform',
      shortDescription:
        'A modern tourism and travel platform designed to provide digital solutions for tourism and travel-related services.',
      overview:
        'Touriva is a modern, full-stack tourism and travel experience platform engineered for travelers, certified tour guides, travel agencies, and tourism associations. It enables visitors to explore historical landmarks, discover natural attractions with interactive geo-spatial maps, book guided excursions, and purchase traditional artisanal crafts. Built with Vue 3.5, Vuetify 4, Node.js 24 LTS, Express 5, and Mongoose 9 with MongoDB 2dsphere geo-indexing, Touriva combines rich cultural discovery with a robust multi-tenant administrative ecosystem.',
      buttonText: 'View Details',
      cardCta: 'Explore Details',
      demoCta: 'Open Live Demo',
      url: import.meta.env.VITE_TOURIVA_URL || 'https://touriva-web.onrender.com',
      logo: '/assets/products/touriva/symbol.svg',
      logoAlt: 'Touriva Compass Symbol',
      icon: 'mdi-compass-outline',
      gradient: 'linear-gradient(135deg, #102d27 0%, #173f35 50%, #21866b 100%)',
      accentColor: '#21866b',
      tags: ['Vue 3.5', 'Vuetify 4', 'Tourism Discovery', 'Excursions Booking', 'Artisan Shop', 'Geo-spatial Search'],
      platforms: [
        { name: 'Web Application (Responsive & PWA)', icon: 'mdi-web', color: '#21866b' },
        { name: 'Administrative Portal (Touriva Admin)', icon: 'mdi-shield-crown', color: '#d9b98c' },
        { name: 'Geo-Spatial Cloud API (Express 5)', icon: 'mdi-database-marker', color: '#38bdf8' },
        { name: 'Artisan Travel Store (E-Commerce)', icon: 'mdi-storefront', color: '#fb923c' }
      ],
      highlights: [
        'Attraction discovery & interactive maps',
        'Guided excursion itineraries & booking',
        'Integrated artisan merchandise marketplace',
        'Dedicated agency & merchant vendor portals'
      ],
      applications: [
        {
          name: 'Touriva Web Application',
          role: 'Traveler Discovery & Booking',
          category: 'Tourism Discovery Portal',
          url: 'https://touriva-web.onrender.com',
          icon: 'mdi-compass-outline',
          badge: 'Public Platform',
          accent: '#21866b',
          description:
            'Interactive tourism discovery, geo-spatial maps, historical sites, guided excursion bookings, and regional artisan marketplace.'
        },
        {
          name: 'Administrative Console',
          role: 'Agency & Administration',
          category: 'Tourism Authority & Agency Portal',
          url: 'https://touriva-admin.onrender.com',
          icon: 'mdi-shield-crown-outline',
          badge: 'Admin Panel',
          accent: '#d9b98c',
          description:
            'Administrative portal for tourism site curation, hospitality listings, tour guide certification, and excursion reservations.'
        }
      ],
      apks: [],
      features: [
        {
          title: 'Geo-Spatial Attraction Discovery',
          description: 'Interactive map exploration leveraging MongoDB 2dsphere indexing for historical monuments, natural landmarks, hiking trails, and hospitality.',
          icon: 'mdi-map-marker-radius-outline'
        },
        {
          title: 'Guided Excursions & Booking',
          description: 'Curated day-trips, mountain treks, cultural tours, and group excursions with instant digital booking and itinerary timelines.',
          icon: 'mdi-hiking'
        },
        {
          title: 'Multi-Tenant Agency & Guide Portal',
          description: 'Dedicated portals for certified tour guides, hospitality managers, and travel agencies to manage listings and track traveler bookings.',
          icon: 'mdi-badge-account-outline'
        },
        {
          title: 'Artisan Merchandise Marketplace',
          description: 'Integrated e-commerce subsystem showcasing authentic regional crafts, traditional goods, and travel accessories.',
          icon: 'mdi-basket-outline'
        },
        {
          title: 'Multilingual & Culturally Localized',
          description: 'Complete trilingual support in Arabic (full RTL layout), French, and English, celebrating cultural heritage with tailored regional content.',
          icon: 'mdi-translate'
        },
        {
          title: 'High-Performance Cloud Architecture',
          description: 'Engineered with Vue 3.5, Vuetify 4, Node 24, Express 5, and Mongoose 9 for lightning-fast browsing and robust security.',
          icon: 'mdi-cloud-check-outline'
        }
      ],
      useCases: [
        {
          title: 'Travelers & Cultural Explorers',
          description: 'Discover hidden cultural gems, read localized historical guides, and book verified excursions directly from their browser.',
          icon: 'mdi-account-search-outline'
        },
        {
          title: 'Certified Guides & Travel Agencies',
          description: 'Publish verified itineraries, accept traveler reservations, manage group schedules, and expand their client reach.',
          icon: 'mdi-account-tie-voice'
        },
        {
          title: 'Regional Tourism Boards & Artisans',
          description: 'Showcase regional heritage, promote eco-tourism destinations, and sell authentic artisanal crafts to visitors.',
          icon: 'mdi-bank-outline'
        }
      ]
    }
  ],

  // 10 Core Services
  services: [
    {
      id: 'maintenance-support',
      key: 'maintenanceSupport',
      title: 'Maintenance & Support',
      description: 'Keep your applications secure, stable, and continuously improving.',
      icon: 'mdi-wrench-clock-outline',
      color: '#38bdf8',
      tags: ['24/7 Monitoring', 'Security Patches', 'Performance Tuning']
    },
    {
      id: 'bi-reporting',
      key: 'biReporting',
      title: 'Business Intelligence & Reporting',
      description: 'Transform your data into actionable insights.',
      icon: 'mdi-chart-box-outline',
      color: '#818cf8',
      tags: ['Executive Dashboards', 'KPI Tracking', 'Automated Reports']
    },
    {
      id: 'mobile-app-dev',
      key: 'mobileAppDev',
      title: 'Mobile App Development',
      description: 'Native-like mobile applications for Android and iOS using modern technologies.',
      icon: 'mdi-cellphone-link',
      color: '#34d399',
      tags: ['iOS & Android', 'Capacitor', 'Offline First']
    },
    {
      id: 'api-development',
      key: 'apiDevelopment',
      title: 'API Development & Integration',
      description: 'Connect your software with third-party services and internal systems.',
      icon: 'mdi-api',
      color: '#fbbf24',
      tags: ['REST & GraphQL', 'Webhooks', 'Microservices']
    },
    {
      id: 'ai-solutions',
      key: 'aiSolutions',
      title: 'AI Solutions',
      description: 'Integrate artificial intelligence into your business to automate processes and improve productivity.',
      icon: 'mdi-brain',
      color: '#c084fc',
      tags: ['Process Automation', 'LLM Integration', 'Smart Workflows']
    },
    {
      id: 'devops-cloud',
      key: 'devopsCloud',
      title: 'DevOps & Cloud Solutions',
      description: 'Automate deployment and ensure reliable, scalable infrastructure.',
      icon: 'mdi-cloud-sync-outline',
      color: '#60a5fa',
      tags: ['CI/CD Pipelines', 'Docker & Kubernetes', 'Zero-Downtime Deploy']
    },
    {
      id: 'ui-ux-design',
      key: 'uiUxDesign',
      title: 'UI/UX Design',
      description: 'Modern, user-centered interfaces that improve user experience and conversion.',
      icon: 'mdi-palette-outline',
      color: '#f472b6',
      tags: ['Wireframing', 'Design Systems', 'Interactive Prototyping']
    },
    {
      id: 'ecommerce',
      key: 'ecommerce',
      title: 'E-Commerce Solutions',
      description: 'Complete online selling platforms with secure payment integration.',
      icon: 'mdi-cart-check',
      color: '#fb923c',
      tags: ['Payment Gateways', 'Inventory Sync', 'Conversion Optimized']
    },
    {
      id: 'erp-dev',
      key: 'erpDev',
      title: 'ERP Development',
      description: 'Custom Enterprise Resource Planning solutions designed around your business processes.',
      icon: 'mdi-domain',
      color: '#2dd4bf',
      tags: ['Custom Modules', 'Multi-Warehouse', 'Commercial Invoicing']
    },
    {
      id: 'web-app-dev',
      key: 'webAppDev',
      title: 'Web Application Development',
      description: 'We build fast, secure, and scalable web applications tailored to your business needs.',
      icon: 'mdi-laptop',
      color: '#a78bfa',
      tags: ['Vue 3 & SPA', 'Enterprise Portals', 'Cloud Scale']
    }
  ],

  // Why Choose Next Challenge (6 pillars)
  whyChooseUs: [
    {
      id: 'business-focused',
      key: 'businessFocused',
      title: 'Business-Focused Solutions',
      description: 'We build technology around real business needs rather than generic solutions.',
      icon: 'mdi-bullseye-arrow',
      color: '#3b82f6'
    },
    {
      id: 'modern-tech',
      key: 'modernTech',
      title: 'Modern Technology',
      description: 'We use modern technologies and development practices to create scalable applications.',
      icon: 'mdi-lightning-bolt-outline',
      color: '#10b981'
    },
    {
      id: 'scalable-arch',
      key: 'scalableArch',
      title: 'Scalable Architecture',
      description: 'Our solutions are designed to grow with your business.',
      icon: 'mdi-layers-triple-outline',
      color: '#8b5cf6'
    },
    {
      id: 'continuous-support',
      key: 'continuousSupport',
      title: 'Continuous Support',
      description: 'We can maintain, improve, and evolve applications after deployment.',
      icon: 'mdi-shield-check-outline',
      color: '#06b6d4'
    },
    {
      id: 'end-to-end',
      key: 'endToEnd',
      title: 'End-to-End Development',
      description: 'From UI/UX and development to APIs, deployment, cloud infrastructure, and support.',
      icon: 'mdi-sync',
      color: '#f59e0b'
    },
    {
      id: 'innovation',
      key: 'innovation',
      title: 'Innovation',
      description: 'We use modern technologies including AI and automation to help businesses work smarter.',
      icon: 'mdi-creation',
      color: '#ec4899'
    }
  ],

  // Capabilities & Technology Matrix
  capabilities: [
    {
      key: 'web',
      title: 'Web Applications',
      subtitle: 'Modern Single Page & Progressive Web Applications',
      icon: 'mdi-web',
      technologies: ['Vue 3', 'Vuetify 4', 'Vite', 'HTML5/CSS3', 'TypeScript/JavaScript']
    },
    {
      key: 'mobile',
      title: 'Mobile Applications',
      subtitle: 'Cross-platform native-feeling mobile solutions',
      icon: 'mdi-cellphone',
      technologies: ['Android', 'iOS', 'Capacitor', 'PWA', 'Push Notifications']
    },
    {
      key: 'api',
      title: 'REST APIs',
      subtitle: 'Secure, high-throughput microservices and gateways',
      icon: 'mdi-server-network',
      technologies: ['Node.js', 'Express', 'JWT Authentication', 'Rate Limiting', 'OpenAPI']
    },
    {
      key: 'cloud',
      title: 'Cloud Infrastructure',
      subtitle: 'Resilient and highly available cloud deployments',
      icon: 'mdi-cloud-outline',
      technologies: ['Render', 'AWS', 'Nginx', 'SSL/TLS', 'High Availability']
    },
    {
      key: 'database',
      title: 'Database Systems',
      subtitle: 'Relational & document data models built for scale',
      icon: 'mdi-database-outline',
      technologies: ['MongoDB', 'PostgreSQL', 'SQLite', 'Redis Caching', 'Data Migrations']
    },
    {
      key: 'ai',
      title: 'AI Integration',
      subtitle: 'Intelligent automation and large language model tooling',
      icon: 'mdi-robot-outline',
      technologies: ['Ollama', 'OpenAI APIs', 'Prompt Workflows', 'Smart Data Extraction']
    },
    {
      key: 'bi',
      title: 'Business Intelligence',
      subtitle: 'Real-time analytics, dashboards, and reporting pipelines',
      icon: 'mdi-chart-timeline-variant',
      technologies: ['jsPDF Exports', 'Interactive Charts', 'Aggregation Pipelines', 'KPIs']
    },
    {
      key: 'erp',
      title: 'ERP Systems',
      subtitle: 'Tailored enterprise resource management software',
      icon: 'mdi-office-building-cog',
      technologies: ['Stock Accounting', 'Multi-Warehouse', 'Commercial Invoicing', 'DA Tax Rules']
    },
    {
      key: 'ecommerce',
      title: 'E-Commerce',
      subtitle: 'End-to-end multi-tenant digital storefronts',
      icon: 'mdi-cart-outline',
      technologies: ['Cart Checkout', 'Payment Gateways', 'Order Tracking', 'Artisan Portals']
    },
    {
      key: 'devops',
      title: 'DevOps',
      subtitle: 'Automated CI/CD pipelines & release automation',
      icon: 'mdi-git',
      technologies: ['Git Workflows', 'Automated Builds', 'Linting', 'Zero-Downtime Rollouts']
    },
    {
      key: 'uiux',
      title: 'UI/UX Design',
      subtitle: 'Design systems crafted for clarity, contrast, and speed',
      icon: 'mdi-draw',
      technologies: ['Design Tokens', 'Figma Prototyping', 'Accessibility (WCAG)', 'Responsive UI']
    }
  ]
};

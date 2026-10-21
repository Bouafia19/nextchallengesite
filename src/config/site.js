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
    { label: 'Home', href: '#home' },
    { label: 'Services', href: '#services' },
    { label: 'Products', href: '#products' },
    { label: 'Capabilities', href: '#capabilities' },
    { label: 'Why Us', href: '#why-us' },
    { label: 'About Us', href: '#about' },
    { label: 'Contact', href: '#contact' }
  ],

  // Products & Projects Showcase
  products: [
    {
      id: 'fleetora',
      name: 'Fleetora',
      badge: 'Mobility & Logistics',
      category: 'Transportation Management Platform',
      tagline: 'Unified Transportation & Carrier Fleet Platform',
      description:
        'A modern fleet and transportation management solution designed to connect customers, drivers, vehicles, and transportation operations through a unified digital platform.',
      buttonText: 'View Fleetora',
      url: import.meta.env.VITE_FLEETORA_URL || 'https://fleetora-web.onrender.com',
      icon: 'mdi-truck-fast-outline',
      gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      accentColor: '#3b82f6',
      tags: ['Vue 3', 'Vuetify 4', 'Logistics Ops', 'Real-time Tracking', 'Carrier Billing', 'Express 5'],
      highlights: [
        'End-to-end trip & dispatch management',
        'Customer shipper booking portal',
        'Fleet partner & transporter administration',
        'Live tracking and tariff automation'
      ]
    },
    {
      id: 'inventory-demo',
      name: 'Inventory Demo',
      badge: 'Commercial Enterprise',
      category: 'Inventory & ERP System',
      tagline: 'Modern Stock & Multi-Warehouse Operations',
      description:
        'A modern inventory management solution designed to simplify product, stock, and business inventory operations.',
      buttonText: 'View Demo',
      url: import.meta.env.VITE_INVENTORY_URL || 'https://inventory-v2-web-demo.onrender.com',
      icon: 'mdi-warehouse',
      gradient: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
      accentColor: '#10b981',
      tags: ['Vue 3', 'Pinia', 'Multi-Warehouse', 'Commercial Invoicing', 'Barcode Scanner', 'Algerian Dinar DA'],
      highlights: [
        'Multi-depot stock ledger & transfer tracking',
        'Commercial A4 Invoices & POS thermal receipts',
        'Algerian fiscal compliance (TVA 19%/9% & Timbre)',
        'Standalone client-side execution & offline persistence'
      ]
    },
    {
      id: 'touriva',
      name: 'Touriva',
      badge: 'Tourism & Marketplace',
      category: 'Travel & Tourism Platform',
      tagline: 'Comprehensive Tourism Experience Platform',
      description:
        'A modern tourism and travel platform designed to provide digital solutions for tourism and travel-related services.',
      buttonText: 'Explore Touriva',
      url: import.meta.env.VITE_TOURIVA_URL || 'https://touriva-web.onrender.com',
      icon: 'mdi-compass-outline',
      gradient: 'linear-gradient(135deg, #7c2d12 0%, #f97316 100%)',
      accentColor: '#f97316',
      tags: ['Vue 3', 'Vuetify 4', 'Tourism Discovery', 'Excursions Booking', 'Artisan Shop', 'Geo-spatial Search'],
      highlights: [
        'Attraction discovery & interactive maps',
        'Guided excursion itineraries & booking',
        'Integrated artisan merchandise marketplace',
        'Dedicated agency & merchant vendor portals'
      ]
    }
  ],

  // 10 Core Services
  services: [
    {
      id: 'maintenance-support',
      title: 'Maintenance & Support',
      description: 'Keep your applications secure, stable, and continuously improving.',
      icon: 'mdi-wrench-clock-outline',
      color: '#38bdf8',
      tags: ['24/7 Monitoring', 'Security Patches', 'Performance Tuning']
    },
    {
      id: 'bi-reporting',
      title: 'Business Intelligence & Reporting',
      description: 'Transform your data into actionable insights.',
      icon: 'mdi-chart-box-outline',
      color: '#818cf8',
      tags: ['Executive Dashboards', 'KPI Tracking', 'Automated Reports']
    },
    {
      id: 'mobile-app-dev',
      title: 'Mobile App Development',
      description: 'Native-like mobile applications for Android and iOS using modern technologies.',
      icon: 'mdi-cellphone-link',
      color: '#34d399',
      tags: ['iOS & Android', 'Capacitor', 'Offline First']
    },
    {
      id: 'api-development',
      title: 'API Development & Integration',
      description: 'Connect your software with third-party services and internal systems.',
      icon: 'mdi-api',
      color: '#fbbf24',
      tags: ['REST & GraphQL', 'Webhooks', 'Microservices']
    },
    {
      id: 'ai-solutions',
      title: 'AI Solutions',
      description: 'Integrate artificial intelligence into your business to automate processes and improve productivity.',
      icon: 'mdi-brain',
      color: '#c084fc',
      tags: ['Process Automation', 'LLM Integration', 'Smart Workflows']
    },
    {
      id: 'devops-cloud',
      title: 'DevOps & Cloud Solutions',
      description: 'Automate deployment and ensure reliable, scalable infrastructure.',
      icon: 'mdi-cloud-sync-outline',
      color: '#60a5fa',
      tags: ['CI/CD Pipelines', 'Docker & Kubernetes', 'Zero-Downtime Deploy']
    },
    {
      id: 'ui-ux-design',
      title: 'UI/UX Design',
      description: 'Modern, user-centered interfaces that improve user experience and conversion.',
      icon: 'mdi-palette-outline',
      color: '#f472b6',
      tags: ['Wireframing', 'Design Systems', 'Interactive Prototyping']
    },
    {
      id: 'ecommerce',
      title: 'E-Commerce Solutions',
      description: 'Complete online selling platforms with secure payment integration.',
      icon: 'mdi-cart-check',
      color: '#fb923c',
      tags: ['Payment Gateways', 'Inventory Sync', 'Conversion Optimized']
    },
    {
      id: 'erp-dev',
      title: 'ERP Development',
      description: 'Custom Enterprise Resource Planning solutions designed around your business processes.',
      icon: 'mdi-domain',
      color: '#2dd4bf',
      tags: ['Custom Modules', 'Multi-Warehouse', 'Commercial Invoicing']
    },
    {
      id: 'web-app-dev',
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
      title: 'Business-Focused Solutions',
      description: 'We build technology around real business needs rather than generic solutions.',
      icon: 'mdi-bullseye-arrow',
      color: '#3b82f6'
    },
    {
      id: 'modern-tech',
      title: 'Modern Technology',
      description: 'We use modern technologies and development practices to create scalable applications.',
      icon: 'mdi-lightning-bolt-outline',
      color: '#10b981'
    },
    {
      id: 'scalable-arch',
      title: 'Scalable Architecture',
      description: 'Our solutions are designed to grow with your business.',
      icon: 'mdi-layers-triple-outline',
      color: '#8b5cf6'
    },
    {
      id: 'continuous-support',
      title: 'Continuous Support',
      description: 'We can maintain, improve, and evolve applications after deployment.',
      icon: 'mdi-shield-check-outline',
      color: '#06b6d4'
    },
    {
      id: 'end-to-end',
      title: 'End-to-End Development',
      description: 'From UI/UX and development to APIs, deployment, cloud infrastructure, and support.',
      icon: 'mdi-sync',
      color: '#f59e0b'
    },
    {
      id: 'innovation',
      title: 'Innovation',
      description: 'We use modern technologies including AI and automation to help businesses work smarter.',
      icon: 'mdi-creation',
      color: '#ec4899'
    }
  ],

  // Capabilities & Technology Matrix
  capabilities: [
    {
      title: 'Web Applications',
      subtitle: 'Modern Single Page & Progressive Web Applications',
      icon: 'mdi-web',
      technologies: ['Vue 3', 'Vuetify 4', 'Vite', 'HTML5/CSS3', 'TypeScript/JavaScript']
    },
    {
      title: 'Mobile Applications',
      subtitle: 'Cross-platform native-feeling mobile solutions',
      icon: 'mdi-cellphone',
      technologies: ['Android', 'iOS', 'Capacitor', 'PWA', 'Push Notifications']
    },
    {
      title: 'REST APIs',
      subtitle: 'Secure, high-throughput microservices and gateways',
      icon: 'mdi-server-network',
      technologies: ['Node.js', 'Express', 'JWT Authentication', 'Rate Limiting', 'OpenAPI']
    },
    {
      title: 'Cloud Infrastructure',
      subtitle: 'Resilient and highly available cloud deployments',
      icon: 'mdi-cloud-outline',
      technologies: ['Render', 'AWS', 'Nginx', 'SSL/TLS', 'High Availability']
    },
    {
      title: 'Database Systems',
      subtitle: 'Relational & document data models built for scale',
      icon: 'mdi-database-outline',
      technologies: ['MongoDB', 'PostgreSQL', 'SQLite', 'Redis Caching', 'Data Migrations']
    },
    {
      title: 'AI Integration',
      subtitle: 'Intelligent automation and large language model tooling',
      icon: 'mdi-robot-outline',
      technologies: ['Ollama', 'OpenAI APIs', 'Prompt Workflows', 'Smart Data Extraction']
    },
    {
      title: 'Business Intelligence',
      subtitle: 'Real-time analytics, dashboards, and reporting pipelines',
      icon: 'mdi-chart-timeline-variant',
      technologies: ['jsPDF Exports', 'Interactive Charts', 'Aggregation Pipelines', 'KPIs']
    },
    {
      title: 'ERP Systems',
      subtitle: 'Tailored enterprise resource management software',
      icon: 'mdi-office-building-cog',
      technologies: ['Stock Accounting', 'Multi-Warehouse', 'Commercial Invoicing', 'DA Tax Rules']
    },
    {
      title: 'E-Commerce',
      subtitle: 'End-to-end multi-tenant digital storefronts',
      icon: 'mdi-cart-outline',
      technologies: ['Cart Checkout', 'Payment Gateways', 'Order Tracking', 'Artisan Portals']
    },
    {
      title: 'DevOps',
      subtitle: 'Automated CI/CD pipelines & release automation',
      icon: 'mdi-git',
      technologies: ['Git Workflows', 'Automated Builds', 'Linting', 'Zero-Downtime Rollouts']
    },
    {
      title: 'UI/UX Design',
      subtitle: 'Design systems crafted for clarity, contrast, and speed',
      icon: 'mdi-draw',
      technologies: ['Design Tokens', 'Figma Prototyping', 'Accessibility (WCAG)', 'Responsive UI']
    }
  ]
};

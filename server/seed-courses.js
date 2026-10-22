import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

dotenv.config({ path: path.resolve(rootDir, '.env') })
dotenv.config()

import { connectDB } from './db.js'
import Course from './models/Course.js'
import mongoose from 'mongoose'

const initialCourses = [
  {
    title: 'Full Stack Web Engineering',
    slug: 'full-stack-web-engineering',
    description:
      'Comprehensive software engineering program mastering modern responsive frontend development with Vue 3 and scalable backend architectures with Node.js, Express, and MongoDB Atlas.',
    badge: 'Career Track',
    duration: '12 Weeks (Intensive)',
    level: 'Beginner to Advanced',
    icon: 'mdi-code-tags-check',
    order: 1,
    isActive: true,
    technologies: [
      'HTML5',
      'CSS3',
      'JavaScript (ES6+)',
      'Vue.js 3',
      'Vuetify 3',
      'Node.js',
      'Express.js',
      'MongoDB Atlas',
      'REST APIs',
      'Git & Cloud CI/CD'
    ],
    syllabus: [
      {
        level: 'Level 1',
        title: 'HTML, CSS & Modern JavaScript Fundamentals',
        topics: [
          'HTML5 semantic structure & web accessibility (WCAG)',
          'CSS3 modern layout engines: Flexbox, CSS Grid & responsive typography',
          'JavaScript fundamentals: DOM manipulation, event-driven design, and modern ES6+ syntax'
        ]
      },
      {
        level: 'Level 2',
        title: 'Intermediate JavaScript & Vue.js 3 Frontend Engineering',
        topics: [
          'Intermediate & Advanced JS: Async/Await, Promises, Closures & modular design',
          'Vue.js 3 Composition API, reactive state management, and component architecture',
          'Vuetify 3 design system, single-page application (SPA) routing, and API integration'
        ]
      },
      {
        level: 'Level 3',
        title: 'Node.js, Express, MongoDB Atlas & Cloud Deployment',
        topics: [
          'Node.js runtime environment & Express.js server architecture',
          'MongoDB Atlas cloud database integration & Mongoose schema modeling',
          'RESTful API security, authentication middleware, and live production deployment'
        ]
      }
    ]
  },
  {
    title: 'Odoo ERP & Python Development',
    slug: 'odoo-erp-python-development',
    description:
      'Enterprise software program focusing on professional Python programming, PostgreSQL relational databases, and building customized enterprise resource planning (ERP) modules with Odoo.',
    badge: 'Enterprise Specialist',
    duration: '10 Weeks',
    level: 'Intermediate',
    icon: 'mdi-cogs',
    order: 2,
    isActive: true,
    technologies: [
      'Python 3',
      'Odoo 17/18',
      'PostgreSQL',
      'XML & QWeb',
      'ERP Architecture',
      'REST API Integration',
      'Linux Server Admin'
    ],
    syllabus: [
      {
        level: 'Level 1',
        title: 'Python Core Programming & Relational Databases',
        topics: [
          'Python 3 programming idioms, data structures, and object-oriented design (OOP)',
          'PostgreSQL relational schema modeling, constraints, indexing, and SQL queries',
          'Development environment setup with Linux, virtual environments, and Git'
        ]
      },
      {
        level: 'Level 2',
        title: 'Odoo Framework Fundamentals & Custom Module Development',
        topics: [
          'Odoo ORM architecture: models, fields, inheritance & automated constraints',
          'Building XML views: Form, List/Tree, Kanban views, and dynamic actions',
          'Security rules, Access Control Lists (ir.model.access.csv) & record-level access'
        ]
      },
      {
        level: 'Level 3',
        title: 'Advanced Business Workflows, QWeb Reports & Integrations',
        topics: [
          'Customizing core business workflows (Invoicing, Sales, Inventory & CRM)',
          'Automated QWeb PDF reports, email templates & scheduled cron actions',
          'External REST API connectors, third-party webhook integrations, and production deployment'
        ]
      }
    ]
  },
  {
    title: 'Joomla CMS Mastery',
    slug: 'joomla-cms-mastery',
    description:
      'In-depth masterclass for designing, customizing, and scaling enterprise web portals and CMS platforms using Joomla 5, template overrides, and custom extension engineering.',
    badge: 'CMS Solutions',
    duration: '6 Weeks',
    level: 'Beginner to Intermediate',
    icon: 'mdi-view-dashboard-outline',
    order: 3,
    isActive: true,
    technologies: [
      'Joomla 5',
      'PHP 8',
      'MySQL / MariaDB',
      'Bootstrap 5',
      'Template Overrides',
      'Custom Extensions',
      'Web Security'
    ],
    syllabus: [
      {
        level: 'Level 1',
        title: 'Joomla 5 Architecture & Multi-Language Portals',
        topics: [
          'Joomla 5 modern core concepts, categories, articles, and Access Control Levels (ACL)',
          'Configuring multi-lingual portals (French, Arabic, English) with RTL support',
          'Custom Fields (CCK) setup for structured corporate and catalog content'
        ]
      },
      {
        level: 'Level 2',
        title: 'Template Customization & Child Template Overrides',
        topics: [
          'Joomla child template system, CSS/Sass compilation, and UI component styling',
          'Template overrides: customizing component views and module outputs safely',
          'SEO optimization, responsive asset bundling, and core web vitals acceleration'
        ]
      },
      {
        level: 'Level 3',
        title: 'Custom Extension Development & Production Hardening',
        topics: [
          'Developing custom Joomla modules and content automation plugins with PHP 8',
          'Database abstraction layer, secure prepared statements, and form handlers',
          'Backup automation, SSL security headers, and production hardening against exploits'
        ]
      }
    ]
  }
]

async function seed() {
  console.log('🌱 Starting Next Challenge Curriculum Seeding...')

  try {
    await connectDB()

    for (const courseData of initialCourses) {
      const existing = await Course.findOne({ title: courseData.title })

      if (existing) {
        Object.assign(existing, courseData)
        await existing.save()
        console.log(`✔ Updated existing course: "${courseData.title}" (ID: ${existing._id})`)
      } else {
        const created = await Course.create(courseData)
        console.log(`✔ Created new course: "${courseData.title}" (ID: ${created._id})`)
      }
    }

    const total = await Course.countDocuments()
    console.log(`\n🎉 Seeding completed successfully! Total courses in database: ${total}`)
  } catch (err) {
    console.error('❌ Seeding failed with error:', err)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB.')
  }
}

seed()

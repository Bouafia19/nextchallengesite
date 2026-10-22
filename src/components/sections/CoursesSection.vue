<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const isRtl = computed(() => locale.value === 'ar')

const courses = ref([])
const isLoading = ref(true)
const selectedFilter = ref('all')
const expandedLevels = ref({}) // courseId -> level index

// Fallback initial curriculum to ensure zero layout shift
const fallbackCourses = [
  {
    _id: 'c1',
    title: 'Full Stack Web Engineering',
    slug: 'full-stack-web-engineering',
    description:
      'Comprehensive software engineering program mastering modern responsive frontend development with Vue 3 and scalable backend architectures with Node.js, Express, and MongoDB Atlas.',
    badge: 'Career Track',
    duration: '12 Weeks',
    level: 'Beginner to Advanced',
    icon: 'mdi-code-tags-check',
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'Vue.js 3', 'Vuetify 3', 'Node.js', 'Express.js', 'MongoDB Atlas'],
    syllabus: [
      {
        level: 'Level 1',
        title: 'HTML, CSS & Modern JavaScript Fundamentals',
        topics: [
          'HTML5 semantic structure & accessibility standards',
          'Modern CSS3: Flexbox, CSS Grid & responsive typography',
          'Vanilla JavaScript (ES6+), DOM architecture & event lifecycle'
        ]
      },
      {
        level: 'Level 2',
        title: 'Intermediate JavaScript & Vue.js 3 Engineering',
        topics: [
          'Intermediate & Advanced JS: Async/Await, Promises & modular architecture',
          'Vue.js 3 Composition API, reactive state management, and reusable components',
          'Vuetify 3 design system, SPA client routing, and REST API integration'
        ]
      },
      {
        level: 'Level 3',
        title: 'Node.js, Express, MongoDB Atlas & Cloud Deployment',
        topics: [
          'Node.js runtime environment & Express.js REST API engineering',
          'MongoDB Atlas cloud database integration & Mongoose schema modeling',
          'API security, authentication middleware, and live production deployment'
        ]
      }
    ]
  },
  {
    _id: 'c2',
    title: 'Odoo ERP & Python Development',
    slug: 'odoo-erp-python-development',
    description:
      'Enterprise software program focusing on professional Python programming, PostgreSQL relational databases, and building customized enterprise resource planning (ERP) modules with Odoo.',
    badge: 'Enterprise Specialist',
    duration: '10 Weeks',
    level: 'Intermediate',
    icon: 'mdi-cogs',
    technologies: ['Python 3', 'Odoo 17/18', 'PostgreSQL', 'XML / QWeb', 'ERP Architecture', 'REST APIs'],
    syllabus: [
      {
        level: 'Level 1',
        title: 'Python Core Programming & Relational Databases',
        topics: [
          'Python 3 idioms, data structures, and object-oriented design (OOP)',
          'PostgreSQL schema modeling, relations, constraints, and SQL queries',
          'Development environment setup with Linux, virtual environments, and Git'
        ]
      },
      {
        level: 'Level 2',
        title: 'Odoo Framework Fundamentals & Custom Module Development',
        topics: [
          'Odoo ORM models, fields, inheritance & automated business constraints',
          'Building XML views: Form, List/Tree, Kanban views, and dynamic actions',
          'Security rules, Access Control Lists (ACLs) & record-level access'
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
    _id: 'c3',
    title: 'Joomla CMS Mastery',
    slug: 'joomla-cms-mastery',
    description:
      'In-depth masterclass for designing, customizing, and scaling enterprise web portals and CMS platforms using Joomla 5, template overrides, and custom extension engineering.',
    badge: 'CMS Solutions',
    duration: '6 Weeks',
    level: 'Beginner to Intermediate',
    icon: 'mdi-view-dashboard-outline',
    technologies: ['Joomla 5', 'PHP 8', 'MySQL', 'Bootstrap 5', 'Template Overrides', 'CMS Security'],
    syllabus: [
      {
        level: 'Level 1',
        title: 'Joomla 5 Architecture & Multi-Language Portals',
        topics: [
          'Joomla 5 modern core concepts, categories, articles, and ACL permissions',
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

const fetchPublicCourses = async () => {
  isLoading.value = true
  try {
    const res = await fetch('/api/courses')
    if (res.ok) {
      const data = await res.json()
      if (data.courses && data.courses.length > 0) {
        courses.value = data.courses
        return
      }
    }
    courses.value = fallbackCourses
  } catch {
    courses.value = fallbackCourses
  } finally {
    isLoading.value = false
  }
}

// Filtered programs
const filteredCourses = computed(() => {
  if (selectedFilter.value === 'all') return courses.value
  return courses.value.filter((course) =>
    course.technologies?.some((t) => t.toLowerCase().includes(selectedFilter.value.toLowerCase()))
  )
})

// Trigger enrollment interest in contact section
const enrollInCourse = (course) => {
  window.dispatchEvent(
    new CustomEvent('select-contact-subject', {
      detail: { subject: `Training Program: ${course.title}` }
    })
  )

  const contactEl = document.querySelector('#contact')
  if (contactEl) {
    contactEl.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(() => {
  fetchPublicCourses()
})
</script>

<template>
  <section id="courses" class="courses-section section-pad border-gradient-top">
    <v-container>
      <!-- Section Header -->
      <div class="text-center max-w-700 mx-auto mb-12">
        <span class="badge-pill mb-3">
          <v-icon icon="mdi-school-outline" size="16" color="#00c2ff" class="mr-1" />
          {{ t('courses.badge', 'Curriculum & Academics') }}
        </span>
        <h2 class="text-h3 font-weight-bold mb-4 tracking-tight text-white">
          <span class="text-gradient-cyan">{{ t('courses.titleHighlight', 'Engineering Masterclasses') }}</span>
          {{ t('courses.titleEnd', '& Practical Training') }}
        </h2>
        <p class="text-body-1 text-grey-lighten-1 line-height-relaxed">
          {{
            t(
              'courses.subtitle',
              'Industry-aligned software training programs in Sétif, Algeria. Build production-grade skills through hands-on development in Full Stack Web, Enterprise ERP, and CMS platforms.'
            )
          }}
        </p>

        <!-- Technology Category Filters -->
        <div class="d-flex align-center justify-center flex-wrap ga-2 mt-6">
          <v-btn
            size="small"
            :variant="selectedFilter === 'all' ? 'flat' : 'outlined'"
            :color="selectedFilter === 'all' ? '#00366F' : 'grey-lighten-1'"
            class="filter-btn font-weight-bold"
            @click="selectedFilter = 'all'"
          >
            All Tracks ({{ courses.length }})
          </v-btn>
          <v-btn
            size="small"
            :variant="selectedFilter === 'vue' ? 'flat' : 'outlined'"
            :color="selectedFilter === 'vue' ? '#00366F' : 'grey-lighten-1'"
            class="filter-btn font-weight-bold"
            @click="selectedFilter = 'vue'"
          >
            Web & Vue.js
          </v-btn>
          <v-btn
            size="small"
            :variant="selectedFilter === 'odoo' ? 'flat' : 'outlined'"
            :color="selectedFilter === 'odoo' ? '#00366F' : 'grey-lighten-1'"
            class="filter-btn font-weight-bold"
            @click="selectedFilter = 'odoo'"
          >
            Odoo & Python
          </v-btn>
          <v-btn
            size="small"
            :variant="selectedFilter === 'joomla' ? 'flat' : 'outlined'"
            :color="selectedFilter === 'joomla' ? '#00366F' : 'grey-lighten-1'"
            class="filter-btn font-weight-bold"
            @click="selectedFilter = 'joomla'"
          >
            Joomla & CMS
          </v-btn>
        </div>
      </div>

      <!-- Courses Grid -->
      <v-row class="gy-8">
        <v-col
          v-for="course in filteredCourses"
          :key="course._id || course.title"
          cols="12"
          lg="4"
          md="6"
          class="d-flex"
        >
          <v-card class="course-card w-100 d-flex flex-column justify-space-between elevation-12">
            <div>
              <!-- Course Card Header with Glowing Accents -->
              <div class="course-card-top pa-6">
                <div class="d-flex align-center justify-space-between mb-4">
                  <!-- Icon Box -->
                  <div class="course-icon-box">
                    <v-icon :icon="course.icon || 'mdi-code-braces'" size="28" color="#00c2ff" />
                  </div>

                  <!-- Badge & Duration -->
                  <div class="d-flex align-center ga-2">
                    <v-chip
                      size="x-small"
                      color="#00c2ff"
                      variant="flat"
                      class="text-slate-900 font-weight-bold px-2"
                    >
                      {{ course.badge || 'Professional' }}
                    </v-chip>
                    <v-chip
                      v-if="course.duration"
                      size="x-small"
                      color="blue-lighten-3"
                      variant="tonal"
                      class="font-weight-medium"
                    >
                      <v-icon icon="mdi-clock-outline" size="12" class="mr-1" />
                      {{ course.duration }}
                    </v-chip>
                  </div>
                </div>

                <!-- Course Title & Description -->
                <h3 class="text-h5 font-weight-bold text-white mb-3">
                  {{ course.title }}
                </h3>
                <p class="text-body-2 text-slate-300 mb-4 line-height-relaxed">
                  {{ course.description }}
                </p>

                <!-- Technology Tags Pill Cloud -->
                <div class="d-flex flex-wrap ga-1-5 mb-5">
                  <span
                    v-for="tech in course.technologies"
                    :key="tech"
                    class="tech-tag-pill text-caption px-2 py-0-5 rounded"
                  >
                    {{ tech }}
                  </span>
                </div>
              </div>

              <!-- Interactive Syllabus Section -->
              <div class="syllabus-container px-6 pb-6 border-t">
                <div class="d-flex align-center justify-space-between mb-3 pt-4">
                  <span class="text-caption font-weight-bold text-cyan-lighten-3 text-uppercase tracking-wider">
                    <v-icon icon="mdi-format-list-bulleted-square" size="14" class="mr-1" />
                    Curriculum Syllabus
                  </span>
                  <span class="text-caption text-grey-lighten-1">
                    {{ course.syllabus?.length || 0 }} Modules
                  </span>
                </div>

                <!-- Syllabus Levels / Modules Expansion Panels -->
                <v-expansion-panels variant="accordion" class="syllabus-panels">
                  <v-expansion-panel
                    v-for="(mod, mIdx) in course.syllabus"
                    :key="mIdx"
                    class="syllabus-panel mb-2"
                  >
                    <v-expansion-panel-title class="pa-3 text-body-2 font-weight-bold text-slate-200">
                      <div class="d-flex align-center ga-2 text-truncate">
                        <span class="level-badge px-1-5 py-0-5 rounded text-caption font-weight-bold">
                          {{ mod.level || `Level ${mIdx + 1}` }}
                        </span>
                        <span class="text-truncate">{{ mod.title || mod }}</span>
                      </div>
                    </v-expansion-panel-title>

                    <v-expansion-panel-text class="pa-3 pt-0">
                      <ul v-if="mod.topics && mod.topics.length" class="syllabus-topic-list pl-4 mb-0">
                        <li
                          v-for="(topic, tIdx) in mod.topics"
                          :key="tIdx"
                          class="text-caption text-slate-300 py-1"
                        >
                          {{ topic }}
                        </li>
                      </ul>
                      <p v-else class="text-caption text-slate-300 mb-0">
                        {{ typeof mod === 'string' ? mod : mod.title }}
                      </p>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>
            </div>

            <!-- Card Bottom CTA Action -->
            <div class="pa-6 pt-0">
              <v-btn
                block
                size="large"
                color="#00366F"
                class="enroll-btn font-weight-bold text-white d-flex align-center justify-center ga-2"
                prepend-icon="mdi-send-outline"
                @click="enrollInCourse(course)"
              >
                Inquire & Enroll
                <v-icon icon="mdi-arrow-right" size="18" class="ml-1" />
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<style scoped>
/* ===================================================
   Next Challenge Courses Section
   Deep Navy (#00366F) & Neon Cyan (#00c2ff) Aesthetic
=================================================== */

.courses-section {
  background-color: #070a12;
  position: relative;
  overflow: hidden;
}

.courses-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 1000px;
  height: 500px;
  background: radial-gradient(circle, rgba(0, 54, 111, 0.25) 0%, rgba(0, 194, 255, 0.05) 50%, transparent 70%);
  pointer-events: none;
  filter: blur(60px);
}

.course-card {
  background: #0B0F19 !important; /* Tech Slate */
  border: 1px solid rgba(0, 54, 111, 0.45) !important;
  border-radius: 16px !important;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.course-card:hover {
  transform: translateY(-4px);
  border-color: rgba(0, 194, 255, 0.6) !important;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5), 0 0 24px rgba(0, 194, 255, 0.15) !important;
}

.course-card-top {
  position: relative;
}

.course-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(0, 54, 111, 0.6) 0%, rgba(0, 31, 63, 0.9) 100%);
  border: 1px solid rgba(0, 194, 255, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 16px rgba(0, 194, 255, 0.15);
}

.tech-tag-pill {
  background: rgba(0, 54, 111, 0.35);
  color: #7dd3fc;
  border: 1px solid rgba(0, 86, 179, 0.35);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.syllabus-container {
  border-color: rgba(0, 54, 111, 0.3) !important;
}

.syllabus-panels {
  background: transparent !important;
}

:deep(.v-expansion-panel) {
  background-color: #0e1626 !important;
  border: 1px solid rgba(0, 54, 111, 0.3) !important;
  border-radius: 8px !important;
}

:deep(.v-expansion-panel-title) {
  min-height: 44px !important;
}

:deep(.v-expansion-panel-title--active) {
  border-bottom: 1px solid rgba(0, 54, 111, 0.4) !important;
}

.level-badge {
  background: rgba(0, 194, 255, 0.15);
  color: #00c2ff;
  border: 1px solid rgba(0, 194, 255, 0.3);
  font-size: 0.68rem;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.syllabus-topic-list {
  list-style-type: disc;
  color: #94a3b8;
}

.syllabus-topic-list li::marker {
  color: #00c2ff;
}

.enroll-btn {
  background: linear-gradient(135deg, #00366F 0%, #004d99 100%) !important;
  border: 1px solid rgba(0, 194, 255, 0.4) !important;
  box-shadow: 0 4px 16px rgba(0, 54, 111, 0.35) !important;
  transition: all 0.25s ease !important;
}

.enroll-btn:hover {
  background: linear-gradient(135deg, #004d99 0%, #0066cc 100%) !important;
  box-shadow: 0 6px 20px rgba(0, 194, 255, 0.3) !important;
}

.filter-btn {
  border-radius: 8px;
  border-color: rgba(0, 54, 111, 0.5) !important;
}

.ga-1-5 {
  gap: 6px;
}
</style>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'

const { t, locale } = useI18n()
const theme = useTheme()
const isDark = computed(() => theme.global.current.value.dark)
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

// Registration Modal State
const isRegisterModalOpen = ref(false)
const selectedCourse = ref(null)
const isSubmitting = ref(false)
const registerError = ref('')
const registrationSuccess = ref(false)
const registerFormRef = ref(null)

const registerForm = ref({
  name: '',
  email: '',
  phone: '',
  selectedCourseId: '',
  message: ''
})

const courseSelectOptions = computed(() =>
  courses.value.map((c) => ({
    title: `${c.title} (${c.duration || 'Program'})`,
    _id: c._id
  }))
)

const openRegisterModal = (course) => {
  selectedCourse.value = course
  registerForm.value.selectedCourseId = course._id
  registerError.value = ''
  registrationSuccess.value = false
  isRegisterModalOpen.value = true
}

const closeRegisterModal = () => {
  isRegisterModalOpen.value = false
  setTimeout(() => {
    registrationSuccess.value = false
    registerError.value = ''
    registerForm.value = {
      name: '',
      email: '',
      phone: '',
      selectedCourseId: selectedCourse.value?._id || '',
      message: ''
    }
  }, 300)
}

const onCourseSelectionChange = (courseId) => {
  const found = courses.value.find((c) => c._id === courseId)
  if (found) {
    selectedCourse.value = found
  }
}

const submitRegistration = async () => {
  registerError.value = ''
  isSubmitting.value = true

  try {
    const res = await fetch('/api/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerForm.value)
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to submit registration application.')
    }

    registrationSuccess.value = true
  } catch (err) {
    registerError.value = err.message || 'An unexpected error occurred. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

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
          <v-icon icon="mdi-school-outline" size="16" :color="isDark ? '#00c2ff' : 'primary'" class="mr-1" />
          {{ t('courses.badge', 'Curriculum & Academics') }}
        </span>
        <h2 class="text-h3 font-weight-bold mb-4 tracking-tight course-section-heading">
          <span class="text-gradient-cyan">{{ t('courses.titleHighlight', 'Engineering Masterclasses') }}</span>
          {{ t('courses.titleEnd', '& Practical Training') }}
        </h2>
        <p class="text-body-1 text-medium-emphasis line-height-relaxed">
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
            class="filter-btn font-weight-bold"
            :class="selectedFilter === 'all' ? 'filter-btn--active' : 'filter-btn--inactive'"
            @click="selectedFilter = 'all'"
          >
            All Tracks ({{ courses.length }})
          </v-btn>
          <v-btn
            size="small"
            :variant="selectedFilter === 'vue' ? 'flat' : 'outlined'"
            class="filter-btn font-weight-bold"
            :class="selectedFilter === 'vue' ? 'filter-btn--active' : 'filter-btn--inactive'"
            @click="selectedFilter = 'vue'"
          >
            Web & Vue.js
          </v-btn>
          <v-btn
            size="small"
            :variant="selectedFilter === 'odoo' ? 'flat' : 'outlined'"
            class="filter-btn font-weight-bold"
            :class="selectedFilter === 'odoo' ? 'filter-btn--active' : 'filter-btn--inactive'"
            @click="selectedFilter = 'odoo'"
          >
            Odoo & Python
          </v-btn>
          <v-btn
            size="small"
            :variant="selectedFilter === 'joomla' ? 'flat' : 'outlined'"
            class="filter-btn font-weight-bold"
            :class="selectedFilter === 'joomla' ? 'filter-btn--active' : 'filter-btn--inactive'"
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
                    <v-icon :icon="course.icon || 'mdi-code-braces'" size="28" :color="isDark ? '#00c2ff' : '#0284c7'" />
                  </div>

                  <!-- Badge & Duration -->
                  <div class="d-flex align-center ga-2">
                    <v-chip
                      size="x-small"
                      :color="isDark ? '#00c2ff' : '#0284c7'"
                      variant="flat"
                      :class="[isDark ? 'text-slate-900' : 'text-white', 'font-weight-bold px-2']"
                    >
                      {{ course.badge || 'Professional' }}
                    </v-chip>
                    <v-chip
                      v-if="course.duration"
                      size="x-small"
                      :color="isDark ? 'blue-lighten-3' : 'primary'"
                      variant="tonal"
                      class="font-weight-medium"
                    >
                      <v-icon icon="mdi-clock-outline" size="12" :class="isRtl ? 'ml-1' : 'mr-1'" />
                      {{ course.duration }}
                    </v-chip>
                  </div>
                </div>

                <!-- Course Title & Description -->
                <h3 class="text-h5 font-weight-bold course-card-title mb-3">
                  {{ course.title }}
                </h3>
                <p class="text-body-2 course-card-desc mb-4 line-height-relaxed">
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
                  <span class="text-caption font-weight-bold syllabus-header-title text-uppercase tracking-wider">
                    <v-icon icon="mdi-format-list-bulleted-square" size="14" :class="isRtl ? 'ml-1' : 'mr-1'" />
                    Curriculum Syllabus
                  </span>
                  <span class="text-caption text-medium-emphasis">
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
                    <v-expansion-panel-title class="pa-3 text-body-2 font-weight-bold syllabus-panel-title">
                      <div class="d-flex align-center ga-2 text-truncate">
                        <span class="level-badge px-1-5 py-0-5 rounded text-caption font-weight-bold">
                          {{ mod.level || `Level ${mIdx + 1}` }}
                        </span>
                        <span class="text-truncate">{{ mod.title || mod }}</span>
                      </div>
                    </v-expansion-panel-title>

                    <v-expansion-panel-text class="pa-3 pt-0">
                      <ul v-if="mod.topics && mod.topics.length" class="syllabus-topic-list mb-0" :class="isRtl ? 'pr-4' : 'pl-4'">
                        <li
                          v-for="(topic, tIdx) in mod.topics"
                          :key="tIdx"
                          class="text-caption syllabus-topic-item py-1"
                        >
                          {{ topic }}
                        </li>
                      </ul>
                      <p v-else class="text-caption syllabus-topic-item mb-0">
                        {{ typeof mod === 'string' ? mod : mod.title }}
                      </p>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>
            </div>

            <!-- Card Bottom CTA Action -->
            <div class="pa-6 pt-0 d-flex flex-column ga-2">
              <v-btn
                block
                size="large"
                color="#00366F"
                class="enroll-btn font-weight-bold text-white d-flex align-center justify-center ga-2"
                prepend-icon="mdi-account-plus-outline"
                @click="openRegisterModal(course)"
              >
                <span>{{ t('courses.registerNow', 'Register Now') }}</span>
                <v-icon :icon="isRtl ? 'mdi-arrow-left' : 'mdi-arrow-right'" size="18" :class="isRtl ? 'mr-1' : 'ml-1'" />
              </v-btn>

              <v-btn
                block
                variant="text"
                size="small"
                class="inquire-btn text-caption font-weight-medium text-none"
                prepend-icon="mdi-chat-question-outline"
                @click="enrollInCourse(course)"
              >
                {{ t('courses.askQuestion', 'Have questions? Inquire via message') }}
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- ========================================== -->
    <!-- STUDENT REGISTRATION APPLICATION MODAL     -->
    <!-- ========================================== -->
    <v-dialog v-model="isRegisterModalOpen" max-width="620" scrollable>
      <v-card :color="isDark ? '#0e1626' : '#ffffff'" class="register-modal-card elevation-24">
        <!-- Header -->
        <div class="register-modal-header pa-6 d-flex align-center justify-space-between border-b">
          <div class="d-flex align-center ga-3">
            <v-avatar color="#00366F" size="46" class="text-white">
              <v-icon :icon="selectedCourse?.icon || 'mdi-school-outline'" :color="isDark ? '#00c2ff' : '#38bdf8'" size="26" />
            </v-avatar>
            <div>
              <div class="text-caption font-weight-bold text-cyan-lighten-3 text-uppercase tracking-wider">
                {{ t('courses.modalTitle', 'Student Enrollment Application') }}
              </div>
              <h3 class="text-h6 font-weight-bold text-white mb-0">
                {{ selectedCourse?.title || 'Program Registration' }}
              </h3>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" color="white" @click="closeRegisterModal" />
        </div>

        <!-- Content -->
        <v-card-text class="pa-6">
          <!-- Success State -->
          <div v-if="registrationSuccess" class="text-center py-8">
            <v-avatar color="rgba(16, 185, 129, 0.15)" size="72" class="mb-4 border-emerald">
              <v-icon icon="mdi-check-decagram" color="#10b981" size="44" />
            </v-avatar>
            <h3 class="text-h5 font-weight-bold modal-success-title mb-2">Application Submitted!</h3>
            <p class="text-body-2 modal-success-body max-w-md mx-auto mb-6 line-height-relaxed">
              Thank you, <strong :class="isDark ? 'text-white' : 'text-slate-900'">{{ registerForm.name }}</strong>! Your enrollment request for
              <strong :class="isDark ? 'text-cyan-lighten-3' : 'text-primary'">{{ selectedCourse?.title }}</strong> has been registered with status
              <span class="text-amber-lighten-2 font-weight-bold">PENDING</span>.
              Our academic advisors in Sétif will review your application and contact you at
              <strong :class="isDark ? 'text-white' : 'text-slate-900'">{{ registerForm.phone }}</strong> shortly.
            </p>
            <v-btn
              color="#00366F"
              variant="flat"
              class="text-white font-weight-bold px-8 text-capitalize"
              @click="closeRegisterModal"
            >
              Done
            </v-btn>
          </div>

          <!-- Registration Form -->
          <v-form v-else ref="registerFormRef" @submit.prevent="submitRegistration">
            <!-- Error Alert -->
            <v-alert
              v-if="registerError"
              type="error"
              variant="tonal"
              density="comfortable"
              closable
              class="mb-4"
              @click:close="registerError = ''"
            >
              {{ registerError }}
            </v-alert>

            <!-- Course Selection -->
            <div class="mb-4">
              <label class="text-caption font-weight-bold register-label mb-1 d-block">
                Selected Training Track *
              </label>
              <v-select
                v-model="registerForm.selectedCourseId"
                :items="courseSelectOptions"
                item-title="title"
                item-value="_id"
                variant="outlined"
                density="comfortable"
                :color="isDark ? '#00c2ff' : 'primary'"
                :bg-color="isDark ? '#0B0F19' : '#f8fafc'"
                hide-details
                prepend-inner-icon="mdi-school"
                @update:model-value="onCourseSelectionChange"
              />
            </div>

            <v-row class="gy-3">
              <!-- Student Full Name -->
              <v-col cols="12" sm="6">
                <label class="text-caption font-weight-bold register-label mb-1 d-block">
                  Full Name (Nom & Prénom) *
                </label>
                <v-text-field
                  v-model="registerForm.name"
                  placeholder="e.g. Yassine Mansouri"
                  variant="outlined"
                  density="comfortable"
                  :color="isDark ? '#00c2ff' : 'primary'"
                  :bg-color="isDark ? '#0B0F19' : '#f8fafc'"
                  hide-details
                  prepend-inner-icon="mdi-account-outline"
                  required
                />
              </v-col>

              <!-- Phone Number -->
              <v-col cols="12" sm="6">
                <label class="text-caption font-weight-bold register-label mb-1 d-block">
                  Phone Number (Téléphone) *
                </label>
                <v-text-field
                  v-model="registerForm.phone"
                  placeholder="e.g. 0552 56 96 54"
                  variant="outlined"
                  density="comfortable"
                  :color="isDark ? '#00c2ff' : 'primary'"
                  :bg-color="isDark ? '#0B0F19' : '#f8fafc'"
                  hide-details
                  prepend-inner-icon="mdi-phone-outline"
                  required
                />
              </v-col>

              <!-- Email Address -->
              <v-col cols="12">
                <label class="text-caption font-weight-bold register-label mb-1 d-block">
                  Email Address (Email de contact) *
                </label>
                <v-text-field
                  v-model="registerForm.email"
                  type="email"
                  placeholder="e.g. student@example.com"
                  variant="outlined"
                  density="comfortable"
                  :color="isDark ? '#00c2ff' : 'primary'"
                  :bg-color="isDark ? '#0B0F19' : '#f8fafc'"
                  hide-details
                  prepend-inner-icon="mdi-email-outline"
                  required
                />
              </v-col>

              <!-- Optional Background / Goals -->
              <v-col cols="12">
                <label class="text-caption font-weight-bold register-label mb-1 d-block">
                  Prior Experience or Specific Goals (Optional)
                </label>
                <v-textarea
                  v-model="registerForm.message"
                  rows="3"
                  placeholder="Tell us about your background, programming interests, or scheduling availability..."
                  variant="outlined"
                  density="comfortable"
                  :color="isDark ? '#00c2ff' : 'primary'"
                  :bg-color="isDark ? '#0B0F19' : '#f8fafc'"
                  hide-details
                />
              </v-col>
            </v-row>

            <div class="d-flex align-center justify-end ga-3 mt-6 pt-4 border-t modal-footer-border">
              <v-btn variant="text" :color="isDark ? 'grey-lighten-1' : 'grey-darken-2'" @click="closeRegisterModal">
                Cancel
              </v-btn>
              <v-btn
                color="#00366F"
                variant="flat"
                class="text-white font-weight-bold px-6 text-capitalize"
                :loading="isSubmitting"
                type="submit"
              >
                Submit Application
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </section>
</template>

<style scoped>
/* ===================================================
   Next Challenge Courses Section
   Theme-Reactive Architecture: Dark & Light Adaptive
=================================================== */

.courses-section {
  background-color: #070a12;
  position: relative;
  overflow: hidden;
  transition: background-color 0.3s ease;
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
  transition: opacity 0.3s ease;
}

.v-theme--nextChallengeLight .courses-section {
  background-color: #f8fafc;
}

.v-theme--nextChallengeLight .courses-section::before {
  background: radial-gradient(circle, rgba(0, 54, 111, 0.08) 0%, rgba(0, 194, 255, 0.04) 50%, transparent 70%);
}

/* Section Headings */
.course-section-heading {
  color: #f8fafc;
  transition: color 0.25s ease;
}

.v-theme--nextChallengeLight .course-section-heading {
  color: #0f172a;
}

/* Course Cards */
.course-card {
  background: #0B0F19 !important;
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

.v-theme--nextChallengeLight .course-card {
  background: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04) !important;
}

.v-theme--nextChallengeLight .course-card:hover {
  border-color: rgba(0, 54, 111, 0.35) !important;
  box-shadow: 0 16px 36px -8px rgba(0, 54, 111, 0.14), 0 0 20px rgba(0, 194, 255, 0.08) !important;
}

.course-card-top {
  position: relative;
}

/* Course Title & Description */
.course-card-title {
  color: #f8fafc;
  transition: color 0.25s ease;
}

.v-theme--nextChallengeLight .course-card-title {
  color: #0f172a;
}

.course-card-desc {
  color: #94a3b8;
  transition: color 0.25s ease;
}

.v-theme--nextChallengeLight .course-card-desc {
  color: #475569;
}

/* Course Icon Box */
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
  transition: all 0.3s ease;
}

.v-theme--nextChallengeLight .course-icon-box {
  background: linear-gradient(135deg, rgba(0, 54, 111, 0.08) 0%, rgba(0, 194, 255, 0.12) 100%);
  border: 1px solid rgba(0, 194, 255, 0.4);
  box-shadow: 0 4px 14px rgba(0, 194, 255, 0.12);
}

/* Tech Tag Pills */
.tech-tag-pill {
  background: rgba(0, 54, 111, 0.35);
  color: #7dd3fc;
  border: 1px solid rgba(0, 86, 179, 0.35);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  transition: all 0.25s ease;
}

.v-theme--nextChallengeLight .tech-tag-pill {
  background: rgba(0, 54, 111, 0.06);
  color: #0369a1;
  border: 1px solid rgba(0, 86, 179, 0.2);
}

/* Syllabus Section */
.syllabus-container {
  border-color: rgba(0, 54, 111, 0.3) !important;
  transition: border-color 0.25s ease;
}

.v-theme--nextChallengeLight .syllabus-container {
  border-color: rgba(0, 54, 111, 0.1) !important;
}

.syllabus-header-title {
  color: #67e8f9;
  letter-spacing: 0.05em;
  transition: color 0.25s ease;
}

.v-theme--nextChallengeLight .syllabus-header-title {
  color: #0284c7;
}

.syllabus-panels {
  background: transparent !important;
}

:deep(.v-expansion-panel) {
  background-color: #0e1626 !important;
  border: 1px solid rgba(0, 54, 111, 0.3) !important;
  border-radius: 8px !important;
  transition: background-color 0.25s ease, border-color 0.25s ease;
}

.v-theme--nextChallengeLight :deep(.v-expansion-panel) {
  background-color: #f8fafc !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
}

:deep(.v-expansion-panel-title) {
  min-height: 44px !important;
}

:deep(.v-expansion-panel-title--active) {
  border-bottom: 1px solid rgba(0, 54, 111, 0.4) !important;
}

.v-theme--nextChallengeLight :deep(.v-expansion-panel-title--active) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
}

.syllabus-panel-title {
  color: #f1f5f9;
  transition: color 0.25s ease;
}

.v-theme--nextChallengeLight .syllabus-panel-title {
  color: #1e293b;
}

.level-badge {
  background: rgba(0, 194, 255, 0.15);
  color: #00c2ff;
  border: 1px solid rgba(0, 194, 255, 0.3);
  font-size: 0.68rem;
  letter-spacing: 0.03em;
  white-space: nowrap;
  transition: all 0.25s ease;
}

.v-theme--nextChallengeLight .level-badge {
  background: rgba(2, 132, 199, 0.08);
  color: #0284c7;
  border: 1px solid rgba(2, 132, 199, 0.25);
}

.syllabus-topic-list {
  list-style-type: disc;
  color: #94a3b8;
  transition: color 0.25s ease;
}

.v-theme--nextChallengeLight .syllabus-topic-list {
  color: #475569;
}

.syllabus-topic-list li::marker {
  color: #00c2ff;
  transition: color 0.25s ease;
}

.v-theme--nextChallengeLight .syllabus-topic-list li::marker {
  color: #0284c7;
}

.syllabus-topic-item {
  color: inherit;
}

/* Action Buttons */
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

.v-theme--nextChallengeLight .enroll-btn {
  box-shadow: 0 4px 14px rgba(0, 54, 111, 0.2) !important;
  border-color: rgba(0, 54, 111, 0.25) !important;
}

.inquire-btn {
  color: #94a3b8 !important;
  transition: color 0.2s ease !important;
}

.inquire-btn:hover {
  color: #00c2ff !important;
}

.v-theme--nextChallengeLight .inquire-btn {
  color: #475569 !important;
}

.v-theme--nextChallengeLight .inquire-btn:hover {
  color: #00366F !important;
}

/* Category Filter Buttons */
.filter-btn {
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
}

.filter-btn--active {
  background: #00366F !important;
  color: #ffffff !important;
  border: 1px solid #00366F !important;
  box-shadow: 0 2px 8px rgba(0, 54, 111, 0.25) !important;
}

.filter-btn--inactive {
  background: rgba(255, 255, 255, 0.04) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  color: #cbd5e1 !important;
}

.filter-btn--inactive:hover {
  background: rgba(255, 255, 255, 0.08) !important;
  border-color: rgba(0, 194, 255, 0.4) !important;
  color: #ffffff !important;
}

.v-theme--nextChallengeLight .filter-btn--inactive {
  background: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
  color: #334155 !important;
}

.v-theme--nextChallengeLight .filter-btn--inactive:hover {
  background: #f1f5f9 !important;
  border-color: #00366F !important;
  color: #00366F !important;
}

.ga-1-5 {
  gap: 6px;
}

/* Registration Modal Dialog Styling */
:global(.register-modal-card),
:deep(.register-modal-card),
.register-modal-card {
  background: #0e1626 !important;
  border: 1px solid rgba(0, 54, 111, 0.6) !important;
  border-radius: 16px !important;
  color: #f1f5f9 !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 54, 111, 0.3) !important;
  transition: background-color 0.25s ease, color 0.25s ease !important;
}

:global(.v-theme--nextChallengeLight .register-modal-card),
:deep(.v-theme--nextChallengeLight .register-modal-card),
.v-theme--nextChallengeLight .register-modal-card {
  background: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  color: #0f172a !important;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.15) !important;
}

:global(.register-modal-header),
:deep(.register-modal-header),
.register-modal-header {
  background: linear-gradient(135deg, #00366F 0%, #061b36 100%) !important;
  border-bottom: 1px solid rgba(0, 86, 179, 0.3) !important;
}

:global(.v-theme--nextChallengeLight .register-modal-header),
:deep(.v-theme--nextChallengeLight .register-modal-header),
.v-theme--nextChallengeLight .register-modal-header {
  background: linear-gradient(135deg, #00366F 0%, #004d99 100%) !important;
  border-bottom: 1px solid rgba(0, 54, 111, 0.3) !important;
}

.register-label {
  color: #cbd5e1;
  transition: color 0.25s ease;
}

.v-theme--nextChallengeLight .register-label,
:global(.v-theme--nextChallengeLight .register-label) {
  color: #1e293b;
}

.modal-footer-border {
  border-color: rgba(0, 54, 111, 0.3) !important;
}

.v-theme--nextChallengeLight .modal-footer-border,
:global(.v-theme--nextChallengeLight .modal-footer-border) {
  border-color: rgba(0, 0, 0, 0.08) !important;
}

.modal-success-title {
  color: #ffffff;
  transition: color 0.25s ease;
}

.v-theme--nextChallengeLight .modal-success-title,
:global(.v-theme--nextChallengeLight .modal-success-title) {
  color: #0f172a;
}

.modal-success-body {
  color: #cbd5e1;
  transition: color 0.25s ease;
}

.v-theme--nextChallengeLight .modal-success-body,
:global(.v-theme--nextChallengeLight .modal-success-body) {
  color: #334155;
}

.border-emerald {
  border: 1px solid rgba(16, 185, 129, 0.4);
}
</style>

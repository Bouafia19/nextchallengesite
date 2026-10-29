<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import BrandLogo from '../layout/BrandLogo.vue'
import VisitorTrendChart from './VisitorTrendChart.vue'

const emit = defineEmits(['back'])

// API Base configuration - supports relative or absolute URLs
const rawApiUrl =
  import.meta.env.VITE_ADMIN_API_URL ||
  import.meta.env.VITE_CONTACT_API_URL?.replace(/\/contact\/?$/, '/admin') ||
  '/api/admin'

const apiBase = rawApiUrl.replace(/\/contacts\/?$/, '').replace(/\/$/, '')

// Safe endpoint URL builder for relative & absolute paths
const getApiUrl = (endpoint = '') => {
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  if (/^https?:\/\//i.test(apiBase)) {
    return `${apiBase}${cleanPath}`
  }
  return `${window.location.origin}${apiBase}${cleanPath}`
}

// Authentication State
// API key is strictly user-supplied; never hardcoded or pre-filled from frontend bundles
const storedKey = (localStorage.getItem('nc_admin_key') || '').trim().replace(/^["']|["']$/g, '')
const apiKey = ref(storedKey)
const isAuthenticated = ref(false)
const isAuthenticating = ref(false)
const authError = ref('')
const showApiKey = ref(false)
const rememberKey = ref(true)

// Admin Navigation Tab
const currentAdminTab = ref('submissions') // 'submissions' | 'courses'

// Courses Module State
const coursesList = ref([])
const coursesStats = ref({ total: 0, active: 0, inactive: 0 })
const isCoursesLoading = ref(false)
const courseSearchQuery = ref('')
const courseFilter = ref('all') // 'all' | 'active' | 'inactive'

const isCourseDialogOpen = ref(false)
const isEditingCourse = ref(false)
const isSavingCourse = ref(false)

const courseForm = ref({
  _id: '',
  title: '',
  description: '',
  badge: 'Career Track',
  duration: '12 Weeks',
  level: 'All Levels',
  icon: 'mdi-code-braces',
  order: 1,
  isActive: true,
  technologiesInput: '',
  syllabus: [
    { level: 'Level 1', title: '', topicsInput: '' },
    { level: 'Level 2', title: '', topicsInput: '' },
    { level: 'Level 3', title: '', topicsInput: '' }
  ]
})

const isCourseDeleteOpen = ref(false)
const courseToDelete = ref(null)
const isDeletingCourse = ref(false)

// Enrollments Module State
const enrollmentsList = ref([])
const enrollmentsStats = ref({ total: 0, pending: 0, approved: 0, rejected: 0 })
const isEnrollmentsLoading = ref(false)
const enrollmentSearchQuery = ref('')
const enrollmentFilter = ref('all') // 'all' | 'pending' | 'approved' | 'rejected'
const selectedEnrollment = ref(null)
const isEnrollmentDetailOpen = ref(false)
const enrollmentToDelete = ref(null)
const isEnrollmentDeleteOpen = ref(false)
const isDeletingEnrollment = ref(false)
const isUpdatingEnrollmentStatus = ref(false)
const enrollmentAdminNotesInput = ref('')
const isSavingEnrollmentNotes = ref(false)

// Website Visitors Analytics State
const isAnalyticsLoading = ref(false)
const analyticsRange = ref('30d') // '7d' | '30d' | '90d'
const analyticsData = ref(null)
const analyticsError = ref('')

// Dashboard Data State
const contacts = ref([])
const totalCount = ref(0)
const unreadCount = ref(0)
const stats = ref({ total: 0, unread: 0, read: 0, today: 0 })
const isLoading = ref(false)
const errorMessage = ref('')

// Filter & Search State
const searchQuery = ref('')
const activeFilter = ref('all') // 'all' | 'unread' | 'read'

// Polling State
const pollingIntervalSeconds = ref(10)
const isPollingActive = ref(true)
const pollingTimer = ref(null)
const secondsUntilNextPoll = ref(10)
const countdownTimer = ref(null)
const lastUpdatedTime = ref('')

// Detail Dialog State
const selectedContact = ref(null)
const isDetailOpen = ref(false)
const isUpdatingStatus = ref(false)

// Delete Dialog State
const contactToDelete = ref(null)
const isDeleteOpen = ref(false)
const isDeleting = ref(false)

// Notification Toast State
const toastMessage = ref('')
const isToastOpen = ref(false)
const toastColor = ref('#00366F')

// Synthesize pleasant sound when new message arrives
const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15) // A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.36)
  } catch {
    // Audio synthesis not permitted or unavailable
  }
}

// Headers helper for secured admin requests (supports both x-admin-key and Bearer token)
const getAuthHeaders = () => {
  const cleanKey = apiKey.value.trim().replace(/^["']|["']$/g, '')
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'x-admin-key': cleanKey,
    Authorization: `Bearer ${cleanKey}`
  }
}

// Authenticate Admin Key
const authenticate = async () => {
  const cleanKey = apiKey.value.trim().replace(/^["']|["']$/g, '')
  if (!cleanKey) {
    authError.value = 'Please provide an Admin API Key.'
    return
  }

  isAuthenticating.value = true
  authError.value = ''

  try {
    const res = await fetch(getApiUrl('/verify'), {
      method: 'POST',
      headers: getAuthHeaders()
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok || !data.success) {
      if (res.status === 401) {
        throw new Error(data.message || 'Invalid Admin API Key. Access denied.')
      } else if (res.status === 404) {
        throw new Error('Admin API endpoint not found. Please ensure backend server is running.')
      } else if (res.status === 503) {
        throw new Error(data.message || 'Database unavailable. MongoDB Atlas is connecting.')
      }
      throw new Error(data.message || 'Invalid Admin API Key. Access denied.')
    }

    isAuthenticated.value = true
    if (rememberKey.value) {
      localStorage.setItem('nc_admin_key', cleanKey)
    }

    // Fetch initial contacts, courses, enrollments, analytics, and start polling
    await Promise.all([fetchContacts(true), fetchAdminCourses(), fetchAdminEnrollments(), fetchAnalytics(false)])
    startPolling()
  } catch (err) {
    authError.value = err.message || 'Invalid Admin API Key. Access denied.'
    isAuthenticated.value = false
  } finally {
    isAuthenticating.value = false
  }
}

const logout = () => {
  stopPolling()
  isAuthenticated.value = false
  contacts.value = []
  localStorage.removeItem('nc_admin_key')
}

// Fetch Contacts from backend
const fetchContacts = async (isManual = false) => {
  if (!isAuthenticated.value) return

  if (isManual) {
    isLoading.value = true
  }

  errorMessage.value = ''

  try {
    const url = new URL(getApiUrl('/contacts'))
    url.searchParams.set('limit', '100')
    if (activeFilter.value !== 'all') {
      url.searchParams.set('status', activeFilter.value)
    }
    if (searchQuery.value.trim()) {
      url.searchParams.set('search', searchQuery.value.trim())
    }

    const [contactsRes, statsRes] = await Promise.all([
      fetch(url.toString(), { headers: getAuthHeaders() }),
      fetch(getApiUrl('/contacts/stats'), { headers: getAuthHeaders() })
    ])

    if (contactsRes.status === 401 || statsRes.status === 401) {
      logout()
      authError.value = 'Session expired or invalid key. Please log in again.'
      return
    }

    if (!contactsRes.ok) {
      const errData = await contactsRes.json().catch(() => ({}))
      throw new Error(errData.message || 'Failed to retrieve submissions.')
    }

    const contactsData = await contactsRes.json()
    const statsData = statsRes.ok ? await statsRes.json() : null

    // Check for new incoming unread messages to notify user
    const previousUnread = unreadCount.value
    const newUnread = contactsData.unreadCount || 0

    if (!isManual && newUnread > previousUnread) {
      const difference = newUnread - previousUnread
      toastMessage.value = `🔔 ${difference} new contact submission${difference > 1 ? 's' : ''} received!`
      isToastOpen.value = true
      playNotificationSound()
    }

    contacts.value = contactsData.contacts || []
    totalCount.value = contactsData.totalCount || 0
    unreadCount.value = newUnread

    if (statsData?.stats) {
      stats.value = statsData.stats
    } else {
      stats.value = {
        total: totalCount.value,
        unread: unreadCount.value,
        read: totalCount.value - unreadCount.value,
        today: 0
      }
    }

    const now = new Date()
    lastUpdatedTime.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    secondsUntilNextPoll.value = pollingIntervalSeconds.value
  } catch (err) {
    errorMessage.value = err.message || 'Error communicating with MongoDB backend.'
  } finally {
    isLoading.value = false
  }
}

// Fetch Website Visitors Analytics from backend
const fetchAnalytics = async (isManual = false) => {
  if (!isAuthenticated.value) return

  if (isManual) {
    isAnalyticsLoading.value = true
  }

  analyticsError.value = ''

  try {
    const url = getApiUrl(`/analytics/visitors?range=${analyticsRange.value}`)
    const res = await fetch(url, { headers: getAuthHeaders() })

    if (res.status === 401) {
      logout()
      authError.value = 'Session expired or invalid key. Please log in again.'
      return
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.message || 'Failed to retrieve visitor analytics.')
    }

    const data = await res.json()
    analyticsData.value = data
  } catch (err) {
    analyticsError.value = err.message || 'Error communicating with analytics service.'
  } finally {
    isAnalyticsLoading.value = false
  }
}

watch(analyticsRange, () => {
  if (isAuthenticated.value) {
    fetchAnalytics(true)
  }
})

// Polling System
const startPolling = () => {
  stopPolling()
  if (!isPollingActive.value || pollingIntervalSeconds.value <= 0) return

  secondsUntilNextPoll.value = pollingIntervalSeconds.value

  countdownTimer.value = setInterval(() => {
    if (secondsUntilNextPoll.value > 0) {
      secondsUntilNextPoll.value -= 1
    }
  }, 1000)

  pollingTimer.value = setInterval(() => {
    if (currentAdminTab.value === 'submissions') {
      fetchContacts(false)
    } else if (currentAdminTab.value === 'courses') {
      fetchAdminCourses()
    } else if (currentAdminTab.value === 'enrollments') {
      fetchAdminEnrollments()
    } else if (currentAdminTab.value === 'analytics') {
      fetchAnalytics(false)
    }
  }, pollingIntervalSeconds.value * 1000)
}

const stopPolling = () => {
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value)
    pollingTimer.value = null
  }
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
}

const togglePolling = () => {
  isPollingActive.value = !isPollingActive.value
  if (isPollingActive.value) {
    fetchContacts(true)
    startPolling()
  } else {
    stopPolling()
  }
}

// Filter and Search Watchers
watch([activeFilter, searchQuery], () => {
  fetchContacts(true)
})

watch(pollingIntervalSeconds, () => {
  if (isPollingActive.value) {
    startPolling()
  }
})

// Toggle Read / Unread Status
const toggleReadStatus = async (contact) => {
  if (!contact?._id) return
  isUpdatingStatus.value = true

  try {
    const res = await fetch(getApiUrl(`/contacts/${contact._id}/read`), {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ readStatus: !contact.readStatus })
    })

    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update status')
    }

    contact.readStatus = data.contact.readStatus
    unreadCount.value = data.unreadCount ?? unreadCount.value

    // Update stats
    if (contact.readStatus) {
      stats.value.unread = Math.max(0, stats.value.unread - 1)
      stats.value.read += 1
    } else {
      stats.value.unread += 1
      stats.value.read = Math.max(0, stats.value.read - 1)
    }

    toastMessage.value = `Marked as ${contact.readStatus ? 'read' : 'unread'}`
    isToastOpen.value = true
  } catch (err) {
    toastMessage.value = err.message || 'Could not update status'
    isToastOpen.value = true
  } finally {
    isUpdatingStatus.value = false
  }
}

// Mark All as Read
const markAllAsRead = async () => {
  if (unreadCount.value === 0) return

  isLoading.value = true
  try {
    const res = await fetch(getApiUrl('/contacts/mark-all-read'), {
      method: 'PATCH',
      headers: getAuthHeaders()
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Operation failed')

    contacts.value.forEach((c) => {
      c.readStatus = true
    })
    unreadCount.value = 0
    stats.value.unread = 0
    stats.value.read = stats.value.total

    toastMessage.value = 'All submissions marked as read.'
    isToastOpen.value = true
  } catch (err) {
    toastMessage.value = err.message || 'Failed to update all messages'
    isToastOpen.value = true
  } finally {
    isLoading.value = false
  }
}

// Delete Submission
const confirmDelete = (contact) => {
  contactToDelete.value = contact
  isDeleteOpen.value = true
}

const executeDelete = async () => {
  if (!contactToDelete.value?._id) return

  isDeleting.value = true
  try {
    const res = await fetch(getApiUrl(`/contacts/${contactToDelete.value._id}`), {
      method: 'DELETE',
      headers: getAuthHeaders()
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to delete')

    contacts.value = contacts.value.filter((c) => c._id !== contactToDelete.value._id)
    if (!contactToDelete.value.readStatus) {
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
    totalCount.value = Math.max(0, totalCount.value - 1)
    stats.value.total = totalCount.value
    stats.value.unread = unreadCount.value

    if (selectedContact.value?._id === contactToDelete.value._id) {
      isDetailOpen.value = false
      selectedContact.value = null
    }

    isDeleteOpen.value = false
    contactToDelete.value = null

    toastMessage.value = 'Submission deleted successfully.'
    isToastOpen.value = true
  } catch (err) {
    toastMessage.value = err.message || 'Delete operation failed'
    isToastOpen.value = true
  } finally {
    isDeleting.value = false
  }
}

// View Contact Detail
const openDetail = (contact) => {
  selectedContact.value = contact
  isDetailOpen.value = true

  // Automatically mark as read if currently unread
  if (!contact.readStatus) {
    toggleReadStatus(contact)
  }
}

// Export data as JSON
const exportJson = () => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(contacts.value, null, 2))
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute('href', dataStr)
  downloadAnchor.setAttribute('download', `next-challenge-contacts-${new Date().toISOString().slice(0, 10)}.json`)
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
}

// Relative time formatter
const formatRelativeTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffSec = Math.floor((now - date) / 1000)

  if (diffSec < 60) return 'Just now'
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatDateFull = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'medium'
  })
}

// ----------------------------------------------------
// Courses Management Methods
// ----------------------------------------------------
const fetchAdminCourses = async () => {
  if (!isAuthenticated.value) return
  isCoursesLoading.value = true

  try {
    const url = new URL(getApiUrl('/courses'))
    if (courseFilter.value !== 'all') {
      url.searchParams.set('status', courseFilter.value)
    }
    if (courseSearchQuery.value.trim()) {
      url.searchParams.set('search', courseSearchQuery.value.trim())
    }

    const res = await fetch(url.toString(), { headers: getAuthHeaders() })
    if (res.ok) {
      const data = await res.json()
      coursesList.value = data.courses || []
      coursesStats.value = {
        total: data.totalCount ?? coursesList.value.length,
        active: data.activeCount ?? coursesList.value.filter((c) => c.isActive).length,
        inactive: data.inactiveCount ?? coursesList.value.filter((c) => !c.isActive).length
      }
    }
  } catch (err) {
    console.error('Failed to load courses:', err)
  } finally {
    isCoursesLoading.value = false
  }
}

const openCreateCourseDialog = () => {
  isEditingCourse.value = false
  courseForm.value = {
    _id: '',
    title: '',
    description: '',
    badge: 'Career Track',
    duration: '12 Weeks',
    level: 'All Levels',
    icon: 'mdi-code-braces',
    order: (coursesList.value.length || 0) + 1,
    isActive: true,
    technologiesInput: 'HTML5, CSS3, JavaScript, Vue.js, Node.js',
    syllabus: [
      { level: 'Level 1', title: 'Web Fundamentals & Modern UI', topicsInput: 'HTML5 semantic markup, CSS3 layouts, JavaScript ES6+' },
      { level: 'Level 2', title: 'Frontend Architecture & Frameworks', topicsInput: 'Vue.js 3, Component state, REST API integration' },
      { level: 'Level 3', title: 'Backend APIs & Production Deployment', topicsInput: 'Express.js architecture, MongoDB Atlas, Cloud hosting' }
    ]
  }
  isCourseDialogOpen.value = true
}

const openEditCourseDialog = (course) => {
  isEditingCourse.value = true
  courseForm.value = {
    _id: course._id,
    title: course.title || '',
    description: course.description || '',
    badge: course.badge || 'Training Program',
    duration: course.duration || '',
    level: course.level || 'All Levels',
    icon: course.icon || 'mdi-code-braces',
    order: course.order || 0,
    isActive: course.isActive !== undefined ? course.isActive : true,
    technologiesInput: Array.isArray(course.technologies) ? course.technologies.join(', ') : '',
    syllabus: Array.isArray(course.syllabus) && course.syllabus.length > 0
      ? course.syllabus.map((s, idx) => ({
          level: s.level || `Level ${idx + 1}`,
          title: s.title || (typeof s === 'string' ? s : ''),
          topicsInput: Array.isArray(s.topics) ? s.topics.join(', ') : ''
        }))
      : [{ level: 'Level 1', title: '', topicsInput: '' }]
  }
  isCourseDialogOpen.value = true
}

const addSyllabusLevel = () => {
  const nextNum = courseForm.value.syllabus.length + 1
  courseForm.value.syllabus.push({
    level: `Level ${nextNum}`,
    title: '',
    topicsInput: ''
  })
}

const removeSyllabusLevel = (idx) => {
  if (courseForm.value.syllabus.length > 1) {
    courseForm.value.syllabus.splice(idx, 1)
  }
}

const saveCourse = async () => {
  if (!courseForm.value.title.trim()) {
    toastMessage.value = 'Course title is required'
    isToastOpen.value = true
    return
  }

  isSavingCourse.value = true

  const techArray = courseForm.value.technologiesInput
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  const syllabusArray = courseForm.value.syllabus
    .filter((s) => s.title.trim())
    .map((s) => ({
      level: s.level.trim() || 'Level 1',
      title: s.title.trim(),
      topics: s.topicsInput
        ? s.topicsInput.split(',').map((t) => t.trim()).filter(Boolean)
        : []
    }))

  const payload = {
    title: courseForm.value.title.trim(),
    description: courseForm.value.description.trim(),
    badge: courseForm.value.badge.trim(),
    duration: courseForm.value.duration.trim(),
    level: courseForm.value.level.trim(),
    icon: courseForm.value.icon.trim(),
    order: Number(courseForm.value.order) || 0,
    isActive: Boolean(courseForm.value.isActive),
    technologies: techArray,
    syllabus: syllabusArray
  }

  try {
    const isEdit = Boolean(isEditingCourse.value && courseForm.value._id)
    const endpoint = isEdit
      ? getApiUrl(`/courses/${courseForm.value._id}`)
      : getApiUrl('/courses')
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(endpoint, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    })

    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to save course program')
    }

    isCourseDialogOpen.value = false
    toastMessage.value = isEdit ? 'Course program updated successfully!' : 'New course created successfully!'
    isToastOpen.value = true
    await fetchAdminCourses()
  } catch (err) {
    toastMessage.value = err.message || 'Error saving course'
    isToastOpen.value = true
  } finally {
    isSavingCourse.value = false
  }
}

const toggleCourseActive = async (course) => {
  try {
    const res = await fetch(getApiUrl(`/courses/${course._id}/toggle-active`), {
      method: 'PATCH',
      headers: getAuthHeaders()
    })
    const data = await res.json()
    if (res.ok && data.success) {
      course.isActive = data.course.isActive
      toastMessage.value = `Course "${course.title}" ${course.isActive ? 'activated' : 'deactivated'}.`
      isToastOpen.value = true
      await fetchAdminCourses()
    }
  } catch (err) {
    toastMessage.value = err.message || 'Status update failed'
    isToastOpen.value = true
  }
}

const confirmDeleteCourse = (course) => {
  courseToDelete.value = course
  isCourseDeleteOpen.value = true
}

const executeDeleteCourse = async () => {
  if (!courseToDelete.value?._id) return
  isDeletingCourse.value = true

  try {
    const res = await fetch(getApiUrl(`/courses/${courseToDelete.value._id}`), {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete course')
    }

    isCourseDeleteOpen.value = false
    courseToDelete.value = null
    toastMessage.value = 'Course deleted successfully.'
    isToastOpen.value = true
    await fetchAdminCourses()
  } catch (err) {
    toastMessage.value = err.message || 'Delete operation failed'
    isToastOpen.value = true
  } finally {
    isDeletingCourse.value = false
  }
}

watch([courseFilter, courseSearchQuery], () => {
  if (currentAdminTab.value === 'courses') {
    fetchAdminCourses()
  }
})

// ---------------------------------------------------------------------------
// Student Enrollments Methods
// ---------------------------------------------------------------------------
const fetchAdminEnrollments = async () => {
  if (!isAuthenticated.value) return
  isEnrollmentsLoading.value = true

  try {
    const url = new URL(getApiUrl('/enrollments'))
    if (enrollmentFilter.value !== 'all') {
      url.searchParams.set('status', enrollmentFilter.value)
    }
    if (enrollmentSearchQuery.value.trim()) {
      url.searchParams.set('search', enrollmentSearchQuery.value.trim())
    }

    const res = await fetch(url.toString(), { headers: getAuthHeaders() })
    if (res.ok) {
      const data = await res.json()
      enrollmentsList.value = data.enrollments || []
      enrollmentsStats.value = {
        total: data.totalCount ?? enrollmentsList.value.length,
        pending: data.pendingCount ?? enrollmentsList.value.filter((e) => e.status === 'pending').length,
        approved: data.approvedCount ?? enrollmentsList.value.filter((e) => e.status === 'approved').length,
        rejected: data.rejectedCount ?? enrollmentsList.value.filter((e) => e.status === 'rejected').length
      }
    }
  } catch (err) {
    console.error('Failed to load enrollments:', err)
  } finally {
    isEnrollmentsLoading.value = false
  }
}

const updateEnrollmentStatus = async (enrollment, newStatus, notes = null) => {
  if (!enrollment?._id) return
  isUpdatingEnrollmentStatus.value = true

  try {
    const payload = { status: newStatus }
    if (notes !== null) {
      payload.adminNotes = notes
    }

    const res = await fetch(getApiUrl(`/enrollments/${enrollment._id}/status`), {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (res.ok && data.success) {
      enrollment.status = newStatus
      if (notes !== null) enrollment.adminNotes = notes
      if (selectedEnrollment.value && selectedEnrollment.value._id === enrollment._id) {
        selectedEnrollment.value.status = newStatus
        if (notes !== null) selectedEnrollment.value.adminNotes = notes
      }
      toastMessage.value = `Enrollment status updated to "${newStatus.toUpperCase()}".`
      isToastOpen.value = true
      await fetchAdminEnrollments()
    } else {
      throw new Error(data.message || 'Failed to update enrollment status')
    }
  } catch (err) {
    toastMessage.value = err.message || 'Status update failed'
    isToastOpen.value = true
  } finally {
    isUpdatingEnrollmentStatus.value = false
  }
}

const saveEnrollmentAdminNotes = async () => {
  if (!selectedEnrollment.value?._id) return
  isSavingEnrollmentNotes.value = true
  try {
    const res = await fetch(getApiUrl(`/enrollments/${selectedEnrollment.value._id}/status`), {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        status: selectedEnrollment.value.status,
        adminNotes: enrollmentAdminNotesInput.value
      })
    })
    const data = await res.json()
    if (res.ok && data.success) {
      selectedEnrollment.value.adminNotes = enrollmentAdminNotesInput.value
      const found = enrollmentsList.value.find((e) => e._id === selectedEnrollment.value._id)
      if (found) found.adminNotes = enrollmentAdminNotesInput.value
      toastMessage.value = 'Staff notes saved.'
      isToastOpen.value = true
    } else {
      throw new Error(data.message || 'Failed to save notes')
    }
  } catch (err) {
    toastMessage.value = err.message || 'Failed to save notes'
    isToastOpen.value = true
  } finally {
    isSavingEnrollmentNotes.value = false
  }
}

const openEnrollmentDetail = (enrollment) => {
  selectedEnrollment.value = { ...enrollment }
  enrollmentAdminNotesInput.value = enrollment.adminNotes || ''
  isEnrollmentDetailOpen.value = true
}

const confirmDeleteEnrollment = (enrollment) => {
  enrollmentToDelete.value = enrollment
  isEnrollmentDeleteOpen.value = true
}

const executeDeleteEnrollment = async () => {
  if (!enrollmentToDelete.value?._id) return
  isDeletingEnrollment.value = true

  try {
    const res = await fetch(getApiUrl(`/enrollments/${enrollmentToDelete.value._id}`), {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete application')
    }

    toastMessage.value = 'Application deleted successfully.'
    isToastOpen.value = true
    isEnrollmentDeleteOpen.value = false
    if (selectedEnrollment.value?._id === enrollmentToDelete.value._id) {
      isEnrollmentDetailOpen.value = false
    }
    enrollmentToDelete.value = null
    await fetchAdminEnrollments()
  } catch (err) {
    toastMessage.value = err.message || 'Delete operation failed'
    isToastOpen.value = true
  } finally {
    isDeletingEnrollment.value = false
  }
}

const exportEnrollmentsJson = () => {
  if (!enrollmentsList.value.length) return
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(enrollmentsList.value, null, 2))
  const dlAnchorElem = document.createElement('a')
  dlAnchorElem.setAttribute('href', dataStr)
  dlAnchorElem.setAttribute('download', `nc_enrollments_${new Date().toISOString().slice(0, 10)}.json`)
  dlAnchorElem.click()
}

watch([enrollmentFilter, enrollmentSearchQuery], () => {
  if (currentAdminTab.value === 'enrollments') {
    fetchAdminEnrollments()
  }
})

// Sorter or initial mount
onMounted(() => {
  const hash = window.location.hash.toLowerCase()
  if (hash === '#analytics' || hash === '#visitors') {
    currentAdminTab.value = 'analytics'
  } else if (hash === '#courses') {
    currentAdminTab.value = 'courses'
  } else if (hash === '#enrollments') {
    currentAdminTab.value = 'enrollments'
  }

  if (apiKey.value) {
    authenticate()
  }
})

watch(currentAdminTab, (tab) => {
  if (tab === 'analytics') {
    window.location.hash = '#visitors'
  } else if (tab === 'courses') {
    window.location.hash = '#courses'
  } else if (tab === 'enrollments') {
    window.location.hash = '#enrollments'
  } else {
    if (window.location.hash) {
      window.location.hash = ''
    }
  }
})

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <div class="nc-admin-dashboard">
    <!-- ========================================== -->
    <!-- AUTHENTICATION SCREEN                      -->
    <!-- ========================================== -->
    <v-container v-if="!isAuthenticated" class="fill-height auth-container d-flex align-center justify-center py-12">
      <v-card class="auth-card elevation-24" max-width="480" width="100%">
        <div class="auth-card-header text-center pa-8">
          <div class="d-flex justify-center mb-4">
            <BrandLogo :size="48" />
          </div>
          <h2 class="text-h5 font-weight-bold text-white mb-1">Next Challenge</h2>
          <p class="text-caption text-blue-lighten-3 text-uppercase tracking-wider">
            Submissions Database & Admin Console
          </p>
        </div>

        <v-card-text class="pa-8">
          <v-alert
            v-if="authError"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-6 font-weight-medium"
            closable
            @click:close="authError = ''"
          >
            {{ authError }}
          </v-alert>

          <v-form @submit.prevent="authenticate">
            <div class="text-caption font-weight-medium text-slate-300 mb-2">Admin Security Key</div>
            <v-text-field
              v-model="apiKey"
              :type="showApiKey ? 'text' : 'password'"
              placeholder="Enter your ADMIN_API_KEY"
              variant="outlined"
              color="#0056b3"
              bg-color="#0B0F19"
              density="comfortable"
              prepend-inner-icon="mdi-shield-key-outline"
              :append-inner-icon="showApiKey ? 'mdi-eye-off' : 'mdi-eye'"
              class="mb-3"
              @click:append-inner="showApiKey = !showApiKey"
              autofocus
            />

            <v-checkbox
              v-model="rememberKey"
              label="Remember key on this browser"
              density="compact"
              color="primary"
              hide-details
              class="mb-6 text-caption"
            />

            <v-btn
              type="submit"
              block
              size="large"
              color="#00366F"
              class="text-white font-weight-bold mb-4 auth-btn"
              :loading="isAuthenticating"
              prepend-icon="mdi-lock-open-variant-outline"
            >
              Unlock Admin Portal
            </v-btn>

            <v-btn
              block
              variant="text"
              color="grey-lighten-1"
              prepend-icon="mdi-arrow-left"
              class="text-capitalize"
              @click="emit('back')"
            >
              Back to Main Website
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- ========================================== -->
    <!-- SECURED ADMIN PANEL INTERFACE              -->
    <!-- ========================================== -->
    <div v-else class="admin-interface">
      <!-- Top Sticky App Bar -->
      <header class="admin-topbar px-4 px-md-8 py-3 d-flex align-center justify-space-between flex-wrap ga-3">
        <!-- Left: Logo & Title -->
        <div class="d-flex align-center ga-3">
          <BrandLogo :size="36" />
          <div>
            <div class="d-flex align-center ga-2">
              <span class="text-subtitle-1 font-weight-bold text-white">Next Challenge</span>
              <v-chip size="x-small" color="#0056b3" variant="flat" class="font-weight-bold px-2">
                ADMIN
              </v-chip>
            </div>
            <div class="text-caption text-grey-lighten-1 d-none d-sm-block">
              MongoDB Submissions Engine & Inquiries Viewer
            </div>
          </div>
        </div>

        <!-- Center: Live Polling Status & Real-time Indicator -->
        <div class="d-flex align-center ga-3">
          <v-chip
            :color="isPollingActive ? 'teal-darken-1' : 'grey'"
            variant="tonal"
            size="small"
            class="polling-chip"
            @click="togglePolling"
          >
            <span class="pulse-indicator" :class="{ active: isPollingActive }"></span>
            <span class="font-weight-medium">
              {{ isPollingActive ? `Live Polling (${secondsUntilNextPoll}s)` : 'Polling Paused' }}
            </span>
          </v-chip>

          <v-tooltip text="Force refresh now" location="bottom">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-refresh"
                size="small"
                variant="text"
                color="blue-lighten-2"
                :loading="isLoading"
                @click="fetchContacts(true)"
              />
            </template>
          </v-tooltip>
        </div>

        <!-- Right: Real-Time Notification Badge, Back & Logout -->
        <div class="d-flex align-center ga-2">
          <!-- Notification Badge -->
          <v-badge
            :content="unreadCount"
            :model-value="unreadCount > 0"
            color="#00a8ff"
            offset-x="4"
            offset-y="4"
            class="mr-2"
          >
            <v-btn
              icon="mdi-bell-outline"
              size="small"
              variant="tonal"
              color="#00c2ff"
              aria-label="Unread notifications"
              :class="{ 'glowing-bell': unreadCount > 0 }"
              @click="activeFilter = 'unread'"
            />
          </v-badge>

          <v-btn
            variant="outlined"
            size="small"
            color="blue-grey-lighten-2"
            prepend-icon="mdi-earth"
            class="d-none d-sm-inline-flex text-capitalize"
            @click="emit('back')"
          >
            Public Site
          </v-btn>

          <v-btn
            icon="mdi-logout-variant"
            size="small"
            variant="tonal"
            color="error"
            title="Lock & Logout"
            @click="logout"
          />
        </div>
      </header>

      <!-- Main Dashboard Content -->
      <v-container fluid class="px-4 px-md-8 py-6 max-width-xl">
        <!-- Error Alert -->
        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          closable
          class="mb-6"
          @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>

        <!-- Admin Module Switcher -->
        <div class="admin-module-nav d-flex align-center flex-wrap ga-3 mb-6">
          <v-btn
            :variant="currentAdminTab === 'submissions' ? 'flat' : 'outlined'"
            :color="currentAdminTab === 'submissions' ? '#00366F' : 'grey-lighten-1'"
            size="large"
            class="font-weight-bold px-5 module-tab-btn"
            prepend-icon="mdi-inbox-multiple-outline"
            @click="currentAdminTab = 'submissions'"
          >
            <span>Inquiries & Messages</span>
            <v-chip
              v-if="unreadCount > 0"
              size="x-small"
              color="#00c2ff"
              variant="flat"
              class="text-slate-900 font-weight-bold ml-2"
            >
              {{ unreadCount }}
            </v-chip>
          </v-btn>

          <v-btn
            :variant="currentAdminTab === 'courses' ? 'flat' : 'outlined'"
            :color="currentAdminTab === 'courses' ? '#00366F' : 'grey-lighten-1'"
            size="large"
            class="font-weight-bold px-5 module-tab-btn"
            prepend-icon="mdi-school-outline"
            @click="currentAdminTab = 'courses'; fetchAdminCourses()"
          >
            <span>Training Curriculum & Courses</span>
            <v-chip
              size="x-small"
              color="#38bdf8"
              variant="tonal"
              class="font-weight-bold ml-2"
            >
              {{ coursesStats.total }}
            </v-chip>
          </v-btn>

          <v-btn
            :variant="currentAdminTab === 'enrollments' ? 'flat' : 'outlined'"
            :color="currentAdminTab === 'enrollments' ? '#00366F' : 'grey-lighten-1'"
            size="large"
            class="font-weight-bold px-5 module-tab-btn"
            prepend-icon="mdi-account-school-outline"
            @click="currentAdminTab = 'enrollments'; fetchAdminEnrollments()"
          >
            <span>Student Enrollments</span>
            <v-chip
              v-if="enrollmentsStats.pending > 0"
              size="x-small"
              color="#00c2ff"
              variant="flat"
              class="text-slate-900 font-weight-bold ml-2"
            >
              {{ enrollmentsStats.pending }}
            </v-chip>
            <v-chip
              v-else
              size="x-small"
              color="grey-lighten-1"
              variant="tonal"
              class="font-weight-bold ml-2"
            >
              {{ enrollmentsStats.total }}
            </v-chip>
          </v-btn>

          <v-btn
            :variant="currentAdminTab === 'analytics' ? 'flat' : 'outlined'"
            :color="currentAdminTab === 'analytics' ? '#00366F' : 'grey-lighten-1'"
            size="large"
            class="font-weight-bold px-5 module-tab-btn"
            prepend-icon="mdi-chart-timeline-variant"
            @click="currentAdminTab = 'analytics'; fetchAnalytics(true)"
          >
            <span>Website Visitors</span>
            <v-chip
              v-if="analyticsData?.summary?.todayVisitors !== undefined"
              size="x-small"
              color="#00c2ff"
              variant="flat"
              class="text-slate-900 font-weight-bold ml-2"
            >
              {{ analyticsData?.summary?.todayVisitors }} today
            </v-chip>
            <v-chip
              v-else
              size="x-small"
              color="grey-lighten-1"
              variant="tonal"
              class="font-weight-bold ml-2"
            >
              Live
            </v-chip>
          </v-btn>
        </div>

        <!-- ============================================== -->
        <!-- TAB 1: SUBMISSIONS & INQUIRIES                 -->
        <!-- ============================================== -->
        <template v-if="currentAdminTab === 'submissions'">
        <!-- Quick Website Visitors Telemetry Strip -->
        <v-card
          class="pa-3 mb-6 analytics-banner-strip cursor-pointer elevation-4"
          @click="currentAdminTab = 'analytics'; fetchAnalytics(true)"
        >
          <div class="d-flex align-center justify-space-between flex-wrap ga-3">
            <div class="d-flex align-center ga-3">
              <div class="kpi-mini-icon bg-navy pa-2 rounded-lg d-flex align-center justify-center">
                <v-icon icon="mdi-chart-line" color="#00c2ff" size="22" />
              </div>
              <div>
                <div class="d-flex align-center ga-2">
                  <span class="text-subtitle-2 font-weight-bold text-white">Website Visitors</span>
                  <v-chip size="x-small" color="#10b981" variant="flat" class="font-weight-bold text-slate-900">
                    Live Telemetry
                  </v-chip>
                </div>
                <div class="text-caption text-grey-lighten-1 mt-0-5">
                  <strong class="text-cyan">{{ analyticsData?.summary?.todayVisitors || 0 }}</strong> visitors today ·
                  <strong class="text-sky">{{ analyticsData?.summary?.last7DaysVisitors || 0 }}</strong> last 7 days ·
                  <strong class="text-white">{{ analyticsData?.summary?.totalVisitors || 0 }}</strong> total since Oct 29, 2026
                </div>
              </div>
            </div>
            <v-btn
              size="small"
              variant="tonal"
              color="#00c2ff"
              append-icon="mdi-arrow-right"
              class="font-weight-bold text-capitalize"
            >
              Open Visitor Analytics
            </v-btn>
          </div>
        </v-card>

        <!-- KPI Summary Metric Cards -->
        <v-row class="mb-6 gy-4">
          <!-- Total Inquiries -->
          <v-col cols="12" sm="6" lg="3">
            <v-card class="kpi-card pa-4">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-caption text-grey-lighten-1 font-weight-medium text-uppercase tracking-wider">
                    Total Submissions
                  </div>
                  <div class="text-h4 font-weight-bold text-white mt-1">
                    {{ stats.total }}
                  </div>
                </div>
                <div class="kpi-icon-wrapper bg-navy">
                  <v-icon icon="mdi-inbox-multiple" color="#38bdf8" size="28" />
                </div>
              </div>
              <div class="text-caption text-grey-lighten-2 mt-3 d-flex align-center ga-1">
                <v-icon icon="mdi-database-check-outline" size="14" color="success" />
                <span>MongoDB synchronized</span>
              </div>
            </v-card>
          </v-col>

          <!-- Unread Inquiries (Highlight Badge) -->
          <v-col cols="12" sm="6" lg="3">
            <v-card class="kpi-card kpi-card--unread pa-4" :class="{ 'has-unread': unreadCount > 0 }">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-caption text-cyan-lighten-2 font-weight-medium text-uppercase tracking-wider">
                    Unread Messages
                  </div>
                  <div class="text-h4 font-weight-bold text-white mt-1 d-flex align-center ga-2">
                    {{ unreadCount }}
                    <v-chip
                      v-if="unreadCount > 0"
                      size="x-small"
                      color="#00c2ff"
                      variant="flat"
                      class="font-weight-bold text-slate-900"
                    >
                      ACTION
                    </v-chip>
                  </div>
                </div>
                <div class="kpi-icon-wrapper bg-cyan">
                  <v-icon icon="mdi-email-alert" color="#00c2ff" size="28" />
                </div>
              </div>
              <div class="text-caption text-cyan-lighten-4 mt-3 d-flex align-center ga-1">
                <v-icon icon="mdi-bell-ring-outline" size="14" color="#00c2ff" />
                <span>{{ unreadCount > 0 ? 'Requires team review' : 'All caught up' }}</span>
              </div>
            </v-card>
          </v-col>

          <!-- Read / Resolved -->
          <v-col cols="12" sm="6" lg="3">
            <v-card class="kpi-card pa-4">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-caption text-grey-lighten-1 font-weight-medium text-uppercase tracking-wider">
                    Processed / Read
                  </div>
                  <div class="text-h4 font-weight-bold text-white mt-1">
                    {{ stats.read }}
                  </div>
                </div>
                <div class="kpi-icon-wrapper bg-emerald">
                  <v-icon icon="mdi-email-check-outline" color="#10b981" size="28" />
                </div>
              </div>
              <div class="text-caption text-grey-lighten-2 mt-3 d-flex align-center ga-1">
                <v-icon icon="mdi-check-circle-outline" size="14" color="success" />
                <span>Reviewed by staff</span>
              </div>
            </v-card>
          </v-col>

          <!-- Today's Inquiries -->
          <v-col cols="12" sm="6" lg="3">
            <v-card class="kpi-card pa-4">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-caption text-grey-lighten-1 font-weight-medium text-uppercase tracking-wider">
                    Received Today
                  </div>
                  <div class="text-h4 font-weight-bold text-white mt-1">
                    {{ stats.today }}
                  </div>
                </div>
                <div class="kpi-icon-wrapper bg-indigo">
                  <v-icon icon="mdi-calendar-clock-outline" color="#818cf8" size="28" />
                </div>
              </div>
              <div class="text-caption text-grey-lighten-2 mt-3 d-flex align-center ga-1">
                <v-icon icon="mdi-clock-outline" size="14" color="#818cf8" />
                <span>Last updated {{ lastUpdatedTime || 'just now' }}</span>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Main Workspace: Search, Filter Tabs & Batch Actions -->
        <v-card class="admin-table-card elevation-12">
          <!-- Control Bar -->
          <div class="table-toolbar pa-4 pa-md-6 d-flex flex-wrap align-center justify-space-between ga-4 border-b">
            <!-- Filter Tabs -->
            <div class="filter-tabs d-flex align-center ga-2">
              <v-btn
                :variant="activeFilter === 'all' ? 'flat' : 'text'"
                :color="activeFilter === 'all' ? '#00366F' : 'grey-lighten-1'"
                size="small"
                class="tab-btn font-weight-bold"
                @click="activeFilter = 'all'"
              >
                All ({{ stats.total }})
              </v-btn>

              <v-btn
                :variant="activeFilter === 'unread' ? 'flat' : 'text'"
                :color="activeFilter === 'unread' ? '#00366F' : 'grey-lighten-1'"
                size="small"
                class="tab-btn font-weight-bold d-flex align-center ga-1"
                @click="activeFilter = 'unread'"
              >
                <span>Unread</span>
                <v-chip
                  v-if="unreadCount > 0"
                  size="x-small"
                  color="#00c2ff"
                  variant="flat"
                  class="font-weight-bold ml-1 text-slate-900"
                >
                  {{ unreadCount }}
                </v-chip>
              </v-btn>

              <v-btn
                :variant="activeFilter === 'read' ? 'flat' : 'text'"
                :color="activeFilter === 'read' ? '#00366F' : 'grey-lighten-1'"
                size="small"
                class="tab-btn font-weight-bold"
                @click="activeFilter = 'read'"
              >
                Read ({{ stats.read }})
              </v-btn>
            </div>

            <!-- Search Field & Actions -->
            <div class="d-flex align-center flex-grow-1 flex-md-grow-0 ga-3" style="min-width: 280px;">
              <v-text-field
                v-model="searchQuery"
                placeholder="Search name, email, subject, text..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
                bg-color="#0B0F19"
                color="#0056b3"
                clearable
                class="search-input"
              />

              <v-menu location="bottom end">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-dots-vertical"
                    variant="tonal"
                    size="small"
                    color="grey-lighten-1"
                  />
                </template>
                <v-list class="action-dropdown" bg-color="#0e1726" elevation="8">
                  <v-list-item
                    prepend-icon="mdi-email-check-outline"
                    title="Mark all as read"
                    :disabled="unreadCount === 0"
                    @click="markAllAsRead"
                  />
                  <v-list-item
                    prepend-icon="mdi-download-outline"
                    title="Export JSON"
                    :disabled="contacts.length === 0"
                    @click="exportJson"
                  />
                </v-list>
              </v-menu>
            </div>
          </div>

          <!-- Loading Indicator -->
          <v-progress-linear v-if="isLoading" indeterminate color="#00a8ff" height="3" />

          <!-- Submissions Cards / List -->
          <div class="pa-4 pa-md-6">
            <!-- Empty State -->
            <div
              v-if="!isLoading && contacts.length === 0"
              class="empty-state text-center py-12 px-4"
            >
              <div class="empty-icon-box mb-4">
                <v-icon icon="mdi-email-search-outline" size="56" color="#0056b3" />
              </div>
              <h3 class="text-h6 font-weight-bold text-white mb-2">No Submissions Found</h3>
              <p class="text-body-2 text-grey-lighten-1 max-w-md mx-auto">
                {{
                  searchQuery
                    ? `No submissions match "${searchQuery}". Try a different search keyword.`
                    : activeFilter === 'unread'
                    ? 'Great news! There are currently no unread contact submissions.'
                    : 'The database is currently empty. Website contact submissions will appear here automatically.'
                }}
              </p>
              <v-btn
                v-if="searchQuery || activeFilter !== 'all'"
                variant="tonal"
                color="#00a8ff"
                size="small"
                class="mt-4"
                @click="searchQuery = ''; activeFilter = 'all'"
              >
                Clear Filters
              </v-btn>
            </div>

            <!-- Submissions List -->
            <div v-else class="submissions-list d-flex flex-column ga-3">
              <v-card
                v-for="item in contacts"
                :key="item._id"
                class="submission-item-card transition-all"
                :class="{
                  'submission-item-card--unread': !item.readStatus,
                  'submission-item-card--read': item.readStatus
                }"
                @click="openDetail(item)"
              >
                <div class="pa-4 pa-md-5 d-flex flex-column flex-md-row align-start align-md-center justify-space-between ga-4">
                  <!-- Left: Status pill, Avatar, Name & Subject -->
                  <div class="d-flex align-start ga-4 flex-grow-1" style="min-width: 0;">
                    <!-- Unread / Read Indicator -->
                    <div class="pt-1">
                      <v-tooltip :text="item.readStatus ? 'Read submission' : 'Unread submission'" location="top">
                        <template #activator="{ props }">
                          <span
                            v-bind="props"
                            class="status-dot"
                            :class="{ unread: !item.readStatus, read: item.readStatus }"
                          />
                        </template>
                      </v-tooltip>
                    </div>

                    <!-- Avatar with initials -->
                    <v-avatar color="#00366F" size="44" class="text-white font-weight-bold text-subtitle-2 elevation-2">
                      {{ (item.name || 'NC').slice(0, 2).toUpperCase() }}
                    </v-avatar>

                    <!-- Text Details -->
                    <div class="submission-text-details flex-grow-1" style="min-width: 0;">
                      <div class="d-flex align-center flex-wrap ga-2 mb-1">
                        <span class="text-subtitle-1 font-weight-bold text-white text-truncate" style="max-width: 220px;">
                          {{ item.name }}
                        </span>

                        <v-chip
                          v-if="item.company"
                          size="x-small"
                          color="#0056b3"
                          variant="tonal"
                          class="font-weight-medium"
                        >
                          {{ item.company }}
                        </v-chip>

                        <v-chip
                          v-if="!item.readStatus"
                          size="x-small"
                          color="#00c2ff"
                          variant="flat"
                          class="font-weight-bold text-slate-900 px-2"
                        >
                          NEW
                        </v-chip>
                      </div>

                      <div class="text-caption text-blue-lighten-4 mb-2 d-flex align-center flex-wrap ga-3">
                        <span class="d-flex align-center ga-1">
                          <v-icon icon="mdi-email-outline" size="14" color="blue-lighten-3" />
                          <a :href="`mailto:${item.email}`" class="sub-link" @click.stop>{{ item.email }}</a>
                        </span>

                        <span v-if="item.phone" class="d-flex align-center ga-1">
                          <v-icon icon="mdi-phone-outline" size="14" color="blue-lighten-3" />
                          <a :href="`tel:${item.phone}`" class="sub-link" @click.stop>{{ item.phone }}</a>
                        </span>
                      </div>

                      <div class="text-body-2 font-weight-medium text-slate-200 mb-1">
                        <span class="subject-badge px-2 py-0-5 rounded text-caption mr-2 font-weight-bold">
                          {{ item.subject || 'Inquiry' }}
                        </span>
                      </div>

                      <p class="text-caption text-grey-lighten-1 message-snippet mb-0">
                        {{ item.message }}
                      </p>
                    </div>
                  </div>

                  <!-- Right: Timestamp & Action Buttons -->
                  <div class="d-flex align-center justify-space-between justify-md-end w-100 w-md-auto ga-3 pt-2 pt-md-0 border-t border-t-md-0">
                    <div class="text-right text-caption text-grey-lighten-1">
                      <div class="font-weight-medium text-slate-300">
                        {{ formatRelativeTime(item.date) }}
                      </div>
                      <div class="text-grey-darken-1 font-size-xs">
                        {{ new Date(item.date).toLocaleDateString([], { month: 'numeric', day: 'numeric', year: '2-digit' }) }}
                      </div>
                    </div>

                    <div class="d-flex align-center ga-1" @click.stop>
                      <!-- Toggle Read/Unread -->
                      <v-tooltip :text="item.readStatus ? 'Mark as Unread' : 'Mark as Read'" location="top">
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            :icon="item.readStatus ? 'mdi-email-mark-as-unread' : 'mdi-email-open-outline'"
                            size="small"
                            variant="text"
                            :color="item.readStatus ? 'grey-lighten-1' : '#00c2ff'"
                            @click="toggleReadStatus(item)"
                          />
                        </template>
                      </v-tooltip>

                      <!-- Quick Reply -->
                      <v-tooltip text="Reply via email client" location="top">
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            icon="mdi-reply"
                            size="small"
                            variant="text"
                            color="blue-lighten-2"
                            :href="`mailto:${item.email}?subject=Re: [Next Challenge] ${encodeURIComponent(item.subject || 'Inquiry')}`"
                            target="_blank"
                          />
                        </template>
                      </v-tooltip>

                      <!-- Delete -->
                      <v-tooltip text="Delete submission" location="top">
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            icon="mdi-delete-outline"
                            size="small"
                            variant="text"
                            color="error"
                            @click="confirmDelete(item)"
                          />
                        </template>
                      </v-tooltip>
                    </div>
                  </div>
                </div>
              </v-card>
            </div>
          </div>
        </v-card>
        </template>

        <!-- ============================================== -->
        <!-- TAB 2: COURSES & CURRICULUM MANAGEMENT         -->
        <!-- ============================================== -->
        <template v-else-if="currentAdminTab === 'courses'">
          <!-- Courses KPI Summary -->
          <v-row class="mb-6 gy-4">
            <!-- Total Courses -->
            <v-col cols="12" sm="4">
              <v-card class="kpi-card pa-4">
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-caption text-grey-lighten-1 font-weight-medium text-uppercase tracking-wider">
                      Total Programs
                    </div>
                    <div class="text-h4 font-weight-bold text-white mt-1">
                      {{ coursesStats.total }}
                    </div>
                  </div>
                  <div class="kpi-icon-wrapper bg-navy">
                    <v-icon icon="mdi-school-outline" color="#38bdf8" size="28" />
                  </div>
                </div>
                <div class="text-caption text-grey-lighten-2 mt-3 d-flex align-center ga-1">
                  <v-icon icon="mdi-database-check-outline" size="14" color="success" />
                  <span>Curriculum database synced</span>
                </div>
              </v-card>
            </v-col>

            <!-- Active Courses -->
            <v-col cols="12" sm="4">
              <v-card class="kpi-card pa-4">
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-caption text-cyan-lighten-2 font-weight-medium text-uppercase tracking-wider">
                      Active & Visible
                    </div>
                    <div class="text-h4 font-weight-bold text-white mt-1">
                      {{ coursesStats.active }}
                    </div>
                  </div>
                  <div class="kpi-icon-wrapper bg-cyan">
                    <v-icon icon="mdi-check-decagram-outline" color="#00c2ff" size="28" />
                  </div>
                </div>
                <div class="text-caption text-cyan-lighten-4 mt-3 d-flex align-center ga-1">
                  <v-icon icon="mdi-web" size="14" color="#00c2ff" />
                  <span>Live on public website</span>
                </div>
              </v-card>
            </v-col>

            <!-- Inactive / Drafts -->
            <v-col cols="12" sm="4">
              <v-card class="kpi-card pa-4">
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-caption text-grey-lighten-1 font-weight-medium text-uppercase tracking-wider">
                      Drafts / Inactive
                    </div>
                    <div class="text-h4 font-weight-bold text-white mt-1">
                      {{ coursesStats.inactive }}
                    </div>
                  </div>
                  <div class="kpi-icon-wrapper bg-indigo">
                    <v-icon icon="mdi-pause-circle-outline" color="#818cf8" size="28" />
                  </div>
                </div>
                <div class="text-caption text-grey-lighten-2 mt-3 d-flex align-center ga-1">
                  <v-icon icon="mdi-pencil-ruler" size="14" color="#818cf8" />
                  <span>Hidden from catalog</span>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- Courses Workspace Table Card -->
          <v-card class="admin-table-card elevation-12">
            <!-- Control Toolbar -->
            <div class="table-toolbar pa-4 pa-md-6 d-flex flex-wrap align-center justify-space-between ga-4 border-b">
              <!-- Filter Tabs -->
              <div class="filter-tabs d-flex align-center ga-2">
                <v-btn
                  :variant="courseFilter === 'all' ? 'flat' : 'text'"
                  :color="courseFilter === 'all' ? '#00366F' : 'grey-lighten-1'"
                  size="small"
                  class="tab-btn font-weight-bold"
                  @click="courseFilter = 'all'"
                >
                  All ({{ coursesStats.total }})
                </v-btn>

                <v-btn
                  :variant="courseFilter === 'active' ? 'flat' : 'text'"
                  :color="courseFilter === 'active' ? '#00366F' : 'grey-lighten-1'"
                  size="small"
                  class="tab-btn font-weight-bold"
                  @click="courseFilter = 'active'"
                >
                  Active ({{ coursesStats.active }})
                </v-btn>

                <v-btn
                  :variant="courseFilter === 'inactive' ? 'flat' : 'text'"
                  :color="courseFilter === 'inactive' ? '#00366F' : 'grey-lighten-1'"
                  size="small"
                  class="tab-btn font-weight-bold"
                  @click="courseFilter = 'inactive'"
                >
                  Inactive ({{ coursesStats.inactive }})
                </v-btn>
              </div>

              <!-- Search Field & Create Button -->
              <div class="d-flex align-center flex-grow-1 flex-md-grow-0 ga-3" style="min-width: 320px;">
                <v-text-field
                  v-model="courseSearchQuery"
                  placeholder="Search courses, technologies..."
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  hide-details
                  bg-color="#0B0F19"
                  color="#0056b3"
                  clearable
                  class="search-input"
                />

                <v-btn
                  color="#00366F"
                  variant="flat"
                  class="text-white font-weight-bold text-capitalize"
                  prepend-icon="mdi-plus"
                  @click="openCreateCourseDialog"
                >
                  Add Course
                </v-btn>
              </div>
            </div>

            <!-- Loading Indicator -->
            <v-progress-linear v-if="isCoursesLoading" indeterminate color="#00a8ff" height="3" />

            <!-- Courses List -->
            <div class="pa-4 pa-md-6">
              <!-- Empty State -->
              <div
                v-if="!isCoursesLoading && coursesList.length === 0"
                class="empty-state text-center py-12 px-4"
              >
                <div class="empty-icon-box mb-4">
                  <v-icon icon="mdi-school-outline" size="56" color="#0056b3" />
                </div>
                <h3 class="text-h6 font-weight-bold text-white mb-2">No Courses Found</h3>
                <p class="text-body-2 text-grey-lighten-1 max-w-md mx-auto mb-4">
                  {{
                    courseSearchQuery
                      ? `No programs match "${courseSearchQuery}".`
                      : 'No courses registered in this view. Click "Add Course" to create a new program.'
                  }}
                </p>
                <v-btn
                  color="#00366F"
                  variant="flat"
                  class="text-white font-weight-bold text-capitalize"
                  prepend-icon="mdi-plus"
                  @click="openCreateCourseDialog"
                >
                  Create Program
                </v-btn>
              </div>

              <!-- Courses Cards -->
              <div v-else class="courses-admin-list d-flex flex-column ga-4">
                <v-card
                  v-for="course in coursesList"
                  :key="course._id"
                  color="#0B0F19"
                  class="course-admin-card pa-4 pa-md-5 border rounded-lg transition-all"
                  :class="{ 'course-admin-card--inactive': !course.isActive }"
                >
                  <div class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between ga-4">
                    <!-- Left: Icon & Details -->
                    <div class="d-flex align-start ga-4 flex-grow-1" style="min-width: 0;">
                      <div class="course-admin-icon-box mt-1 flex-shrink-0">
                        <v-icon :icon="course.icon || 'mdi-school-outline'" size="26" color="#00c2ff" />
                      </div>

                      <div class="flex-grow-1" style="min-width: 0;">
                        <div class="d-flex align-center flex-wrap ga-2 mb-1">
                          <h4 class="text-subtitle-1 font-weight-bold text-white mb-0">
                            {{ course.title }}
                          </h4>

                          <v-chip
                            v-if="course.badge"
                            size="x-small"
                            color="#0056b3"
                            variant="tonal"
                            class="font-weight-bold"
                          >
                            {{ course.badge }}
                          </v-chip>

                          <v-chip
                            v-if="course.duration"
                            size="x-small"
                            color="grey-lighten-1"
                            variant="outlined"
                          >
                            {{ course.duration }}
                          </v-chip>

                          <v-chip
                            :color="course.isActive ? 'success' : 'grey'"
                            size="x-small"
                            variant="flat"
                            class="font-weight-bold"
                          >
                            {{ course.isActive ? 'ACTIVE' : 'DRAFT' }}
                          </v-chip>
                        </div>

                        <p class="text-caption text-grey-lighten-1 mb-2 line-clamp-2">
                          {{ course.description }}
                        </p>

                        <!-- Tech tags -->
                        <div class="d-flex flex-wrap ga-1-5 mb-2">
                          <span
                            v-for="tech in course.technologies"
                            :key="tech"
                            class="tech-tag-pill text-caption px-2 py-0-5 rounded"
                          >
                            {{ tech }}
                          </span>
                        </div>

                        <!-- Syllabus preview -->
                        <div class="text-caption text-cyan-lighten-4 d-flex align-center ga-2 flex-wrap">
                          <span class="font-weight-bold">
                            <v-icon icon="mdi-format-list-bulleted-square" size="13" class="mr-1" />
                            {{ course.syllabus?.length || 0 }} Module Levels:
                          </span>
                          <span
                            v-for="(mod, mIdx) in course.syllabus"
                            :key="mIdx"
                            class="syllabus-mod-chip px-1-5 py-0-5 rounded text-caption"
                          >
                            {{ mod.level || `L${mIdx + 1}` }}: {{ mod.title || mod }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Right: Action Buttons -->
                    <div class="d-flex align-center ga-2 pt-2 pt-md-0 border-t border-t-md-0 w-100 w-md-auto justify-end">
                      <!-- Active Switch -->
                      <v-tooltip :text="course.isActive ? 'Deactivate course' : 'Activate course'" location="top">
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            :icon="course.isActive ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                            size="small"
                            variant="tonal"
                            :color="course.isActive ? 'success' : 'grey'"
                            @click="toggleCourseActive(course)"
                          />
                        </template>
                      </v-tooltip>

                      <!-- Edit Button -->
                      <v-tooltip text="Edit Program" location="top">
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            icon="mdi-pencil-outline"
                            size="small"
                            variant="tonal"
                            color="#38bdf8"
                            @click="openEditCourseDialog(course)"
                          />
                        </template>
                      </v-tooltip>

                      <!-- Delete Button -->
                      <v-tooltip text="Delete Program" location="top">
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            icon="mdi-delete-outline"
                            size="small"
                            variant="tonal"
                            color="error"
                            @click="confirmDeleteCourse(course)"
                          />
                        </template>
                      </v-tooltip>
                    </div>
                  </div>
                </v-card>
              </div>
            </div>
          </v-card>
        </template>

        <!-- ============================================== -->
        <!-- TAB 3: STUDENT ENROLLMENTS MANAGEMENT          -->
        <!-- ============================================== -->
        <template v-else-if="currentAdminTab === 'enrollments'">
          <!-- Enrollments KPI Summary -->
          <v-row class="mb-6 gy-4">
            <!-- Total Applications -->
            <v-col cols="12" sm="6" lg="3">
              <v-card class="kpi-card pa-4">
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-caption text-grey-lighten-1 font-weight-medium text-uppercase tracking-wider">
                      Total Applications
                    </div>
                    <div class="text-h4 font-weight-bold text-white mt-1">
                      {{ enrollmentsStats.total }}
                    </div>
                  </div>
                  <div class="kpi-icon-wrapper bg-navy">
                    <v-icon icon="mdi-account-group-outline" color="#38bdf8" size="28" />
                  </div>
                </div>
                <div class="text-caption text-grey-lighten-2 mt-3 d-flex align-center ga-1">
                  <v-icon icon="mdi-school-outline" size="14" color="#38bdf8" />
                  <span>All course candidates</span>
                </div>
              </v-card>
            </v-col>

            <!-- Pending Review -->
            <v-col cols="12" sm="6" lg="3">
              <v-card class="kpi-card pa-4 kpi-card--unread" :class="{ 'has-unread': enrollmentsStats.pending > 0 }">
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-caption text-cyan-lighten-2 font-weight-medium text-uppercase tracking-wider">
                      Pending Review
                    </div>
                    <div class="text-h4 font-weight-bold text-cyan mt-1">
                      {{ enrollmentsStats.pending }}
                    </div>
                  </div>
                  <div class="kpi-icon-wrapper bg-cyan">
                    <v-icon icon="mdi-clock-alert-outline" color="#00c2ff" size="28" />
                  </div>
                </div>
                <div class="text-caption text-cyan-lighten-4 mt-3 d-flex align-center ga-1">
                  <span class="pulse-indicator" :class="{ active: enrollmentsStats.pending > 0 }" />
                  <span>{{ enrollmentsStats.pending > 0 ? 'Action required by staff' : 'All applications handled' }}</span>
                </div>
              </v-card>
            </v-col>

            <!-- Approved Candidates -->
            <v-col cols="12" sm="6" lg="3">
              <v-card class="kpi-card pa-4">
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-caption text-grey-lighten-1 font-weight-medium text-uppercase tracking-wider">
                      Approved
                    </div>
                    <div class="text-h4 font-weight-bold mt-1" style="color: #10b981;">
                      {{ enrollmentsStats.approved }}
                    </div>
                  </div>
                  <div class="kpi-icon-wrapper bg-emerald">
                    <v-icon icon="mdi-check-decagram-outline" color="#10b981" size="28" />
                  </div>
                </div>
                <div class="text-caption text-grey-lighten-2 mt-3 d-flex align-center ga-1">
                  <v-icon icon="mdi-check-circle-outline" size="14" color="success" />
                  <span>Accepted students</span>
                </div>
              </v-card>
            </v-col>

            <!-- Rejected / Closed -->
            <v-col cols="12" sm="6" lg="3">
              <v-card class="kpi-card pa-4">
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-caption text-grey-lighten-1 font-weight-medium text-uppercase tracking-wider">
                      Closed / Rejected
                    </div>
                    <div class="text-h4 font-weight-bold text-white mt-1">
                      {{ enrollmentsStats.rejected }}
                    </div>
                  </div>
                  <div class="kpi-icon-wrapper bg-indigo">
                    <v-icon icon="mdi-close-octagon-outline" color="#818cf8" size="28" />
                  </div>
                </div>
                <div class="text-caption text-grey-lighten-2 mt-3 d-flex align-center ga-1">
                  <v-icon icon="mdi-archive-outline" size="14" color="#818cf8" />
                  <span>Archived / unaccepted</span>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- Enrollments Workspace Table Card -->
          <v-card class="admin-table-card elevation-12">
            <!-- Toolbar -->
            <div class="table-toolbar pa-4 pa-md-6 d-flex flex-wrap align-center justify-space-between ga-4 border-b">
              <!-- Filter Tabs -->
              <div class="filter-tabs d-flex align-center ga-2 flex-wrap">
                <v-btn
                  :variant="enrollmentFilter === 'all' ? 'flat' : 'text'"
                  :color="enrollmentFilter === 'all' ? '#00366F' : 'grey-lighten-1'"
                  size="small"
                  class="tab-btn font-weight-bold"
                  @click="enrollmentFilter = 'all'"
                >
                  All ({{ enrollmentsStats.total }})
                </v-btn>

                <v-btn
                  :variant="enrollmentFilter === 'pending' ? 'flat' : 'text'"
                  :color="enrollmentFilter === 'pending' ? '#00366F' : 'grey-lighten-1'"
                  size="small"
                  class="tab-btn font-weight-bold d-flex align-center ga-1"
                  @click="enrollmentFilter = 'pending'"
                >
                  <span>Pending</span>
                  <v-chip
                    v-if="enrollmentsStats.pending > 0"
                    size="x-small"
                    color="#00c2ff"
                    variant="flat"
                    class="font-weight-bold ml-1 text-slate-900"
                  >
                    {{ enrollmentsStats.pending }}
                  </v-chip>
                </v-btn>

                <v-btn
                  :variant="enrollmentFilter === 'approved' ? 'flat' : 'text'"
                  :color="enrollmentFilter === 'approved' ? '#00366F' : 'grey-lighten-1'"
                  size="small"
                  class="tab-btn font-weight-bold"
                  @click="enrollmentFilter = 'approved'"
                >
                  Approved ({{ enrollmentsStats.approved }})
                </v-btn>

                <v-btn
                  :variant="enrollmentFilter === 'rejected' ? 'flat' : 'text'"
                  :color="enrollmentFilter === 'rejected' ? '#00366F' : 'grey-lighten-1'"
                  size="small"
                  class="tab-btn font-weight-bold"
                  @click="enrollmentFilter = 'rejected'"
                >
                  Rejected ({{ enrollmentsStats.rejected }})
                </v-btn>
              </div>

              <!-- Search Field & Actions -->
              <div class="d-flex align-center flex-grow-1 flex-md-grow-0 ga-3" style="min-width: 280px;">
                <v-text-field
                  v-model="enrollmentSearchQuery"
                  placeholder="Search student, email, phone, course..."
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  hide-details
                  bg-color="#0B0F19"
                  color="#0056b3"
                  clearable
                  class="search-input"
                />

                <v-menu location="bottom end">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-dots-vertical"
                      variant="tonal"
                      size="small"
                      color="grey-lighten-1"
                    />
                  </template>
                  <v-list class="action-dropdown" bg-color="#0e1726" elevation="8">
                    <v-list-item
                      prepend-icon="mdi-refresh"
                      title="Refresh List"
                      @click="fetchAdminEnrollments"
                    />
                    <v-list-item
                      prepend-icon="mdi-download-outline"
                      title="Export JSON"
                      :disabled="enrollmentsList.length === 0"
                      @click="exportEnrollmentsJson"
                    />
                  </v-list>
                </v-menu>
              </div>
            </div>

            <!-- Loading Indicator -->
            <v-progress-linear v-if="isEnrollmentsLoading" indeterminate color="#00a8ff" height="3" />

            <!-- Applications List -->
            <div class="pa-4 pa-md-6">
              <!-- Empty State -->
              <div
                v-if="!isEnrollmentsLoading && enrollmentsList.length === 0"
                class="empty-state text-center py-12 px-4"
              >
                <div class="empty-icon-box mb-4">
                  <v-icon icon="mdi-account-search-outline" size="56" color="#0056b3" />
                </div>
                <h3 class="text-h6 font-weight-bold text-white mb-2">No Applications Found</h3>
                <p class="text-body-2 text-grey-lighten-1 max-w-md mx-auto mb-0">
                  {{
                    enrollmentSearchQuery
                      ? `No applications matching "${enrollmentSearchQuery}".`
                      : 'No student enrollment applications registered in this view.'
                  }}
                </p>
              </div>

              <!-- Applications Cards -->
              <div v-else class="d-flex flex-column ga-3">
                <v-card
                  v-for="app in enrollmentsList"
                  :key="app._id"
                  class="submission-item-card pa-4"
                  :class="{
                    'submission-item-card--unread': app.status === 'pending',
                    'enrollment-item-card--approved': app.status === 'approved'
                  }"
                  @click="openEnrollmentDetail(app)"
                >
                  <div class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between ga-3">
                    <!-- Left: Status Indicator & Student Info -->
                    <div class="d-flex align-start ga-3 flex-grow-1" style="min-width: 0;">
                      <div class="mt-1 flex-shrink-0">
                        <span
                          class="status-dot"
                          :class="{
                            'status-dot-pending': app.status === 'pending',
                            'status-dot-approved': app.status === 'approved',
                            'status-dot-rejected': app.status === 'rejected'
                          }"
                        />
                      </div>

                      <div class="flex-grow-1" style="min-width: 0;">
                        <!-- Student Name & Status Chip & Course -->
                        <div class="d-flex align-center flex-wrap ga-2 mb-1">
                          <span class="font-weight-bold text-white text-subtitle-2">
                            {{ app.name }}
                          </span>

                          <v-chip
                            size="x-small"
                            :color="
                              app.status === 'approved'
                                ? 'success'
                                : app.status === 'pending'
                                ? 'amber'
                                : 'grey'
                            "
                            variant="flat"
                            class="font-weight-bold"
                          >
                            {{ (app.status || 'pending').toUpperCase() }}
                          </v-chip>

                          <v-chip
                            size="x-small"
                            color="#00366F"
                            variant="flat"
                            class="text-cyan-lighten-3 font-weight-medium"
                          >
                            <v-icon
                              :icon="app.selectedCourseId?.icon || 'mdi-school-outline'"
                              size="12"
                              class="mr-1"
                            />
                            {{ app.selectedCourseId?.title || app.courseTitle || 'Training Program' }}
                          </v-chip>
                        </div>

                        <!-- Contact details: Email & Phone -->
                        <div class="d-flex align-center flex-wrap ga-3 text-caption text-grey-lighten-1 mb-2">
                          <a
                            :href="`mailto:${app.email}`"
                            class="sub-link d-flex align-center ga-1"
                            @click.stop
                          >
                            <v-icon icon="mdi-email-outline" size="14" />
                            <span>{{ app.email }}</span>
                          </a>
                          <a
                            :href="`tel:${app.phone}`"
                            class="sub-link d-flex align-center ga-1"
                            @click.stop
                          >
                            <v-icon icon="mdi-phone-outline" size="14" />
                            <span>{{ app.phone }}</span>
                          </a>
                        </div>

                        <!-- Message snippet if provided -->
                        <p v-if="app.message" class="text-caption text-slate-300 message-snippet mb-1">
                          "{{ app.message }}"
                        </p>

                        <!-- Staff notes snippet if any -->
                        <div v-if="app.adminNotes" class="text-caption text-amber-lighten-3 d-flex align-center ga-1">
                          <v-icon icon="mdi-note-text-outline" size="13" />
                          <span>Staff note: {{ app.adminNotes }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Right: Date & Action Buttons -->
                    <div class="d-flex align-center ga-2 flex-shrink-0 pt-2 pt-md-0 border-t border-t-md-0 w-100 w-md-auto justify-space-between justify-md-end">
                      <span class="text-caption text-grey-lighten-1">
                        {{ formatDate(app.date) }}
                      </span>

                      <div class="d-flex align-center ga-1">
                        <!-- Quick Approve Button -->
                        <v-tooltip v-if="app.status !== 'approved'" text="Approve Student" location="top">
                          <template #activator="{ props }">
                            <v-btn
                              v-bind="props"
                              icon="mdi-check-circle-outline"
                              size="small"
                              variant="tonal"
                              color="success"
                              @click.stop="updateEnrollmentStatus(app, 'approved')"
                            />
                          </template>
                        </v-tooltip>

                        <!-- Quick Reject Button -->
                        <v-tooltip v-if="app.status !== 'rejected'" text="Reject / Close" location="top">
                          <template #activator="{ props }">
                            <v-btn
                              v-bind="props"
                              icon="mdi-close-circle-outline"
                              size="small"
                              variant="tonal"
                              color="error"
                              @click.stop="updateEnrollmentStatus(app, 'rejected')"
                            />
                          </template>
                        </v-tooltip>

                        <!-- View Details Modal -->
                        <v-tooltip text="View Application & Notes" location="top">
                          <template #activator="{ props }">
                            <v-btn
                              v-bind="props"
                              icon="mdi-eye-outline"
                              size="small"
                              variant="tonal"
                              color="#38bdf8"
                              @click.stop="openEnrollmentDetail(app)"
                            />
                          </template>
                        </v-tooltip>

                        <!-- Delete Button -->
                        <v-tooltip text="Delete Application" location="top">
                          <template #activator="{ props }">
                            <v-btn
                              v-bind="props"
                              icon="mdi-delete-outline"
                              size="small"
                              variant="tonal"
                              color="error"
                              @click.stop="confirmDeleteEnrollment(app)"
                            />
                          </template>
                        </v-tooltip>
                      </div>
                    </div>
                  </div>
                </v-card>
              </div>
            </div>
          </v-card>
        </template>

        <!-- ============================================== -->
        <!-- TAB 4: WEBSITE VISITORS & ANALYTICS            -->
        <!-- ============================================== -->
        <template v-else-if="currentAdminTab === 'analytics'">
          <!-- Analytics Section Header & Period Switcher -->
          <v-card class="pa-4 pa-md-5 mb-6 analytics-header-card">
            <div class="d-flex align-center justify-space-between flex-wrap ga-4">
              <div>
                <div class="d-flex align-center flex-wrap ga-2 mb-1">
                  <h2 class="text-h5 font-weight-bold text-white mb-0 d-flex align-center ga-2">
                    <v-icon icon="mdi-chart-line" color="#00c2ff" size="28" />
                    <span>Website Visitors & Traffic Analytics</span>
                  </h2>
                  <v-chip
                    size="small"
                    color="#10b981"
                    variant="flat"
                    class="font-weight-bold text-slate-900 ml-md-2"
                  >
                    <v-icon icon="mdi-shield-check" size="14" class="mr-1" />
                    First-Party Active
                  </v-chip>
                </div>
                <div class="text-body-2 text-grey-lighten-1">
                  Real-time anonymous visitor telemetry from <strong class="text-cyan-lighten-3">nextchallenge.tech</strong>.
                  Zero third-party tracking scripts, zero raw IP retention, and privacy-first session deduplication.
                </div>
              </div>

              <!-- Controls: Period Selector & Manual Refresh -->
              <div class="d-flex align-center flex-wrap ga-2">
                <v-btn-toggle
                  v-model="analyticsRange"
                  mandatory
                  density="compact"
                  color="#00c2ff"
                  variant="outlined"
                  class="analytics-period-toggle"
                >
                  <v-btn value="7d" size="small" class="px-3 font-weight-medium">
                    Last 7 Days
                  </v-btn>
                  <v-btn value="30d" size="small" class="px-3 font-weight-medium">
                    Last 30 Days
                  </v-btn>
                  <v-btn value="90d" size="small" class="px-3 font-weight-medium">
                    Last 90 Days
                  </v-btn>
                </v-btn-toggle>

                <v-btn
                  icon="mdi-refresh"
                  size="small"
                  variant="tonal"
                  color="#38bdf8"
                  :loading="isAnalyticsLoading"
                  title="Refresh visitor analytics"
                  @click="fetchAnalytics(true)"
                />
              </div>
            </div>

            <!-- Activation Notice Banner -->
            <div class="activation-notice-strip mt-4 pa-3 rounded-lg d-flex align-center justify-space-between flex-wrap ga-2">
              <div class="d-flex align-center ga-2 text-caption">
                <v-icon icon="mdi-information-outline" size="16" color="#00c2ff" />
                <span class="text-grey-lighten-2">
                  <strong>Analytics collection started:</strong> October 29, 2026.
                  Days prior to activation date reflect zero recorded traffic rather than historical data.
                </span>
              </div>
              <div v-if="lastUpdatedTime" class="text-caption text-grey-lighten-2 d-flex align-center ga-1">
                <v-icon icon="mdi-clock-outline" size="14" color="grey-lighten-1" />
                <span>Synchronized at {{ lastUpdatedTime }}</span>
              </div>
            </div>
          </v-card>

          <!-- Analytics Error Alert -->
          <v-alert
            v-if="analyticsError"
            type="error"
            variant="tonal"
            closable
            class="mb-6"
            @click:close="analyticsError = ''"
          >
            <div class="d-flex align-center justify-space-between flex-wrap ga-2">
              <span>{{ analyticsError }}</span>
              <v-btn size="small" variant="outlined" color="error" @click="fetchAnalytics(true)">
                Retry
              </v-btn>
            </div>
          </v-alert>

          <!-- Initial Loading State -->
          <div v-if="isAnalyticsLoading && !analyticsData" class="text-center py-12">
            <v-progress-circular indeterminate color="#00c2ff" size="48" class="mb-4" />
            <div class="text-h6 text-white font-weight-medium">Collecting visitor data...</div>
            <div class="text-body-2 text-grey-lighten-1 mt-1">
              Synchronizing real-time analytics from MongoDB Atlas backend
            </div>
          </div>

          <template v-else>
            <!-- ========================================================= -->
            <!-- 1. PROMINENT KPI SUMMARY METRIC CARDS                     -->
            <!-- ========================================================= -->
            <v-row class="mb-6 gy-4">
              <!-- Total Visitors -->
              <v-col cols="12" sm="6" lg="3">
                <v-card class="kpi-card kpi-card--analytics pa-4 h-100">
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <div class="text-caption text-grey-lighten-1 font-weight-medium text-uppercase tracking-wider">
                        👥 Total Visitors
                      </div>
                      <div class="text-h4 font-weight-bold text-white mt-1">
                        {{ analyticsData?.summary?.totalVisitors || 0 }}
                      </div>
                    </div>
                    <div class="kpi-icon-wrapper bg-navy">
                      <v-icon icon="mdi-account-group" color="#00c2ff" size="28" />
                    </div>
                  </div>
                  <div class="text-caption text-grey-lighten-2 mt-3 d-flex align-center ga-1">
                    <v-icon icon="mdi-calendar-check-outline" size="14" color="#00c2ff" />
                    <span>Distinct visitors since activation</span>
                  </div>
                </v-card>
              </v-col>

              <!-- Visitors Today -->
              <v-col cols="12" sm="6" lg="3">
                <v-card class="kpi-card kpi-card--analytics pa-4 h-100">
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <div class="text-caption text-grey-lighten-1 font-weight-medium text-uppercase tracking-wider">
                        📅 Visitors Today
                      </div>
                      <div class="text-h4 font-weight-bold text-white mt-1">
                        {{ analyticsData?.summary?.todayVisitors || 0 }}
                      </div>
                    </div>
                    <div class="kpi-icon-wrapper bg-navy">
                      <v-icon icon="mdi-calendar-today" color="#38bdf8" size="28" />
                    </div>
                  </div>
                  <div class="text-caption text-grey-lighten-2 mt-3 d-flex align-center justify-space-between flex-wrap ga-1">
                    <span class="d-flex align-center ga-1">
                      <v-icon icon="mdi-history" size="14" color="grey-lighten-1" />
                      <span>Yesterday: {{ analyticsData?.summary?.yesterdayVisitors || 0 }}</span>
                    </span>
                    <v-chip size="x-small" color="#00c2ff" variant="tonal" class="font-weight-bold">
                      {{ analyticsData?.summary?.todayVisits || 0 }} visits
                    </v-chip>
                  </div>
                </v-card>
              </v-col>

              <!-- Visitors Last 7 Days -->
              <v-col cols="12" sm="6" lg="3">
                <v-card class="kpi-card kpi-card--analytics pa-4 h-100">
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <div class="text-caption text-grey-lighten-1 font-weight-medium text-uppercase tracking-wider">
                        📈 Visitors Last 7 Days
                      </div>
                      <div class="text-h4 font-weight-bold text-white mt-1">
                        {{ analyticsData?.summary?.last7DaysVisitors || 0 }}
                      </div>
                    </div>
                    <div class="kpi-icon-wrapper bg-navy">
                      <v-icon icon="mdi-chart-line-variant" color="#7dd3fc" size="28" />
                    </div>
                  </div>
                  <div class="text-caption text-grey-lighten-2 mt-3 d-flex align-center justify-space-between flex-wrap ga-1">
                    <span class="d-flex align-center ga-1">
                      <v-icon icon="mdi-calendar-range" size="14" color="#7dd3fc" />
                      <span>Rolling 7-day window</span>
                    </span>
                    <v-chip size="x-small" color="#7dd3fc" variant="tonal" class="font-weight-bold">
                      {{ analyticsData?.summary?.last7DaysVisits || 0 }} visits
                    </v-chip>
                  </div>
                </v-card>
              </v-col>

              <!-- Visitors Last 30 Days -->
              <v-col cols="12" sm="6" lg="3">
                <v-card class="kpi-card kpi-card--analytics pa-4 h-100">
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <div class="text-caption text-grey-lighten-1 font-weight-medium text-uppercase tracking-wider">
                        📊 Visitors Last 30 Days
                      </div>
                      <div class="text-h4 font-weight-bold text-white mt-1">
                        {{ analyticsData?.summary?.last30DaysVisitors || 0 }}
                      </div>
                    </div>
                    <div class="kpi-icon-wrapper bg-navy">
                      <v-icon icon="mdi-poll" color="#a78bfa" size="28" />
                    </div>
                  </div>
                  <div class="text-caption text-grey-lighten-2 mt-3 d-flex align-center justify-space-between flex-wrap ga-1">
                    <span class="d-flex align-center ga-1">
                      <v-icon icon="mdi-calendar-month-outline" size="14" color="#a78bfa" />
                      <span>Rolling 30-day window</span>
                    </span>
                    <v-chip size="x-small" color="#a78bfa" variant="tonal" class="font-weight-bold">
                      {{ analyticsData?.summary?.last30DaysVisits || 0 }} visits
                    </v-chip>
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <!-- ========================================================= -->
            <!-- 2. TERMINOLOGY & USER JOURNEY BREAKDOWN                   -->
            <!-- ========================================================= -->
            <v-card class="pa-4 mb-6 terminology-card">
              <div class="d-flex align-center justify-space-between flex-wrap ga-4">
                <div class="d-flex align-center flex-wrap ga-4">
                  <!-- Term: Total Visits -->
                  <div class="stat-segment">
                    <div class="text-caption text-grey-lighten-1">Total Visits / Sessions</div>
                    <div class="text-h6 font-weight-bold text-sky mt-0-5">
                      {{ analyticsData?.summary?.totalVisits || 0 }}
                    </div>
                  </div>

                  <v-divider vertical class="d-none d-sm-block my-1" />

                  <!-- Term: Unique Visitors -->
                  <div class="stat-segment">
                    <div class="text-caption text-grey-lighten-1">Unique Anonymous Visitors</div>
                    <div class="text-h6 font-weight-bold text-cyan mt-0-5">
                      {{ analyticsData?.summary?.totalVisitors || 0 }}
                    </div>
                  </div>

                  <v-divider vertical class="d-none d-sm-block my-1" />

                  <!-- Term: New Visitors -->
                  <div class="stat-segment">
                    <div class="text-caption text-grey-lighten-1">New Visitors (in period)</div>
                    <div class="text-h6 font-weight-bold text-emerald mt-0-5">
                      {{ analyticsData?.summary?.newVisitors || 0 }}
                    </div>
                  </div>

                  <v-divider vertical class="d-none d-sm-block my-1" />

                  <!-- Term: Returning Visitors -->
                  <div class="stat-segment">
                    <div class="text-caption text-grey-lighten-1">Returning Visitors (in period)</div>
                    <div class="text-h6 font-weight-bold text-amber mt-0-5">
                      {{ analyticsData?.summary?.returningVisitors || 0 }}
                    </div>
                  </div>
                </div>

                <!-- Terminology Guide Badge -->
                <div class="terminology-hint text-caption text-grey-lighten-2 d-flex align-center ga-2 pa-2 rounded">
                  <v-icon icon="mdi-information-outline" size="16" color="#38bdf8" />
                  <span>
                    <strong>Visitors</strong> = Unique individuals counted once per day.
                    <strong>Visits</strong> = Total sessions (refreshes deduplicated).
                  </span>
                </div>
              </div>
            </v-card>

            <!-- ========================================================= -->
            <!-- 3. VISITOR TREND CHART SECTION                            -->
            <!-- ========================================================= -->
            <v-card class="pa-4 pa-md-6 mb-6 chart-section-card">
              <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
                <div>
                  <h3 class="text-h6 font-weight-bold text-white mb-0 d-flex align-center ga-2">
                    <v-icon icon="mdi-chart-areaspline" color="#00c2ff" size="24" />
                    <span>Visitor Trend</span>
                  </h3>
                  <div class="text-caption text-grey-lighten-1 mt-0-5">
                    Daily trajectory for {{ analyticsRange === '7d' ? 'last 7 days' : analyticsRange === '90d' ? 'last 90 days' : 'last 30 days' }}
                  </div>
                </div>

                <div class="d-flex align-center ga-2 text-caption text-grey-lighten-2">
                  <v-chip size="small" variant="outlined" color="#00c2ff">
                    {{ analyticsRange === '7d' ? '7 Days' : analyticsRange === '90d' ? '90 Days' : '30 Days' }} View
                  </v-chip>
                </div>
              </div>

              <!-- Interactive Trend Chart -->
              <VisitorTrendChart
                :data="analyticsData?.dailyHistory || []"
                :range="analyticsRange"
                :activation-date="analyticsData?.activationDate"
              />

              <!-- Pre-Activation Note -->
              <div class="text-caption text-grey-lighten-2 mt-4 text-center">
                <v-icon icon="mdi-shield-lock-outline" size="14" color="#00c2ff" class="mr-1" />
                <span>
                  Telemetry is recorded automatically from production interactions. No fake or static counts are displayed.
                </span>
              </div>
            </v-card>

            <!-- ========================================================= -->
            <!-- 4. TOP PAGES & AUDIENCE BREAKDOWN                         -->
            <!-- ========================================================= -->
            <v-row class="mb-6 gy-4">
              <!-- Top Pages Visited -->
              <v-col cols="12" md="6">
                <v-card class="pa-4 pa-md-5 h-100 breakdown-card">
                  <div class="d-flex align-center justify-space-between mb-4">
                    <h3 class="text-subtitle-1 font-weight-bold text-white mb-0 d-flex align-center ga-2">
                      <v-icon icon="mdi-file-document-outline" color="#38bdf8" size="20" />
                      <span>Top Public Pages Visited</span>
                    </h3>
                    <v-chip size="x-small" color="#38bdf8" variant="tonal" class="font-weight-bold">
                      {{ analyticsData?.topPages?.length || 0 }} pages tracked
                    </v-chip>
                  </div>

                  <div v-if="!analyticsData?.topPages || analyticsData.topPages.length === 0" class="text-center py-8 text-grey-lighten-2 text-caption">
                    <v-icon icon="mdi-web" size="32" class="mb-2 text-grey-darken-1" />
                    <div>No page view interactions recorded yet in this period.</div>
                  </div>

                  <div v-else class="top-pages-list d-flex flex-column ga-2-5">
                    <div
                      v-for="(page, idx) in analyticsData.topPages"
                      :key="page.path"
                      class="page-item pa-2-5 rounded-lg"
                    >
                      <div class="d-flex align-center justify-space-between mb-1">
                        <div class="d-flex align-center ga-2 text-truncate mr-2">
                          <span class="page-rank text-caption font-weight-bold text-cyan">#{{ idx + 1 }}</span>
                          <span class="text-body-2 font-weight-medium text-white text-truncate">{{ page.path }}</span>
                        </div>
                        <span class="text-caption font-weight-bold text-sky whitespace-nowrap">
                          {{ page.views }} {{ page.views === 1 ? 'view' : 'views' }}
                        </span>
                      </div>
                      <v-progress-linear
                        :model-value="analyticsData.topPages[0]?.views ? (page.views / analyticsData.topPages[0].views) * 100 : 0"
                        color="#00c2ff"
                        bg-color="rgba(0, 54, 111, 0.4)"
                        height="4"
                        rounded
                      />
                    </div>
                  </div>
                </v-card>
              </v-col>

              <!-- Device & Browser Distribution -->
              <v-col cols="12" md="6">
                <v-card class="pa-4 pa-md-5 h-100 breakdown-card">
                  <!-- Devices Breakdown -->
                  <div class="mb-5">
                    <div class="d-flex align-center justify-space-between mb-3">
                      <h3 class="text-subtitle-1 font-weight-bold text-white mb-0 d-flex align-center ga-2">
                        <v-icon icon="mdi-devices" color="#00c2ff" size="20" />
                        <span>Device Distribution</span>
                      </h3>
                      <span class="text-caption text-grey-lighten-1">Sessions</span>
                    </div>

                    <div class="d-flex align-center justify-space-around flex-wrap ga-3 text-center pa-3 rounded-lg bg-slate-900-subtle">
                      <div class="device-stat">
                        <v-icon icon="mdi-laptop" color="#00c2ff" size="24" />
                        <div class="text-caption text-grey-lighten-1 mt-1">Desktop</div>
                        <div class="text-subtitle-2 font-weight-bold text-white">
                          {{ analyticsData?.devices?.desktop || 0 }}
                        </div>
                      </div>

                      <v-divider vertical class="my-1" />

                      <div class="device-stat">
                        <v-icon icon="mdi-cellphone" color="#38bdf8" size="24" />
                        <div class="text-caption text-grey-lighten-1 mt-1">Mobile</div>
                        <div class="text-subtitle-2 font-weight-bold text-white">
                          {{ analyticsData?.devices?.mobile || 0 }}
                        </div>
                      </div>

                      <v-divider vertical class="my-1" />

                      <div class="device-stat">
                        <v-icon icon="mdi-tablet" color="#a78bfa" size="24" />
                        <div class="text-caption text-grey-lighten-1 mt-1">Tablet</div>
                        <div class="text-subtitle-2 font-weight-bold text-white">
                          {{ analyticsData?.devices?.tablet || 0 }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Browser Breakdown -->
                  <div>
                    <div class="d-flex align-center justify-space-between mb-3">
                      <h3 class="text-subtitle-1 font-weight-bold text-white mb-0 d-flex align-center ga-2">
                        <v-icon icon="mdi-web" color="#38bdf8" size="20" />
                        <span>Browser Families</span>
                      </h3>
                      <span class="text-caption text-grey-lighten-1">Sessions</span>
                    </div>

                    <div class="d-flex align-center justify-space-around flex-wrap ga-2 text-center pa-3 rounded-lg bg-slate-900-subtle">
                      <div class="browser-stat">
                        <v-icon icon="mdi-google-chrome" color="#38bdf8" size="20" />
                        <div class="text-caption text-grey-lighten-1">Chrome</div>
                        <div class="text-caption font-weight-bold text-white">
                          {{ analyticsData?.browsers?.chrome || 0 }}
                        </div>
                      </div>

                      <div class="browser-stat">
                        <v-icon icon="mdi-apple-safari" color="#00c2ff" size="20" />
                        <div class="text-caption text-grey-lighten-1">Safari</div>
                        <div class="text-caption font-weight-bold text-white">
                          {{ analyticsData?.browsers?.safari || 0 }}
                        </div>
                      </div>

                      <div class="browser-stat">
                        <v-icon icon="mdi-firefox" color="#f97316" size="20" />
                        <div class="text-caption text-grey-lighten-1">Firefox</div>
                        <div class="text-caption font-weight-bold text-white">
                          {{ analyticsData?.browsers?.firefox || 0 }}
                        </div>
                      </div>

                      <div class="browser-stat">
                        <v-icon icon="mdi-microsoft-edge" color="#0284c7" size="20" />
                        <div class="text-caption text-grey-lighten-1">Edge</div>
                        <div class="text-caption font-weight-bold text-white">
                          {{ analyticsData?.browsers?.edge || 0 }}
                        </div>
                      </div>

                      <div class="browser-stat">
                        <v-icon icon="mdi-dots-horizontal-circle-outline" color="#94a3b8" size="20" />
                        <div class="text-caption text-grey-lighten-1">Other</div>
                        <div class="text-caption font-weight-bold text-white">
                          {{ analyticsData?.browsers?.other || 0 }}
                        </div>
                      </div>
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <!-- ========================================================= -->
            <!-- 5. ENTERPRISE PRIVACY & ARCHITECTURE SEAL                 -->
            <!-- ========================================================= -->
            <v-card class="pa-4 pa-md-5 privacy-seal-card">
              <div class="d-flex align-center flex-wrap ga-3">
                <div class="privacy-seal-icon bg-navy pa-3 rounded-circle">
                  <v-icon icon="mdi-shield-lock" color="#00c2ff" size="28" />
                </div>
                <div class="flex-grow-1">
                  <h4 class="text-subtitle-1 font-weight-bold text-white mb-1">
                    First-Party Privacy & Security Architecture
                  </h4>
                  <div class="text-caption text-grey-lighten-1">
                    Visitor counts are collected directly through Next Challenge's Express & MongoDB backend.
                    No personal data, contact message contents, or IP addresses are persisted in analytics documents.
                    Anonymous HMAC hashes auto-expire from MongoDB after 7 to 60 days via TTL indexes, ensuring high scalability and full compliance.
                  </div>
                </div>
              </div>
            </v-card>
          </template>
        </template>
      </v-container>
    </div>

    <!-- ========================================== -->
    <!-- SUBMISSION DETAILS MODAL DIALOG            -->
    <!-- ========================================== -->
    <v-dialog v-model="isDetailOpen" max-width="680" scrollable>
      <v-card v-if="selectedContact" color="#0e1626" class="detail-dialog-card elevation-24">
        <div class="detail-dialog-header pa-6 d-flex align-center justify-space-between border-b">
          <div class="d-flex align-center ga-3">
            <v-avatar color="#00366F" size="44" class="text-white font-weight-bold">
              {{ (selectedContact.name || 'NC').slice(0, 2).toUpperCase() }}
            </v-avatar>
            <div>
              <h3 class="text-h6 font-weight-bold text-white mb-0">{{ selectedContact.name }}</h3>
              <div class="text-caption text-cyan-lighten-3">
                Submitted on {{ formatDateFull(selectedContact.date) }}
              </div>
            </div>
          </div>

          <v-btn icon="mdi-close" variant="text" size="small" color="grey-lighten-1" @click="isDetailOpen = false" />
        </div>

        <v-card-text class="pa-6">
          <!-- Metadata Grid -->
          <div class="metadata-grid pa-4 rounded mb-6">
            <v-row class="gy-3">
              <v-col cols="12" sm="6">
                <div class="text-caption text-grey-lighten-1">Email Address</div>
                <div class="font-weight-medium text-white d-flex align-center ga-1 mt-1">
                  <a :href="`mailto:${selectedContact.email}`" class="sub-link">{{ selectedContact.email }}</a>
                </div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="text-caption text-grey-lighten-1">Phone Number</div>
                <div class="font-weight-medium text-white d-flex align-center ga-1 mt-1">
                  <a v-if="selectedContact.phone" :href="`tel:${selectedContact.phone}`" class="sub-link">
                    {{ selectedContact.phone }}
                  </a>
                  <span v-else class="text-grey-darken-1">Not provided</span>
                </div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="text-caption text-grey-lighten-1">Company / Organization</div>
                <div class="font-weight-medium text-white mt-1">
                  {{ selectedContact.company || 'Not provided' }}
                </div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="text-caption text-grey-lighten-1">Client IP / Origin</div>
                <div class="font-weight-medium text-grey-lighten-2 mt-1 font-family-mono text-caption">
                  {{ selectedContact.ip || 'Local / Direct' }}
                </div>
              </v-col>

              <v-col cols="12">
                <div class="text-caption text-grey-lighten-1">Subject</div>
                <div class="font-weight-bold text-white mt-1">
                  {{ selectedContact.subject || 'General Inquiry' }}
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- Message Body -->
          <div class="message-container pa-5 rounded border">
            <div class="text-caption text-cyan-lighten-3 font-weight-bold text-uppercase tracking-wider mb-2">
              Inquiry Message Content
            </div>
            <p class="text-body-1 text-slate-100 whitespace-pre-wrap line-height-relaxed mb-0">
              {{ selectedContact.message }}
            </p>
          </div>
        </v-card-text>

        <v-card-actions class="pa-6 border-t d-flex align-center justify-space-between flex-wrap ga-3">
          <div class="d-flex align-center ga-2">
            <v-btn
              :prepend-icon="selectedContact.readStatus ? 'mdi-email-mark-as-unread' : 'mdi-email-open-outline'"
              variant="tonal"
              :color="selectedContact.readStatus ? 'grey-lighten-1' : '#00c2ff'"
              size="small"
              class="text-capitalize"
              @click="toggleReadStatus(selectedContact)"
            >
              {{ selectedContact.readStatus ? 'Mark as Unread' : 'Mark as Read' }}
            </v-btn>

            <v-btn
              prepend-icon="mdi-delete-outline"
              variant="tonal"
              color="error"
              size="small"
              class="text-capitalize"
              @click="confirmDelete(selectedContact)"
            >
              Delete
            </v-btn>
          </div>

          <v-btn
            prepend-icon="mdi-reply"
            variant="flat"
            color="#00366F"
            class="text-white text-capitalize font-weight-bold"
            :href="`mailto:${selectedContact.email}?subject=Re: [Next Challenge] ${encodeURIComponent(selectedContact.subject || 'Inquiry')}`"
            target="_blank"
          >
            Reply to {{ selectedContact.name }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ========================================== -->
    <!-- DELETE CONFIRMATION MODAL                  -->
    <!-- ========================================== -->
    <v-dialog v-model="isDeleteOpen" max-width="440">
      <v-card color="#0e1626" class="delete-dialog-card elevation-24 pa-6">
        <div class="d-flex align-center ga-3 mb-4">
          <v-avatar color="red-darken-4" size="44">
            <v-icon icon="mdi-alert-octagon-outline" color="red-lighten-2" size="28" />
          </v-avatar>
          <div>
            <h3 class="text-h6 font-weight-bold text-white mb-0">Delete Submission?</h3>
            <div class="text-caption text-grey-lighten-1">This action cannot be undone.</div>
          </div>
        </div>

        <p class="text-body-2 text-slate-300 mb-6">
          Are you sure you want to permanently remove the submission from
          <strong class="text-white">{{ contactToDelete?.name }}</strong> ({{ contactToDelete?.email }})?
        </p>

        <div class="d-flex align-center justify-end ga-3">
          <v-btn variant="text" color="grey-lighten-1" @click="isDeleteOpen = false">
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            :loading="isDeleting"
            class="font-weight-bold text-capitalize"
            @click="executeDelete"
          >
            Delete Submission
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- ========================================== -->
    <!-- COURSE CREATE / EDIT MODAL DIALOG          -->
    <!-- ========================================== -->
    <v-dialog v-model="isCourseDialogOpen" max-width="780" scrollable>
      <v-card color="#0e1626" class="detail-dialog-card elevation-24">
        <div class="detail-dialog-header pa-6 d-flex align-center justify-space-between border-b">
          <div class="d-flex align-center ga-3">
            <v-avatar color="#00366F" size="44" class="text-white">
              <v-icon :icon="courseForm.icon || 'mdi-school-outline'" color="#00c2ff" size="26" />
            </v-avatar>
            <div>
              <h3 class="text-h6 font-weight-bold text-white mb-0">
                {{ isEditingCourse ? 'Edit Training Program' : 'Create Training Program' }}
              </h3>
              <div class="text-caption text-cyan-lighten-3">
                Configure curriculum, technology stack & module syllabus
              </div>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" color="grey-lighten-1" @click="isCourseDialogOpen = false" />
        </div>

        <v-card-text class="pa-6">
          <v-row class="gy-4">
            <v-col cols="12" sm="8">
              <div class="text-caption font-weight-bold text-slate-300 mb-1">Course Title *</div>
              <v-text-field
                v-model="courseForm.title"
                placeholder="e.g. Full Stack Web Engineering"
                variant="outlined"
                color="#0056b3"
                bg-color="#0B0F19"
                density="comfortable"
                hide-details
              />
            </v-col>

            <v-col cols="12" sm="4">
              <div class="text-caption font-weight-bold text-slate-300 mb-1">Badge / Category</div>
              <v-text-field
                v-model="courseForm.badge"
                placeholder="e.g. Career Track"
                variant="outlined"
                color="#0056b3"
                bg-color="#0B0F19"
                density="comfortable"
                hide-details
              />
            </v-col>

            <v-col cols="12" sm="4">
              <div class="text-caption font-weight-bold text-slate-300 mb-1">Duration</div>
              <v-text-field
                v-model="courseForm.duration"
                placeholder="e.g. 12 Weeks"
                variant="outlined"
                color="#0056b3"
                bg-color="#0B0F19"
                density="comfortable"
                hide-details
              />
            </v-col>

            <v-col cols="12" sm="4">
              <div class="text-caption font-weight-bold text-slate-300 mb-1">Difficulty Level</div>
              <v-text-field
                v-model="courseForm.level"
                placeholder="e.g. All Levels"
                variant="outlined"
                color="#0056b3"
                bg-color="#0B0F19"
                density="comfortable"
                hide-details
              />
            </v-col>

            <v-col cols="12" sm="4">
              <div class="text-caption font-weight-bold text-slate-300 mb-1">MDI Icon</div>
              <v-text-field
                v-model="courseForm.icon"
                placeholder="e.g. mdi-code-braces"
                variant="outlined"
                color="#0056b3"
                bg-color="#0B0F19"
                density="comfortable"
                prepend-inner-icon="mdi-emoticon-outline"
                hide-details
              />
            </v-col>

            <v-col cols="12">
              <div class="text-caption font-weight-bold text-slate-300 mb-1">Technologies / Tags (comma separated)</div>
              <v-text-field
                v-model="courseForm.technologiesInput"
                placeholder="e.g. Vue.js 3, Node.js, Express, MongoDB Atlas, REST APIs"
                variant="outlined"
                color="#0056b3"
                bg-color="#0B0F19"
                density="comfortable"
                prepend-inner-icon="mdi-tag-multiple-outline"
                hide-details
              />
            </v-col>

            <v-col cols="12">
              <div class="text-caption font-weight-bold text-slate-300 mb-1">Description *</div>
              <v-textarea
                v-model="courseForm.description"
                rows="3"
                placeholder="Brief summary of what this course delivers..."
                variant="outlined"
                color="#0056b3"
                bg-color="#0B0F19"
                density="comfortable"
                hide-details
              />
            </v-col>

            <!-- Syllabus Modules Builder -->
            <v-col cols="12">
              <div class="d-flex align-center justify-space-between mb-3 pt-2">
                <span class="text-caption font-weight-bold text-cyan-lighten-3 text-uppercase tracking-wider">
                  Syllabus Levels / Modules
                </span>
                <v-btn
                  size="x-small"
                  variant="tonal"
                  color="#00c2ff"
                  prepend-icon="mdi-plus"
                  @click="addSyllabusLevel"
                >
                  Add Module Level
                </v-btn>
              </div>

              <div class="d-flex flex-column ga-3">
                <v-card
                  v-for="(mod, mIdx) in courseForm.syllabus"
                  :key="mIdx"
                  color="#0B0F19"
                  class="pa-3 border rounded-lg"
                >
                  <div class="d-flex align-center justify-space-between mb-2">
                    <div class="d-flex align-center ga-2 flex-grow-1 mr-3">
                      <v-text-field
                        v-model="mod.level"
                        placeholder="Level 1"
                        variant="outlined"
                        density="compact"
                        hide-details
                        style="max-width: 120px;"
                      />
                      <v-text-field
                        v-model="mod.title"
                        placeholder="Module / Level Title"
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="flex-grow-1"
                      />
                    </div>
                    <v-btn
                      v-if="courseForm.syllabus.length > 1"
                      icon="mdi-trash-can-outline"
                      size="x-small"
                      variant="text"
                      color="error"
                      @click="removeSyllabusLevel(mIdx)"
                    />
                  </div>
                  <v-text-field
                    v-model="mod.topicsInput"
                    placeholder="Topics covered (comma separated): HTML5, CSS3, DOM manipulation..."
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                </v-card>
              </div>
            </v-col>

            <v-col cols="12" sm="6">
              <v-switch
                v-model="courseForm.isActive"
                label="Course is Active & Publicly Visible"
                color="#00c2ff"
                hide-details
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="courseForm.order"
                type="number"
                label="Display Order"
                variant="outlined"
                density="compact"
                hide-details
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-6 border-t d-flex align-center justify-end ga-3">
          <v-btn variant="text" color="grey-lighten-1" @click="isCourseDialogOpen = false">
            Cancel
          </v-btn>
          <v-btn
            color="#00366F"
            variant="flat"
            class="text-white font-weight-bold px-6"
            :loading="isSavingCourse"
            @click="saveCourse"
          >
            {{ isEditingCourse ? 'Update Program' : 'Create Program' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ========================================== -->
    <!-- COURSE DELETE CONFIRMATION MODAL           -->
    <!-- ========================================== -->
    <v-dialog v-model="isCourseDeleteOpen" max-width="440">
      <v-card color="#0e1626" class="delete-dialog-card elevation-24 pa-6">
        <div class="d-flex align-center ga-3 mb-4">
          <v-avatar color="red-darken-4" size="44">
            <v-icon icon="mdi-alert-octagon-outline" color="red-lighten-2" size="28" />
          </v-avatar>
          <div>
            <h3 class="text-h6 font-weight-bold text-white mb-0">Delete Course Program?</h3>
            <div class="text-caption text-grey-lighten-1">This action cannot be undone.</div>
          </div>
        </div>

        <p class="text-body-2 text-slate-300 mb-6">
          Are you sure you want to permanently delete the program
          <strong class="text-white">{{ courseToDelete?.title }}</strong>?
        </p>

        <div class="d-flex align-center justify-end ga-3">
          <v-btn variant="text" color="grey-lighten-1" @click="isCourseDeleteOpen = false">
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            :loading="isDeletingCourse"
            class="font-weight-bold text-capitalize"
            @click="executeDeleteCourse"
          >
            Delete Course
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- ========================================== -->
    <!-- ENROLLMENT APPLICATION DETAILS MODAL       -->
    <!-- ========================================== -->
    <v-dialog v-model="isEnrollmentDetailOpen" max-width="680" scrollable>
      <v-card v-if="selectedEnrollment" color="#0e1626" class="detail-dialog-card elevation-24">
        <div class="detail-dialog-header pa-6 d-flex align-center justify-space-between border-b">
          <div class="d-flex align-center ga-3">
            <v-avatar color="#00366F" size="44" class="text-white font-weight-bold">
              {{ (selectedEnrollment.name || 'ST').slice(0, 2).toUpperCase() }}
            </v-avatar>
            <div>
              <div class="d-flex align-center ga-2">
                <h3 class="text-h6 font-weight-bold text-white mb-0">{{ selectedEnrollment.name }}</h3>
                <v-chip
                  size="x-small"
                  :color="
                    selectedEnrollment.status === 'approved'
                      ? 'success'
                      : selectedEnrollment.status === 'pending'
                      ? 'amber'
                      : 'grey'
                  "
                  variant="flat"
                  class="font-weight-bold"
                >
                  {{ (selectedEnrollment.status || 'pending').toUpperCase() }}
                </v-chip>
              </div>
              <div class="text-caption text-cyan-lighten-3">
                Applied on {{ formatDateFull(selectedEnrollment.date) }}
              </div>
            </div>
          </div>

          <v-btn icon="mdi-close" variant="text" size="small" color="grey-lighten-1" @click="isEnrollmentDetailOpen = false" />
        </div>

        <v-card-text class="pa-6">
          <!-- Metadata Grid -->
          <div class="metadata-grid pa-4 rounded mb-6">
            <v-row class="gy-3">
              <v-col cols="12" sm="6">
                <div class="text-caption text-grey-lighten-1">Student Contact Email</div>
                <div class="font-weight-medium text-white d-flex align-center ga-1 mt-1">
                  <a :href="`mailto:${selectedEnrollment.email}`" class="sub-link">{{ selectedEnrollment.email }}</a>
                </div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="text-caption text-grey-lighten-1">Phone Number</div>
                <div class="font-weight-medium text-white d-flex align-center ga-1 mt-1">
                  <a :href="`tel:${selectedEnrollment.phone}`" class="sub-link">{{ selectedEnrollment.phone }}</a>
                </div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="text-caption text-grey-lighten-1">Training Program</div>
                <div class="font-weight-medium text-cyan-lighten-2 mt-1 d-flex align-center ga-1">
                  <v-icon :icon="selectedEnrollment.selectedCourseId?.icon || 'mdi-school-outline'" size="16" />
                  <span>{{ selectedEnrollment.selectedCourseId?.title || selectedEnrollment.courseTitle }}</span>
                </div>
              </v-col>

              <v-col cols="12" sm="6">
                <div class="text-caption text-grey-lighten-1">Program Duration / Level</div>
                <div class="font-weight-medium text-white mt-1">
                  {{ selectedEnrollment.selectedCourseId?.duration || '12 Weeks' }} —
                  {{ selectedEnrollment.selectedCourseId?.level || 'All Levels' }}
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- Student Message / Statement -->
          <div class="mb-6">
            <div class="text-caption font-weight-bold text-slate-300 mb-2 text-uppercase tracking-wider">
              Student Statement / Background Notes
            </div>
            <div class="message-container pa-4 rounded">
              <p class="text-body-2 text-slate-200 mb-0 whitespace-pre-wrap">
                {{ selectedEnrollment.message || 'No additional statement provided with application.' }}
              </p>
            </div>
          </div>

          <!-- Staff Admission Review Notes -->
          <div class="mb-2">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-caption font-weight-bold text-cyan-lighten-3 text-uppercase tracking-wider">
                Staff / Admission Review Notes
              </span>
              <v-btn
                size="x-small"
                variant="tonal"
                color="#00c2ff"
                :loading="isSavingEnrollmentNotes"
                @click="saveEnrollmentAdminNotes"
              >
                Save Notes
              </v-btn>
            </div>
            <v-textarea
              v-model="enrollmentAdminNotesInput"
              rows="3"
              placeholder="Add internal evaluation, interview status, phone screening outcome..."
              variant="outlined"
              color="#0056b3"
              bg-color="#0B0F19"
              density="comfortable"
              hide-details
            />
          </div>
        </v-card-text>

        <v-card-actions class="pa-6 border-t d-flex align-center justify-space-between flex-wrap ga-3">
          <div class="d-flex align-center ga-2">
            <v-btn
              v-if="selectedEnrollment.status !== 'approved'"
              prepend-icon="mdi-check-circle-outline"
              variant="tonal"
              color="success"
              size="small"
              class="text-capitalize"
              @click="updateEnrollmentStatus(selectedEnrollment, 'approved')"
            >
              Approve Student
            </v-btn>

            <v-btn
              v-if="selectedEnrollment.status !== 'rejected'"
              prepend-icon="mdi-close-circle-outline"
              variant="tonal"
              color="error"
              size="small"
              class="text-capitalize"
              @click="updateEnrollmentStatus(selectedEnrollment, 'rejected')"
            >
              Reject / Close
            </v-btn>

            <v-btn
              v-if="selectedEnrollment.status !== 'pending'"
              prepend-icon="mdi-clock-outline"
              variant="tonal"
              color="amber"
              size="small"
              class="text-capitalize"
              @click="updateEnrollmentStatus(selectedEnrollment, 'pending')"
            >
              Set to Pending
            </v-btn>

            <v-btn
              prepend-icon="mdi-delete-outline"
              variant="tonal"
              color="error"
              size="small"
              class="text-capitalize"
              @click="confirmDeleteEnrollment(selectedEnrollment)"
            >
              Delete
            </v-btn>
          </div>

          <div class="d-flex align-center ga-2">
            <v-btn
              prepend-icon="mdi-phone"
              variant="outlined"
              color="#00c2ff"
              size="small"
              class="text-capitalize font-weight-bold"
              :href="`tel:${selectedEnrollment.phone}`"
            >
              Call Candidate
            </v-btn>

            <v-btn
              prepend-icon="mdi-email-outline"
              variant="flat"
              color="#00366F"
              class="text-white text-capitalize font-weight-bold"
              :href="`mailto:${selectedEnrollment.email}?subject=Next Challenge Training Enrollment: ${encodeURIComponent(selectedEnrollment.selectedCourseId?.title || selectedEnrollment.courseTitle)}`"
              target="_blank"
            >
              Email {{ selectedEnrollment.name }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ========================================== -->
    <!-- ENROLLMENT DELETE CONFIRMATION MODAL        -->
    <!-- ========================================== -->
    <v-dialog v-model="isEnrollmentDeleteOpen" max-width="440">
      <v-card color="#0e1626" class="delete-dialog-card elevation-24 pa-6">
        <div class="d-flex align-center ga-3 mb-4">
          <v-avatar color="red-darken-4" size="44">
            <v-icon icon="mdi-alert-octagon-outline" color="red-lighten-2" size="28" />
          </v-avatar>
          <div>
            <h3 class="text-h6 font-weight-bold text-white mb-0">Delete Enrollment?</h3>
            <div class="text-caption text-grey-lighten-1">This action cannot be undone.</div>
          </div>
        </div>

        <p class="text-body-2 text-slate-300 mb-6">
          Are you sure you want to permanently remove the application for
          <strong class="text-white">{{ enrollmentToDelete?.name }}</strong>
          for <strong class="text-cyan-lighten-3">{{ enrollmentToDelete?.courseTitle }}</strong>?
        </p>

        <div class="d-flex align-center justify-end ga-3">
          <v-btn variant="text" color="grey-lighten-1" @click="isEnrollmentDeleteOpen = false">
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            :loading="isDeletingEnrollment"
            class="font-weight-bold text-capitalize"
            @click="executeDeleteEnrollment"
          >
            Delete Application
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- ========================================== -->
    <!-- TOAST NOTIFICATION                         -->
    <!-- ========================================== -->
    <v-snackbar
      v-model="isToastOpen"
      :color="toastColor"
      timeout="4000"
      location="bottom right"
      class="admin-toast elevation-12"
    >
      <div class="d-flex align-center ga-2 font-weight-medium text-white">
        <v-icon icon="mdi-information-outline" color="#00c2ff" size="20" />
        <span>{{ toastMessage }}</span>
      </div>
    </v-snackbar>
  </div>
</template>

<style scoped>
/* ===================================================
   Next Challenge Admin Panel Theme
   Palette: Dark Navy Blue (#00366F) & Tech Slate (#0B0F19)
=================================================== */

.nc-admin-dashboard {
  min-height: 100vh;
  background-color: #0B0F19; /* Tech Slate */
  color: #f1f5f9;
  font-family: var(--nc-font-sans, system-ui, -apple-system, sans-serif);
}

/* Authentication Screen */
.auth-container {
  min-height: 85vh;
}

.auth-card {
  background: #0e1626 !important;
  border: 1px solid rgba(0, 54, 111, 0.45) !important;
  border-radius: 16px !important;
  overflow: hidden;
}

.auth-card-header {
  background: linear-gradient(135deg, #00366F 0%, #061b36 100%);
  border-bottom: 1px solid rgba(0, 86, 179, 0.3);
}

.auth-btn {
  background: linear-gradient(135deg, #00366F 0%, #0056b3 100%) !important;
  box-shadow: 0 4px 16px rgba(0, 54, 111, 0.4) !important;
}

/* Admin Top Bar */
.admin-topbar {
  background: #080c14;
  border-bottom: 1px solid rgba(0, 54, 111, 0.35);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(12px);
}

.polling-chip {
  background: rgba(0, 54, 111, 0.25) !important;
  border: 1px solid rgba(0, 86, 179, 0.3) !important;
  cursor: pointer;
}

.pulse-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #64748b;
  margin-right: 8px;
  transition: all 0.3s ease;
}

.pulse-indicator.active {
  background-color: #10b981;
  box-shadow: 0 0 8px #10b981;
  animation: pulse-ring 2s infinite ease-in-out;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.glowing-bell {
  animation: bell-bounce 2.5s infinite;
}

@keyframes bell-bounce {
  0%, 100% { transform: rotate(0); }
  10%, 30% { transform: rotate(14deg); }
  20%, 40% { transform: rotate(-14deg); }
  50% { transform: rotate(0); }
}

/* KPI Cards */
.kpi-card {
  background: #0e1626 !important;
  border: 1px solid rgba(0, 54, 111, 0.3) !important;
  border-radius: 12px !important;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  border-color: #0056b3 !important;
}

.kpi-card--unread.has-unread {
  border-color: rgba(0, 194, 255, 0.5) !important;
  background: linear-gradient(135deg, #0e1626 0%, #001f3f 100%) !important;
  box-shadow: 0 0 20px rgba(0, 194, 255, 0.15) !important;
}

.kpi-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-navy {
  background: rgba(0, 54, 111, 0.35);
  border: 1px solid rgba(0, 54, 111, 0.5);
}

.bg-cyan {
  background: rgba(0, 194, 255, 0.15);
  border: 1px solid rgba(0, 194, 255, 0.35);
}

.bg-emerald {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
}

.bg-indigo {
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.35);
}

/* Table Workspace Card */
.admin-table-card {
  background: #0e1626 !important;
  border: 1px solid rgba(0, 54, 111, 0.35) !important;
  border-radius: 16px !important;
}

.table-toolbar {
  border-color: rgba(0, 54, 111, 0.25) !important;
}

.filter-tabs .tab-btn {
  border-radius: 8px;
}

.submission-item-card {
  background: #0B0F19 !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  border-radius: 10px !important;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submission-item-card:hover {
  background: #111a2e !important;
  border-color: #0056b3 !important;
  transform: translateX(3px);
}

.submission-item-card--unread {
  border-left: 4px solid #00c2ff !important;
  background: rgba(0, 54, 111, 0.12) !important;
}

.submission-item-card--read {
  opacity: 0.9;
}

.status-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-dot.unread {
  background-color: #00c2ff;
  box-shadow: 0 0 8px #00c2ff;
}

.status-dot.read {
  background-color: #334155;
}

.sub-link {
  color: #38bdf8;
  text-decoration: none;
}

.sub-link:hover {
  text-decoration: underline;
}

.subject-badge {
  background: rgba(0, 54, 111, 0.45);
  color: #7dd3fc;
  border: 1px solid rgba(0, 86, 179, 0.4);
}

.message-snippet {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
}

.font-size-xs {
  font-size: 0.72rem;
}

/* Modal Dialogs */
:global(.detail-dialog-card),
:global(.delete-dialog-card),
.detail-dialog-card,
.delete-dialog-card {
  background: #0e1626 !important;
  border: 1px solid rgba(0, 54, 111, 0.6) !important;
  border-radius: 16px !important;
  color: #f1f5f9 !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 54, 111, 0.3) !important;
}

:global(.detail-dialog-header),
.detail-dialog-header {
  background: linear-gradient(135deg, #00366F 0%, #061b36 100%) !important;
  border-bottom: 1px solid rgba(0, 86, 179, 0.3) !important;
}

:global(.metadata-grid),
.metadata-grid {
  background: #0B0F19 !important;
  border: 1px solid rgba(0, 54, 111, 0.35) !important;
}

:global(.message-container),
.message-container {
  background: #080c14 !important;
  border: 1px solid rgba(0, 54, 111, 0.4) !important;
}

.whitespace-pre-wrap {
  white-space: pre-wrap;
}

.max-width-xl {
  max-width: 1380px;
  margin: 0 auto;
}

:global(.v-snackbar.admin-toast .v-snackbar__wrapper),
:deep(.v-snackbar.admin-toast .v-snackbar__wrapper) {
  background: #00366F !important;
  border: 1px solid #00c2ff !important;
  box-shadow: 0 8px 24px rgba(0, 54, 111, 0.5) !important;
}

/* Courses Admin Tab Styling */
.course-admin-card {
  background: #0B0F19 !important;
  border: 1px solid rgba(0, 54, 111, 0.4) !important;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.course-admin-card:hover {
  background: #101827 !important;
  border-color: rgba(0, 194, 255, 0.5) !important;
  box-shadow: 0 4px 18px rgba(0, 54, 111, 0.25);
}

.course-admin-card--inactive {
  opacity: 0.65;
  border-left: 4px solid #64748b !important;
}

.course-admin-card:not(.course-admin-card--inactive) {
  border-left: 4px solid #00c2ff !important;
}

.course-admin-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(0, 54, 111, 0.6) 0%, rgba(0, 31, 63, 0.9) 100%);
  border: 1px solid rgba(0, 194, 255, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tech-tag-pill {
  background: rgba(0, 54, 111, 0.35);
  color: #7dd3fc;
  border: 1px solid rgba(0, 86, 179, 0.35);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.syllabus-mod-chip {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(0, 194, 255, 0.25);
  color: #bae6fd;
  font-size: 0.72rem;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ga-1-5 {
  gap: 6px;
}

/* Student Enrollments Admin Styling */
.status-dot-pending {
  background-color: #f59e0b;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
}

.status-dot-approved {
  background-color: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
}

.status-dot-rejected {
  background-color: #64748b;
}

.enrollment-item-card--approved {
  border-left: 4px solid #10b981 !important;
}

/* Website Visitors & Analytics Styles */
.analytics-banner-strip {
  background: linear-gradient(135deg, rgba(0, 54, 111, 0.5) 0%, rgba(11, 15, 25, 0.9) 100%) !important;
  border: 1px solid rgba(0, 194, 255, 0.35) !important;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.analytics-banner-strip:hover {
  border-color: rgba(0, 194, 255, 0.7) !important;
  box-shadow: 0 4px 20px rgba(0, 54, 111, 0.4) !important;
}

.cursor-pointer {
  cursor: pointer;
}

.analytics-header-card {
  background: linear-gradient(135deg, rgba(0, 54, 111, 0.45) 0%, #0B0F19 100%) !important;
  border: 1px solid rgba(0, 194, 255, 0.3) !important;
  border-radius: 14px;
}

.activation-notice-strip {
  background: rgba(0, 54, 111, 0.25);
  border: 1px solid rgba(0, 194, 255, 0.2);
}

.analytics-period-toggle {
  background: #0B0F19 !important;
  border-color: rgba(0, 54, 111, 0.6) !important;
}

.kpi-card--analytics {
  background: #0B0F19 !important;
  border: 1px solid rgba(0, 54, 111, 0.45) !important;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.kpi-card--analytics:hover {
  border-color: rgba(0, 194, 255, 0.5) !important;
  box-shadow: 0 4px 18px rgba(0, 54, 111, 0.25);
}

.terminology-card {
  background: rgba(11, 15, 25, 0.8) !important;
  border: 1px solid rgba(0, 54, 111, 0.4) !important;
  border-radius: 12px;
}

.terminology-hint {
  background: rgba(0, 54, 111, 0.3);
  border: 1px solid rgba(56, 189, 248, 0.2);
  max-width: 480px;
}

.stat-segment {
  min-width: 140px;
}

.chart-section-card {
  background: #0B0F19 !important;
  border: 1px solid rgba(0, 54, 111, 0.45) !important;
  border-radius: 14px;
}

.breakdown-card {
  background: #0B0F19 !important;
  border: 1px solid rgba(0, 54, 111, 0.4) !important;
  border-radius: 12px;
}

.bg-slate-900-subtle {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(0, 54, 111, 0.3);
}

.page-item {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(0, 54, 111, 0.25);
  transition: background 0.15s ease;
}

.page-item:hover {
  background: rgba(0, 54, 111, 0.25);
}

.privacy-seal-card {
  background: linear-gradient(135deg, rgba(6, 27, 54, 0.8) 0%, #0B0F19 100%) !important;
  border: 1px solid rgba(0, 194, 255, 0.35) !important;
  border-radius: 14px;
}

.text-cyan {
  color: #00c2ff !important;
}

.text-sky {
  color: #38bdf8 !important;
}

.text-emerald {
  color: #10b981 !important;
}

.text-amber {
  color: #f59e0b !important;
}

.whitespace-nowrap {
  white-space: nowrap;
}

.pa-2-5 {
  padding: 10px !important;
}

.ga-2-5 {
  gap: 10px !important;
}

.mt-0-5 {
  margin-top: 2px !important;
}
</style>

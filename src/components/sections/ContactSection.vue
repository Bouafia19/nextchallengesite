<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { siteConfig } from '@/config/site.js'

const formRef = ref(null)
const isValid = ref(false)
const isLoading = ref(false)
const isSuccess = ref(false)
const errorMessage = ref('')

const formData = reactive({
  fullName: '',
  email: '',
  phone: '',
  company: '',
  subject: '',
  message: ''
})

const subjectOptions = [
  'Custom Web Application Development',
  'Mobile App Development (iOS/Android)',
  'Enterprise ERP & Inventory Platform',
  'AI Solutions & Automation',
  'API Integration & Microservices',
  'Cloud Infrastructure & DevOps',
  'Maintenance & SLA Support',
  'General Consultation / Other'
]

// Validation rules
const rules = {
  required: (v) => !!v?.trim() || 'This field is required',
  email: (v) => {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return pattern.test(v?.trim()) || 'Please enter a valid email address'
  },
  minLength: (min) => (v) =>
    (v && v.trim().length >= min) || `Must be at least ${min} characters`
}

// Listen for subject pre-selection from services or elsewhere
const handleSubjectEvent = (event) => {
  if (event.detail?.subject) {
    const match = subjectOptions.find((opt) =>
      opt.toLowerCase().includes(event.detail.subject.toLowerCase())
    )
    formData.subject = match || event.detail.subject
  }
}

onMounted(() => {
  window.addEventListener('select-contact-subject', handleSubjectEvent)
})

onUnmounted(() => {
  window.removeEventListener('select-contact-subject', handleSubjectEvent)
})

const handleSubmit = async () => {
  errorMessage.value = ''

  // Validate form
  const { valid } = await formRef.value.validate()
  if (!valid) return

  isLoading.value = true

  try {
    const response = await fetch(siteConfig.contactApiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim()
      })
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.message || `Submission failed with status ${response.status}`)
    }

    isSuccess.value = true
    // Reset form fields
    formData.fullName = ''
    formData.email = ''
    formData.phone = ''
    formData.company = ''
    formData.subject = ''
    formData.message = ''
    if (formRef.value) formRef.value.resetValidation()
  } catch (err) {
    errorMessage.value =
      err.message ||
      'An unexpected error occurred while sending your message. Please reach us directly via email or phone.'
  } finally {
    isLoading.value = false
  }
}

const resetSuccess = () => {
  isSuccess.value = false
  errorMessage.value = ''
}
</script>

<template>
  <section id="contact" class="section-pad border-gradient-top tech-bg-mesh">
    <v-container>
      <!-- Section Header -->
      <div class="text-center max-w-700 mx-auto mb-12">
        <span class="badge-pill mb-3">
          <v-icon icon="mdi-email-check-outline" size="16" color="secondary" class="mr-1" />
          Direct Inquiries
        </span>
        <h2 class="text-h3 font-weight-bold mb-4 tracking-tight">
          Let's Build Something Great Together
        </h2>
        <p class="text-h6 font-weight-regular text-medium-emphasis">
          Have an upcoming project or need enterprise consultation? Send us a direct message and our engineering team will respond promptly.
        </p>
      </div>

      <v-row justify="center">
        <v-col cols="12" md="10" lg="8">
          <v-card class="nc-glass-card contact-card pa-8 pa-md-10" rounded="xl">
            <!-- Success State Banner -->
            <v-alert
              v-if="isSuccess"
              type="success"
              variant="tonal"
              density="comfortable"
              rounded="lg"
              class="mb-6 pa-6"
              icon="mdi-check-decagram"
            >
              <div class="text-h6 font-weight-bold mb-2">Message Sent Successfully!</div>
              <p class="text-body-2 mb-4">
                Thank you for reaching out. Your message has been delivered to
                <strong>{{ siteConfig.email }}</strong>. Our team in Sétif will review your project requirements and get back to you shortly.
              </p>
              <v-btn
                color="success"
                variant="outlined"
                size="small"
                class="font-weight-bold"
                prepend-icon="mdi-refresh"
                @click="resetSuccess"
              >
                Send Another Message
              </v-btn>
            </v-alert>

            <!-- Error State Banner -->
            <v-alert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              density="comfortable"
              rounded="lg"
              class="mb-6"
              closable
              icon="mdi-alert-circle-outline"
              @click:close="errorMessage = ''"
            >
              <div class="font-weight-bold text-body-1 mb-1">Message Delivery Error</div>
              <div class="text-body-2 mb-2">{{ errorMessage }}</div>
              <div class="text-caption">
                You can also email us directly at
                <a :href="siteConfig.emailMailto" class="font-weight-bold text-white">{{ siteConfig.email }}</a>
                or call
                <a :href="siteConfig.phoneTel" class="font-weight-bold text-white">{{ siteConfig.phone }}</a>.
              </div>
            </v-alert>

            <!-- Contact Form -->
            <v-form
              v-if="!isSuccess"
              ref="formRef"
              v-model="isValid"
              validate-on="blur"
              @submit.prevent="handleSubmit"
            >
              <v-row class="g-4">
                <!-- Full Name -->
                <v-col cols="12" sm="6">
                  <label class="input-label" for="field-fullname">
                    Full Name <span class="text-error">*</span>
                  </label>
                  <v-text-field
                    id="field-fullname"
                    v-model="formData.fullName"
                    :rules="[rules.required, rules.minLength(2)]"
                    placeholder="e.g. John Doe / Mohamed Amine"
                    prepend-inner-icon="mdi-account-outline"
                    required
                  />
                </v-col>

                <!-- Email -->
                <v-col cols="12" sm="6">
                  <label class="input-label" for="field-email">
                    Email Address <span class="text-error">*</span>
                  </label>
                  <v-text-field
                    id="field-email"
                    v-model="formData.email"
                    :rules="[rules.required, rules.email]"
                    placeholder="name@company.com"
                    prepend-inner-icon="mdi-email-outline"
                    type="email"
                    required
                  />
                </v-col>

                <!-- Phone -->
                <v-col cols="12" sm="6">
                  <label class="input-label" for="field-phone">
                    Phone Number
                  </label>
                  <v-text-field
                    id="field-phone"
                    v-model="formData.phone"
                    placeholder="e.g. 0552 56 96 54 / +213 ..."
                    prepend-inner-icon="mdi-phone-outline"
                    type="tel"
                  />
                </v-col>

                <!-- Company -->
                <v-col cols="12" sm="6">
                  <label class="input-label" for="field-company">
                    Company / Organization
                  </label>
                  <v-text-field
                    id="field-company"
                    v-model="formData.company"
                    placeholder="e.g. Enterprise SARL"
                    prepend-inner-icon="mdi-domain"
                  />
                </v-col>

                <!-- Subject -->
                <v-col cols="12">
                  <label class="input-label" for="field-subject">
                    Subject / Area of Interest <span class="text-error">*</span>
                  </label>
                  <v-combobox
                    id="field-subject"
                    v-model="formData.subject"
                    :items="subjectOptions"
                    :rules="[rules.required]"
                    placeholder="Select or type your subject"
                    prepend-inner-icon="mdi-tag-outline"
                    variant="outlined"
                    density="comfortable"
                    color="primary"
                    required
                  />
                </v-col>

                <!-- Message -->
                <v-col cols="12">
                  <label class="input-label" for="field-message">
                    Project Details &amp; Message <span class="text-error">*</span>
                  </label>
                  <v-textarea
                    id="field-message"
                    v-model="formData.message"
                    :rules="[rules.required, rules.minLength(10)]"
                    placeholder="Tell us about your project, timeline, technical requirements, or business objectives..."
                    rows="4"
                    auto-grow
                    prepend-inner-icon="mdi-message-text-outline"
                    required
                  />
                </v-col>

                <!-- Submit Button -->
                <v-col cols="12" class="pt-2">
                  <v-btn
                    type="submit"
                    color="primary"
                    variant="flat"
                    size="x-large"
                    block
                    :loading="isLoading"
                    :disabled="isLoading"
                    class="btn-shimmer font-weight-bold"
                    prepend-icon="mdi-send-outline"
                  >
                    Send Message
                  </v-btn>
                </v-col>

                <!-- Privacy & Confidentiality Notice -->
                <v-col cols="12" class="text-center">
                  <div class="text-caption text-medium-emphasis">
                    <v-icon icon="mdi-shield-lock-outline" size="14" class="mr-1" />
                    Delivered securely to <strong>{{ siteConfig.email }}</strong>. Your information remains strictly confidential.
                  </div>
                </v-col>
              </v-row>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<style scoped>
.max-w-700 {
  max-width: 740px;
}

.contact-card {
  border-radius: 28px !important;
}

.input-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 6px;
  color: rgba(255, 255, 255, 0.9);
}

.v-theme--nextChallengeLight .input-label {
  color: #1e293b;
}
</style>

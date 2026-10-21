import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify.js'
import i18n from './plugins/i18n.js'
import './assets/css/main.css'

const app = createApp(App)

app.use(i18n)
app.use(vuetify)

app.mount('#app')

import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import VxeTable from 'vxe-table'

import '@vuepic/vue-datepicker/dist/main.css'

import './assets/main.css'
import 'vxe-table/lib/style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VxeTable)

app.mount('#app')

import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router/index.js'
import { pinia } from './store/pinia.js'
import 'bulma/css/bulma.min.css'
import './style.css'

createApp(App)
    .use(pinia)
    .use(router)
    .mount('#app')

import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router/index.js'
import 'bulma/css/bulma.min.css'
import './style.css'

createApp(App)
    .use(router)
    .mount('#app')

import 'element-plus/dist/index.css'
import 'animate.css'
import 'virtual:uno.css'
import 'virtual:svg-icons-register'

import './styles/style.less'
import App from './App.vue'
import router from './router'
import { setupStore } from './store'

const app = createApp(App)

setupStore(app)
app.use(router)
// app.use(ElementPlus)

app.mount('#app')

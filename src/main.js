import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
// import axios from 'axios'
// import config from './config'
import request from './utils/request'
import storage from './utils/storage'
import api from './api'
import store from './store'
// axios
// axios.get(config.mockApi+'/login').then((res) => {
//     console.log(res)
// })
const app = createApp(App)

app.directive('has', {
    beforeMount: (el, binding) => {
        let userAction = storage.getItem("actionList")
        let value = binding.value
        let hasPermission = userAction.includes(value)
        if (!hasPermission) {
            el.style.display = 'none';
            setTimeout(() => {
                el.parentNode.removeChild(el)
            },0)
        }

    }
})
app.config.globalProperties.$request = request
app.config.globalProperties.$storage = storage
app.config.globalProperties.$api = api
app.use(router).use(ElementPlus, { size: 'small'}).use(store).mount('#app')

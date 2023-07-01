import axios from 'axios'

import config from '../config'
import storage from './storage'
  
import { ElMessage } from 'element-plus'
import router from '../router'


const TOKEN_ERROR = 'Token认证失败，请重新登录'
const NETWORK_ERROR = '网络请求异常，请重试以下'

// 创建axios的对象，添加配置
const service = axios.create({
    baseURL: config.baseApi,
    timeout: 8000
})

// 请求的拦截

service.interceptors.request.use((req) => {
    const header = req.headers
    const {token=""} = storage.getItem("userInfo")|| {};
    if (!header.Authorization) header.Authorization = 'Bearer ' + token;
    return req
})

service.interceptors.response.use((res) => {
    // 
    const { code, data, msg } = res.data

    if (code === 200) {
        return data
    } else if (code === 50001) {
        ElMessage.error(TOKEN_ERROR)
        setTimeout(() => {
            router.push('/login')
        }, 1500)
        return Promise.reject(TOKEN_ERROR)
    } else {
        // 后端错误
        ElMessage.error(msg||NETWORK_ERROR)
        return Promise.reject(msg ||NETWORK_ERROR)

    }
})

// request

function request (options) {
   options.method = options.method || 'get'
   if (options.method.toLowerCase() === 'get') {
    // 统一
    options.params = options.data
   } 
   if (typeof options.mock != 'undefined') {
        config.mock = options.mock
   }
   // 生产环境，
   if (config.env === 'prod') {
    service.defaults.baseURL = config.baseApi
   } else {
    service.defaults.baseURL = config.mock ? config.mockApi : config.baseApi
   }

   return service(options)
}
['get','post','put','delete','patch'].forEach((item) => {
    request[item] = (url,data,options) => {
        return request({
            url,
            data,
            method: item,
            ...options
        })
    }

})
export default request
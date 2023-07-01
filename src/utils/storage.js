/***
 * 
 * storage的二次封装
 * ***/

import config from './../config'

export default {
    // 增加属性
    setItem(key,val) {
        let storage = this.getStorage()
        storage[key] = val
        window.localStorage.setItem(config.namespace, JSON.stringify(storage))
    },
    getItem (key) {
        return this.getStorage()[key]
    },
    // 获取命名空间的值
    getStorage() {
        return JSON.parse(window.localStorage.getItem(config.namespace) || "{}")
    },
    clearItem(key) {
        let storage = this.getStorage()
        delete storage[key]
        window.localStorage.setItem(config.namespace,JSON.stringify(storage))
    },
    clearAll () {
        window.localStorage.clear()
    }
}
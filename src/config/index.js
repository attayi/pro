/***
 * 环境配置封装
 * 
 * **/

const env = import.meta.env.MODE || 'prod'

const EnvConfig = {
    // 开发环境
    dev: {
        baseApi:'/api',
        mockApi:'https://www.fastmock.site/mock/c2e9e0581c57c57f3b83e59fb1639f0d/api'
    },
    // 测试环境
    test: {
        baseApi: '//test.future.com/api',
         mockApi:'https://www.fastmock.site/mock/c2e9e0581c57c57f3b83e59fb1639f0d/api'
    },
    // 生产环境,线上环境
    prod: {
        baseApi:'//future.com/api',
        mockApi:'https://www.fastmock.site/mock/c2e9e0581c57c57f3b83e59fb1639f0d/api'
    }
}

export default {
    env,
    // 开启模拟数据
    mock:false,
    ...EnvConfig[env],
    namespace:'manage'
}
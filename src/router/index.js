import {createRouter,createWebHashHistory} from 'vue-router'
import Home from '../components/Home.vue'

const routes = [
    {
        name:'home',
        path:'/',
        meta: {
            title: '首页'
        },
        component: Home,
        redirect:'/welcome',
        children:[
            {
                name:'welcome',
                path:'/welcome',
                meta: {
                    title:'欢迎页'
                },
                component: () => import ('../views/Welcome.vue')
            },
            // {
            //     name: 'system',
            //     path:'/system',
            //     meta: {
            //         title: '系统管理'
            //     },
            //     component: () => import ('../views/Welcome.vue'),

                    {
                        name:'用户管理',
                        path:'/system/user',
                        meta: {
                            title: '用户管理'
                        },
                        component: () => import('./../views/User.vue')
                    },
                    {
                        name:'菜单管理',
                        path:'/system/menu',
                        meta: {
                            title:'菜单管理',
                        },
                        component: () => import('./../views/Menu.vue')
                    },
                    {
                        name:'角色管理',
                        path:'/system/role',
                        meta: {
                            title: '角色管理'
                        },
                        component: () => import('./../views/Role.vue')
                    },
                    {
                        name:'部门管理',
                        path:'/system/dept',
                        meta: {
                            title:'部门管理',
                        },
                        component: () => import('./../views/Dept.vue')
                    },
                    {
                        name:'休假申请',
                        path:'/audit/leave',
                        meta: {
                            title:'休假申请',
                        },
                        component: () => import('./../views/Leave.vue')
                    },
                    {
                        name:'待审批',
                        path:'/audit/approve',
                        meta: {
                            title:'待审批',
                        },
                        component: () => import('./../views/Approve.vue')
                    },
                ]


            // }
           
        

    },
    
    {
        name:'login',
        path:'/login',
        meta: {
            title:'登录页'
        },
        component:() => import ('../views/Login.vue')
    },
    {
        name:'404页面',
        path: '/404',
        meta: {
            title: '404'
        },
        component: () => import ('./../views/404.vue')
    }
]
//

const router = createRouter({
    history:createWebHashHistory(),
    routes
})

// 动态导入

// async function loadAsyncRoutes() {
//     let userInfo = storage.getItem('userInfo') || {}
//     if (userInfo.token) {
//         try {
//             const { menuList } = await AudioParam.permissionList()
//             let routes = util.generanteRoute(menuList)
//             routes.map(route => {
//                 let url = `./../views/${route.component}.vue`
//                 route.component = () => import(url)
//                 router.addRoute('home', route)
//             })
//         } catch (error) {}
//     }
// }
// await loadAsyncRoutes()

function checkPermission(path) {
    let hasPermission = router.getRoutes().filter(route => route.path == path).length
    if (hasPermission) {
        return true
    } else {
        return false
    }
}
// 路由守卫
router.beforeEach((to, from, next) => {
    if (checkPermission(to.path)) {
        document.title = to.meta.title
        next()
    } else {
        next('/404')
    }
})
export default router
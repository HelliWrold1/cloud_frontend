import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/charts/line'),
      meta: { title: '仪表板', icon: 'dashboard' }
    }]
  },

  {
    path: '/data',
    component: Layout,
    redirect: '/data/sensor',
    name: 'Data',
    meta: { title: '数据', icon: 'el-icon-s-data' },
    children: [
      {
        path: 'sensor',
        name: 'Sensor',
        component: () => import('@/views/table/sensor'),
        meta: { title: '传感器', icon: 'el-icon-cloudy-and-sunny' }
      },
      {
        path: 'io',
        name: 'IO',
        component: () => import('@/views/table/io'),
        meta: { title: 'IO', icon: 'el-icon-switch-button' }
      },
      {
        path: 'downlinks',
        name: 'DownLinks',
        component: () => import('@/views/table/downlinks'),
        meta: { title: '下行链路', icon: 'el-icon-download' }
      },
    ]
  },
  
  {
    path: '/rule',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Rule',
        component: () => import('@/views/rules/rules'),
        meta: { title: '规则下发', icon: 'el-icon-s-operation', noCache: true }
      },
    ]
  },

  {
    path: '/time',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Time',
        component: () => import('@/views/intervaltime/time'),
        meta: { title: '上传间隔控制', icon: 'el-icon-time' }
      }
    ]
  },

  // {
  //   path: '/users',
  //   component: Layout,
  //   children: [
  //     {
  //       path: '',
  //       name: 'Users',
  //       component: () => import('@/views/users/users'),
  //       meta: { title: '用户管理', icon: 'el-icon-user' }
  //     }
  //   ]
  // },

  // {
  //   path: 'external-link',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'https://panjiachen.github.io/vue-element-admin-site/#/',
  //       meta: { title: 'External Link', icon: 'link' }
  //     }
  //   ]
  // },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router

import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import Layout from '@/layout'
import Router from 'vue-router'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist

const usersRoute = [{
  path: '/users',
  component: Layout,
  children: [
    {
      path: '',
      name: 'Users',
      component: () => import('@/views/users/users'),
      meta: { title: '用户管理', icon: 'el-icon-user' }
    }
  ]
}]

router.beforeEach(async (to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      addUserManagerRoute()
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done()
    } else {
      const hasGetUserInfo = store.getters.name
      if (hasGetUserInfo) {
        addUserManagerRoute()
        next()
      } else {
        try {
          // get user info
          await store.dispatch('user/getInfo')
          addUserManagerRoute()
          next()
        } catch (error) {
          // remove token and go to login page to re-login
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})


function addUserManagerRoute() {
  const role = store.getters.name
  if (role === 'admin') {
    // 如果用户角色为 admin，则添加用户管理路由
    if (!router.options.routes.some(route => route.path === usersRoute.path)) {
      router.addRoutes(usersRoute)
      global.myRoutes = usersRoute
    }
  } else {
    global.myRoutes = []
  }
}

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})

/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'
import request from '@/utils/request'

const chartsRouter = {
  path: '/charts',
  component: Layout,
  redirect: 'noRedirect',
  name: 'Charts',
  meta: {
    title: 'charts',
    icon: 'chart'
  },
  children: [
    {
      path: 'line',
      component: () => import('@/views/charts/line'),
      name: 'LineChart',
      meta: { title: 'lineChart', noCache: true }
    },
  ]
}

export default chartsRouter

export function getFrames(params) {
  console.log(params)
  return request({
    url: '/frames',
    method: 'post',
    data: params
  })
}
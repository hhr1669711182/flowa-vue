import { createRouter, createWebHashHistory } from 'vue-router'
import {
  Odometer,
  Goods,
  List,
  User,
  TrendCharts,
  Shop,
  Setting
} from '@element-plus/icons-vue'
import { NO_RESET_WHITE_LIST } from '@/constants'
import type { App } from 'vue'

export const routes: Array<any> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: { hidden: true }
  },
  {
    path: '/',
    component: () => import('../components/layout/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/index.vue'),
        meta: {
          title: 'Dashboard',
          // icon: Odometer
          icon: 'svg-icon:rectangles-4'
        }
      },
      {
        path: 'inventory',
        name: 'Inventory',
        redirect: '/inventory/products',
        meta: {
          title: 'Inventory',
          icon: 'svg-icon:box'
        },
        children: [
          {
            path: 'products',
            name: 'AllProducts',
            component: () => import('../views/Inventory/ProductList.vue'),
            meta: { title: 'All Products' }
          },
          {
            path: 'bundles',
            name: 'Bundles',
            component: () => import('../views/Inventory/Bundles.vue'),
            meta: { title: 'Bundles' }
          }
        ]
      },
      // Orders
      {
        path: 'orders',
        name: 'Orders',
        redirect: '/orders/list',
        meta: {
          title: 'Orders',
          icon: 'svg-icon:shopping-cart'
        },
        children: [
          {
            path: 'list',
            name: 'AllOrders',
            component: () => import('../views/order/OrderList.vue'),
            meta: { title: 'All Orders' }
          },
          // {
          //   path: 'to-approve',
          //   name: 'ToApprove',
          //   component: () => import('../views/order/Returns.vue'),
          //   meta: { title: 'To Approve' }
          // },
          {
            path: 'Required',
            name: 'Required',
            component: () => import('../views/order/Required.vue'),
            meta: { title: 'Action Required' }
          },
          {
            path: 'inProgress',
            name: 'inProgress',
            component: () => import('../views/order/inProgress.vue'),
            meta: { title: 'In Progress' }
          },
          {
            path: 'Delivered',
            name: 'Delivered',
            component: () => import('../views/order/Delivered.vue'),
            meta: { title: 'Delivered' }
          },
          {
            path: 'Blocked',
            name: 'Blocked',
            component: () => import('../views/order/Blocked.vue'),
            meta: { title: 'Blocked' }
          },
          {
            path: 'cancelled',
            name: 'Cancelled',
            component: () => import('../views/order/Cancelled.vue'),
            meta: { title: 'Cancelled' }
          }
        ]
      },
      // Billing (was Billing)
      {
        path: 'billing',
        name: 'Billing',
        redirect: '/billing/outbound',
        meta: {
          title: 'Billing',
          icon: 'svg-icon:rectangle-pulse'
        },
        children: [
          {
            path: 'outbound',
            name: 'Outbound',
            component: () => import('../views/Billing/outbound/index.vue'),
            meta: { title: 'Outbound' }
          },
          {
            path: 'Exception',
            name: 'Exception',
            component: () => import('../views/Billing/Exception/index.vue'),
            meta: { title: 'Exception' }
          },
          {
            path: 'inbound',
            name: 'Inbound',
            component: () => import('../views/Billing/Inbound/index.vue'),
            meta: { title: 'Inbound' }
          },
          {
            path: 'services',
            name: 'Services',
            component: () => import('../views/Billing/Services/index.vue'),
            meta: { title: 'Services' }
          },
          {
            path: 'storage',
            name: 'Storage',
            component: () => import('../views/Billing/Storage/index.vue'),
            meta: { title: 'Storage' }
          }
        ]
      },
      {
        path: 'invoices',
        name: 'Invoices',
        component: () => import('../views/Invoices/index.vue'),
        meta: {
          title: 'Invoices',
          icon: 'svg-icon:receipt'
        }
      },
      // Support Hub
      {
        path: 'support',
        name: 'SupportHub',
        component: () => import('../views/Support/index.vue'),
        meta: {
          title: 'Support Hub',
          icon: 'svg-icon:headphones'
        }
      },
      // Settings
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/system/Settings.vue'),
        meta: {
          title: 'Settings',
          icon: 'svg-icon:wrench'
        }
      }
    ]
  },
  {
    path: '/404',
    name: '404Page',
    component: () => import('../views/error/NotFound.vue'),
    meta: { hidden: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    meta: { hidden: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (to.name !== 'Login' && !token) {
    next() // Simplified for demo
  } else {
    next()
  }
})


export const resetRouter = (): void => {
  router.getRoutes().forEach((route) => {
    const { name } = route
    if (name && !NO_RESET_WHITE_LIST.includes(name as string)) {
      router.hasRoute(name) && router.removeRoute(name)
    }
  })
}

export const setupRouter = (app: App<Element>) => {
  app.use(router)
}

export default router

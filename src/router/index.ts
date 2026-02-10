import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { 
  Odometer, 
  Goods, 
  List, 
  User, 
  TrendCharts, 
  Shop, 
  Setting 
} from '@element-plus/icons-vue'

export const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
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
        component: () => import('../views/Dashboard.vue'),
        meta: { 
          title: 'Dashboard', 
          icon: Odometer 
        }
      },
      // Inventory (was Product)
      {
        path: 'inventory',
        name: 'Inventory',
        redirect: '/inventory/products',
        meta: { 
          title: 'Inventory', 
          icon: Goods 
        },
        children: [
          {
            path: 'products',
            name: 'AllProducts',
            component: () => import('../views/product/ProductList.vue'),
            meta: { title: 'All Products' }
          },
          {
            path: 'bundles',
            name: 'Bundles',
            component: () => import('../views/product/Bundles.vue'),
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
          icon: List 
        },
        children: [
          {
            path: 'list',
            name: 'AllOrders',
            component: () => import('../views/order/OrderList.vue'),
            meta: { title: 'All Orders' }
          },
          {
            path: 'to-approve',
            name: 'ToApprove',
            component: () => import('../views/order/Returns.vue'),
            meta: { title: 'To Approve' }
          },
          {
            path: 'needs-attention',
            name: 'NeedsAttention',
            component: () => import('../views/order/Returns.vue'),
            meta: { title: 'Needs Attention' }
          },
          {
            path: 'in-progress',
            name: 'InProgress',
            component: () => import('../views/order/Returns.vue'),
            meta: { title: 'In Progress' }
          },
          {
            path: 'delivered',
            name: 'Delivered',
            component: () => import('../views/order/Returns.vue'),
            meta: { title: 'Delivered' }
          },
          {
            path: 'cancelled',
            name: 'Cancelled',
            component: () => import('../views/order/Returns.vue'),
            meta: { title: 'Cancelled' }
          }
        ]
      },
      // Billing (was Customer)
      {
        path: 'billing',
        name: 'Billing',
        redirect: '/billing/outbound',
        meta: { 
          title: 'Billing', 
          icon: User 
        },
        children: [
          {
            path: 'outbound',
            name: 'Outbound',
            component: () => import('../views/customer/CustomerList.vue'),
            meta: { title: 'Outbound' }
          },
          {
            path: 'inbound',
            name: 'Inbound',
            component: () => import('../views/customer/Segments.vue'),
            meta: { title: 'Inbound' }
          },
          {
            path: 'services',
            name: 'Services',
            component: () => import('../views/customer/Services.vue'),
            meta: { title: 'Services' }
          },
          {
            path: 'storage',
            name: 'Storage',
            component: () => import('../views/customer/Storage.vue'),
            meta: { title: 'Storage' }
          }
        ]
      },
      // Invoices (was Analytics/Sales)
      {
        path: 'invoices',
        name: 'Invoices',
        component: () => import('../views/analytics/Sales.vue'),
        meta: { 
          title: 'Invoices', 
          icon: TrendCharts 
        }
      },
      // Support Hub
      {
        path: 'support',
        name: 'SupportHub',
        component: () => import('../views/Support/index.vue'),
        meta: { 
          title: 'Support Hub', 
          icon: Shop 
        }
      },
      // Settings
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/system/Settings.vue'),
        meta: { 
          title: 'Settings', 
          icon: Setting 
        }
      }
    ]
  },
  // Catch all 404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
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

export default router
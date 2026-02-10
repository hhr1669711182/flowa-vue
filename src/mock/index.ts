import { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'

export default [
  {
    url: '/api/orders',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: 'ok',
        'data|10': [
          {
            'id|+1': 10001,
            date: '@datetime',
            customer: '@name',
            amount: '¥ @integer(100, 5000)',
            'status|1': ['Pending', 'Processing', 'Completed', 'Cancelled']
          }
        ]
      }
    }
  },
  {
    url: '/api/products',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: 'ok',
        'data|20': [
          {
            'id|+1': 1,
            name: '@title(3, 5)',
            price: '¥ @integer(10, 1000)',
            'stock|10-200': 100,
            'category|1': ['Electronics', 'Clothing', 'Home', 'Books']
          }
        ]
      }
    }
  }
] as MockMethod[]

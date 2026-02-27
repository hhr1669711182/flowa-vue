// Mock API for Settings (General & Order Operation Logs)
export interface GeneralSetting {
  id: string
  key: string
  label: string
  description: string
  value: boolean
  category: 'Inventory' | 'Orders'
}

export interface OperationLog {
  id: number
  sku: string
  actionInfo: string
  operationDetails: string
  operator: string
  date: string
}

const mockGeneralSettings: GeneralSetting[] = [
  // Inventory
  {
    id: '1',
    key: 'low_stock_alerts',
    label: 'Low Stock Alerts',
    description: 'Notify me when any SKU is running low on stock.',
    value: true,
    category: 'Inventory'
  },
  {
    id: '2',
    key: 'out_of_stock_alerts',
    label: 'Out-of-Stock Alerts',
    description: 'Notify me when an item becomes out of stock.',
    value: true,
    category: 'Inventory'
  },
  {
    id: '3',
    key: 'reorder_recommendations',
    label: 'Reorder Recommendations',
    description: 'Receive suggested replenishment quantities based on recent order activity.',
    value: true,
    category: 'Inventory'
  },
  // Orders
  {
    id: '4',
    key: 'order_requires_approval',
    label: 'Order Requires Approval',
    description: 'Notify me when an order is waiting for approval.',
    value: true,
    category: 'Orders'
  },
  {
    id: '5',
    key: 'order_needs_attention',
    label: 'Order in "Needs Attention"',
    description: 'Notify me when an order requires action.',
    value: true,
    category: 'Orders'
  },
  {
    id: '6',
    key: 'insufficient_inventory',
    label: 'Insufficient Inventory for Order',
    description: 'Alert me when an order includes items that are out of stock.',
    value: true,
    category: 'Orders'
  },
  {
    id: '7',
    key: 'order_shipped',
    label: 'Order Shipped',
    description: 'Notify me when an order has been dispatched.',
    value: true,
    category: 'Orders'
  },
  {
    id: '8',
    key: 'tracking_updates',
    label: 'Tracking Updates',
    description: 'Receive updates when tracking status changes.',
    value: true,
    category: 'Orders'
  }
]

// Generate some mock logs
const generateMockLogs = (count: number): OperationLog[] => {
  return Array.from({ length: count }).map((_, index) => ({
    id: index + 1,
    sku: 'SKU X0123',
    actionInfo: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et.',
    operationDetails: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et.',
    operator: index % 2 === 0 ? 'Admin' : 'Auto',
    date: '20:12\n00/00/2026'
  }))
}

const mockLogs = generateMockLogs(55) // Increased to 55 to demonstrate pagination

// API Functions
export const getGeneralSettings = (): Promise<GeneralSetting[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockGeneralSettings]), 300)
  })
}

export const updateGeneralSetting = (key: string, value: boolean): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const setting = mockGeneralSettings.find(s => s.key === key)
      if (setting) setting.value = value
      resolve(true)
    }, 200)
  })
}

export const getOperationLogs = (params: { 
  page?: number, 
  pageSize?: number, 
  search?: string,
  operator?: string 
}): Promise<{ list: OperationLog[], total: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { page = 1, pageSize = 10, search = '', operator = '' } = params
      
      // Filter
      let filtered = [...mockLogs]
      
      if (search) {
        const q = search.toLowerCase()
        filtered = filtered.filter(l => 
          l.sku.toLowerCase().includes(q) || 
          l.operator.toLowerCase().includes(q) ||
          l.id.toString().includes(q)
        )
      }

      if (operator) {
        filtered = filtered.filter(l => l.operator === operator)
      }

      const total = filtered.length

      // Pagination
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const list = filtered.slice(start, end)

      resolve({
        list,
        total
      })
    }, 300)
  })
}

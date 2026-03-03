import { defineMock } from '@alova/mock';

interface GeneralSetting {
  id: string
  key: string
  label: string
  description: string
  value: boolean
  category: 'Inventory' | 'Orders'
}

interface OperationLog {
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
  const actions = ['Order Created', 'Status Updated', 'Inventory Adjusted', 'Refund Processed', 'Shipping Label Generated', 'Payment Received'];
  const operators = ['Admin', 'System', 'Manager', 'User'];
  
  return Array.from({ length: count }).map((_, index) => {
    const actionIndex = Math.floor(Math.random() * actions.length);
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    return {
      id: index + 1,
      sku: `SKU-${1000 + index}`,
      actionInfo: actions[actionIndex],
      operationDetails: `Details for ${actions[actionIndex]} related to order #${20000 + index}. Checked by system.`,
      operator: operators[Math.floor(Math.random() * operators.length)],
      date: date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', month: '2-digit', day: '2-digit', year: 'numeric' }).replace(',', '\n')
    };
  }) as OperationLog[];
}

const mockLogs = generateMockLogs(55)

export const mockSettings = defineMock({
  // GET /settings/general
  '[GET]/api/settings/general': () => {
    return [...mockGeneralSettings];
  },

  // POST /settings/general
  '[POST]/api/settings/general': ({ data }) => {
    const { key, value } = data;
    const setting = mockGeneralSettings.find(s => s.key === key);
    if (setting) setting.value = value;
    return true;
  },

  // GET /settings/logs
  '[GET]/api/settings/logs': ({ query }) => {
    const page = parseInt(query.page || '1');
    const pageSize = parseInt(query.pageSize || '10');
    const search = (query.search || '').toLowerCase();
    const operator = query.operator || '';

    let filtered = [...mockLogs];

    if (search) {
      filtered = filtered.filter(l => 
        l.sku.toLowerCase().includes(search) || 
        l.operator.toLowerCase().includes(search) ||
        l.id.toString().includes(search)
      );
    }

    if (operator) {
      filtered = filtered.filter(l => l.operator === operator);
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const list = filtered.slice(start, end);

    return {
      list,
      total
    };
  }
});

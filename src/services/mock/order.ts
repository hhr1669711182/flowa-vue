import { defineMock } from '@alova/mock';

type BaseOrder = {
  id: string
  customer: string
  date: string
  amount: number
  status: 'Completed' | 'Processing' | 'Pending' | 'Cancelled'
  items: number
}

type InProgressStage = 'Review & Fix' | 'Warehouse Processing' | 'Labeling' | 'Export Processing';
type InProgressStatus = 'Awaiting Approval' | 'Need Attention' | 'Processing' | 'Blocked';
type InventoryStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

interface InProgressOrder {
  id: string
  orderId: string
  platformId: string
  stage: InProgressStage
  status: InProgressStatus
  statusNote: string
  customerName: string
  customerRegion: string
  inventoryStatus: InventoryStatus
  createDate: string
  dueDate: string
  sku: string
  productName: string
  quantity: number
  issueSummary: string
}

const orders: BaseOrder[] = [
  {
    id: 'ORD-7829',
    customer: 'Alice Johnson',
    date: '2023-10-05',
    amount: 120.50,
    status: 'Completed',
    items: 3
  },
  {
    id: 'ORD-7830',
    customer: 'Bob Smith',
    date: '2023-10-05',
    amount: 85.00,
    status: 'Processing',
    items: 1
  },
  {
    id: 'ORD-7831',
    customer: 'Charlie Brown',
    date: '2023-10-04',
    amount: 250.00,
    status: 'Pending',
    items: 5
  },
  {
    id: 'ORD-7832',
    customer: 'Diana Prince',
    date: '2023-10-03',
    amount: 45.99,
    status: 'Cancelled',
    items: 2
  },
  {
    id: 'ORD-7833',
    customer: 'Evan Wright',
    date: '2023-10-02',
    amount: 320.00,
    status: 'Completed',
    items: 4
  },
  ...Array.from({ length: 35 }).map((_, i) => ({
    id: `ORD-${7834 + i}`,
    customer: ['Michael Scott', 'Jim Halpert', 'Pam Beesly', 'Dwight Schrute', 'Ryan Howard'][i % 5],
    date: `2023-09-${30 - (i % 30)}`,
    amount: parseFloat((Math.random() * 500 + 20).toFixed(2)),
    status: ['Completed', 'Processing', 'Pending', 'Cancelled'][i % 4] as BaseOrder['status'],
    items: Math.floor(Math.random() * 10) + 1
  })) as BaseOrder[]
];

const stagePool: InProgressStage[] = [
  'Review & Fix',
  'Warehouse Processing',
  'Labeling',
  'Export Processing'
];
const statusPool: InProgressStatus[] = ['Awaiting Approval', 'Need Attention', 'Processing', 'Blocked'];
const inventoryPool: InventoryStatus[] = ['In Stock', 'Low Stock', 'Out of Stock'];
const issuePool = ['Address Error', 'Info Missing', 'Wrong Declaration', 'SKU mismatch', 'Label issue'];

const formatDate = (date: Date) => {
  const mm = `${date.getMonth() + 1}`.padStart(2, '0');
  const dd = `${date.getDate()}`.padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
};

const randomDate = (from: Date, to: Date) => {
  const ts = from.getTime() + Math.random() * (to.getTime() - from.getTime());
  return new Date(ts);
};

const seedInProgressOrders = (): InProgressOrder[] => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  return Array.from({ length: 70 }).map((_, index) => {
    const created = randomDate(start, now);
    const due = new Date(created);
    due.setDate(created.getDate() + (index % 8) + 2);
    const status = statusPool[index % statusPool.length]!;
    const stage = stagePool[index % stagePool.length]!;
    const inventoryStatus = inventoryPool[index % inventoryPool.length]!;
    const issueSummary = issuePool[index % issuePool.length]!;
    return {
      id: `IP-${1000 + index}`,
      orderId: `Order X${(12345 + index).toString().padStart(6, '0')}`,
      platformId: `LGF${20250000 + index}`,
      stage,
      status,
      statusNote: status === 'Need Attention' ? issueSummary : '',
      customerName: ['Evan Su', 'Olivia Hall', 'Noah Lee', 'Liam Carter', 'Mia Allen'][index % 5],
      customerRegion: ['UK/England', 'US/California', 'AU/Sydney', 'CA/Ontario', 'DE/Berlin'][index % 5],
      inventoryStatus,
      createDate: formatDate(created),
      dueDate: formatDate(due),
      sku: `SKU-${8100 + index}`,
      productName: ['Thermal Label 4x6', 'Foldable Box A', 'Protective Bag', 'Shipping Tape', 'Barcode Sticker'][index % 5],
      quantity: (index % 6) + 1,
      issueSummary
    };
  }) as InProgressOrder[];
};

let inProgressOrdersDb: InProgressOrder[] = seedInProgressOrders();

const inQuickRange = (dateText: string, quickRange: string) => {
  if (!quickRange || quickRange === 'all') return true;
  const now = new Date();
  const date = new Date(dateText);
  if (quickRange === 'last7') {
    const from = new Date(now);
    from.setDate(now.getDate() - 7);
    return date >= from && date <= now;
  }
  if (quickRange === 'last30') {
    const from = new Date(now);
    from.setDate(now.getDate() - 30);
    return date >= from && date <= now;
  }
  if (quickRange === 'thisMonth') {
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }
  return true;
};

export default defineMock({
  '[GET]/api/orders': ({ query }) => {
    const page = parseInt(query.page as string) || 1;
    const pageSize = parseInt(query.pageSize as string) || 10;
    const status = query.status as string;
    const keyword = query.keyword as string;

    let filtered = orders;

    if (status && status !== 'All' && status !== '') {
      filtered = filtered.filter(o => o.status === status);
    }
    
    if (keyword) {
        const lower = keyword.toLowerCase();
        filtered = filtered.filter((o: any) => 
            o.id.toLowerCase().includes(lower) || 
            o.customer.toLowerCase().includes(lower)
        );
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const list = filtered.slice(start, start + pageSize);

    return {
      total,
      list,
      page,
      pageSize
    };
  },

  '[GET]/api/orders/stats': () => {
    return {
      totalOrders: 1248,
      totalRevenue: 84520.50,
      pendingOrders: 42,
      completedOrders: 1150
    };
  },

  '/api/orders/in-progress': ({ query }) => {
    const page = parseInt(query.page || '1', 10);
    const pageSize = parseInt(query.pageSize || '10', 10);
    const keyword = (query.keyword || '').toLowerCase();
    const quickRange = query.quickRange || 'all';
    const stage = query.stage || '';
    const status = query.status || '';
    const dateRange = query.dateRange;

    let filtered = [...inProgressOrdersDb];

    if (keyword) {
      filtered = filtered.filter(
        (item) =>
          item.orderId.toLowerCase().includes(keyword) ||
          item.platformId.toLowerCase().includes(keyword) ||
          item.sku.toLowerCase().includes(keyword)
      );
    }

    if (stage) {
      filtered = filtered.filter((item) => item.stage === stage);
    }

    if (status) {
      filtered = filtered.filter((item) => item.status === status);
    }

    filtered = filtered.filter((item) => inQuickRange(item.createDate, quickRange));

    if (Array.isArray(dateRange) && dateRange.length === 2) {
      const [from, to] = dateRange;
      filtered = filtered.filter((item) => item.createDate >= from && item.createDate <= to);
    }

    filtered.sort((a, b) => (a.createDate > b.createDate ? -1 : 1));

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const list = filtered.slice(start, start + pageSize);
    return { 
      total, 
      list,
      page,
      pageSize
    };
  },

  '/api/orders/in-progress/detail': ({ query }) => {
    return inProgressOrdersDb.find((item) => item.id === query.id) || inProgressOrdersDb[0];
  },

  '[POST]/api/orders/in-progress/review': ({ data }) => {
    inProgressOrdersDb = inProgressOrdersDb.map((item) => {
      if (item.id !== data.id) return item;
      return {
        ...item,
        stage: 'Review & Fix',
        status: 'Need Attention',
        statusNote: data.issueType || item.statusNote,
        dueDate: data.dueDate || item.dueDate,
        issueSummary: data.note || item.issueSummary
      };
    });
    return { success: true };
  },

  '[POST]/api/orders/in-progress/status': ({ data }) => {
    inProgressOrdersDb = inProgressOrdersDb.map((item) => {
      if (item.id !== data.id) return item;
      return {
        ...item,
        status: data.status || item.status,
        statusNote: data.status === 'Need Attention' ? item.statusNote || item.issueSummary : ''
      };
    });
    return { success: true };
  }
});

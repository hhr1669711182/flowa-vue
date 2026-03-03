import { defineMock } from '@alova/mock';

const orders = [
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
  // Generate more orders for pagination
  ...Array.from({ length: 35 }).map((_, i) => ({
    id: `ORD-${7834 + i}`,
    customer: ['Michael Scott', 'Jim Halpert', 'Pam Beesly', 'Dwight Schrute', 'Ryan Howard'][i % 5],
    date: `2023-09-${30 - (i % 30)}`,
    amount: parseFloat((Math.random() * 500 + 20).toFixed(2)),
    status: ['Completed', 'Processing', 'Pending', 'Cancelled'][i % 4],
    items: Math.floor(Math.random() * 10) + 1
  }))
];

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
  }
});

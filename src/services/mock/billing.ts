import { defineMock } from '@alova/mock';

const generateMockList = () => {
  const list = [];
  const statuses = ['Paid', 'Pending', 'Overdue', 'Failed'];
  
  for (let i = 1; i <= 50; i++) {
    const picking = parseFloat((Math.random() * 20).toFixed(2));
    const packaging = parseFloat((Math.random() * 15).toFixed(2));
    const shipping = parseFloat((Math.random() * 50).toFixed(2));
    const tax = parseFloat(((picking + packaging + shipping) * 0.1).toFixed(2));
    const total = parseFloat((picking + packaging + shipping + tax).toFixed(2));

    list.push({
      id: `INV-${2024000 + i}`,
      orderId: `ORD-${8000 + i}`,
      platformId: `PF-${1000 + i}`,
      fulfilledDate: `2024-${Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 28 + 1).toString().padStart(2, '0')}`,
      picking,
      packaging,
      shipping,
      tax,
      total,
      status: statuses[Math.floor(Math.random() * statuses.length)],
    });
  }
  return list;
};

const outboundData = generateMockList();

export const mockBilling = defineMock({
  '/api/billing/outbound': ({ query }) => {
    const page = parseInt(query.page || '1');
    const pageSize = parseInt(query.pageSize || '10');
    const status = query.status;
    const search = query.search?.toLowerCase();
    
    let list = [...outboundData];
    
    if (status) {
      list = list.filter(item => item.status === status);
    }
    
    if (search) {
      list = list.filter(item => 
        item.orderId.toLowerCase().includes(search) || 
        item.platformId.toLowerCase().includes(search)
      );
    }
    
    const total = list.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      total,
      list: list.slice(start, end)
    };
  },
  
  '/api/billing/outbound/stats': () => {
    return {
      totalRevenue: 45231.89,
      totalOrders: 1250,
      avgOrderValue: 36.18
    };
  }
});

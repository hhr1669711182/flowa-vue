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

const generateTransactionList = () => {
  const list = [];
  const types = ['Credit', 'Debit'];
  
  for (let i = 1; i <= 50; i++) {
    const isCredit = Math.random() > 0.5;
    // Generate a random date within the last year
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 365));
    
    list.push({
      id: i.toString().padStart(2, '0'),
      transactionTime: `20:12\n00/00/2026`, 
      realDate: date.toISOString().split('T')[0], // YYYY-MM-DD for filtering
      type: isCredit ? 'Credit' : 'Debit',
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
      amount: "$ 0,00",
      currentBalance: "$ 0,00"
    });
  }
  return list;
};

const generateInboundList = () => {
  const list = [];
  for (let i = 1; i <= 50; i++) {
    list.push({
      id: i.toString(),
      inboundId: `Inbound X0${1230 + i}`,
      completionDate: '00/00/2026',
      warehouse: 'EUB-SZ',
      totalAmount: '$0,00',
      
      createDate: 'dd/mm/yyyy',
      forecastedDate: 'dd/mm/yyyy',
      completedDate: 'dd/mm/yyyy',
      
      palletQty: 2,
      palletPrice: '$0,00',
      palletSubtotal: '$0,00',
      
      boxQty: 3,
      boxPrice: '$0,00',
      boxSubtotal: '$0,00',
      
      scanQty: 4,
      scanPrice: '$0,00',
      scanSubtotal: '$0,00',
      
      grandTotal: '$0,00'
    });
  }
  return list;
};

const outboundData = generateMockList();
const transactionData = generateTransactionList();
const inboundData = generateInboundList();

export const mockOutbound = defineMock({
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
      list: list.slice(start, end),
      page,
      pageSize
    };
  },
  
  '/api/billing/outbound/stats': () => {
    return {
      totalRevenue: 2430, // Total Savings
      totalOrders: 5250, // Credit Remaining
      avgOrderValue: 36.18,
      price: "$2,400",
      progressItems: [
        {
          label: "Available",
          value: 2400,
          total: 4250,
          percent: 50,
          color: "var(--color-brand-secondary)",
        },
        {
          label: "Reserved",
          value: 1650,
          total: 4250,
          percent: 38,
          color: "var(--color-brand-primary-pumpkin)",
        },
      ]
    };
  },

  '[POST]/api/billing/outbound/export': () => {
    return {
      url: 'https://example.com/billing-export.csv'
    };
  },

  '[POST]/api/billing/recharge': () => {
    return {
      success: true,
      newBalance: 2500
    };
  },

  '/api/billing/transactions': ({ query }) => {
    const page = parseInt(query.page || '1');
    const pageSize = parseInt(query.pageSize || '10');
    const type = query.type;
    const search = query.search?.toLowerCase();
    const dateRange = query['dateRange[]'] || query.dateRange; // Handle array parameter
    
    let list = [...transactionData];
    
    if (type) {
      list = list.filter(item => item.type === type);
    }
    
    if (search) {
      list = list.filter(item => 
        item.description.toLowerCase().includes(search) || 
        item.id.includes(search)
      );
    }
    
    if (dateRange && Array.isArray(dateRange) && dateRange.length === 2) {
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);
      
      list = list.filter(item => {
        const itemDate = new Date(item?.realDate || '');
        return itemDate >= startDate && itemDate <= endDate;
      });
    }
    
    const total = list.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      total,
      list: list.slice(start, end),
      page,
      pageSize
    };
  },

  '/api/billing/inbound/list': ({ query }) => {
    const page = parseInt(query.page || '1');
    const pageSize = parseInt(query.pageSize || '10');
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      total: inboundData.length,
      list: inboundData.slice(start, end),
      page,
      pageSize
    };
  }
});

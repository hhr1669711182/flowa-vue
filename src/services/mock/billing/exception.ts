import { defineMock } from '@alova/mock';

const generateMockList = () => {
  const list = [];
  for (let i = 1; i <= 50; i++) {
    list.push({
      id: i.toString(),
      orderId: 'Order X012345',
      approvedDate: '00/00/2026',
      trackingNo: '0123456789',
      type: 'Exception Type',
      total: '$0,00',
    });
  }
  return list;
};

const mockList = generateMockList();

export const mockException = defineMock({
  '/api/billing/exception/list': ({ query }) => {
    const page = parseInt(query.page || '1');
    const pageSize = parseInt(query.pageSize || '10');
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      total: mockList.length,
      list: mockList.slice(start, end),
      page,
      pageSize
    };
  },
  
  '/api/billing/exception/stats': () => {
    return {
      creditRemaining: '$5,250',
      creditTotal: '$10,500',
      creditPercent: 50,
      reservedCredits: '$2,400',
      availableCredits: '$2,400',
      reservedAmount: '$1,850',
      totalSavings: '$2,430',
      savingsPercent: '12%',
      progressItems: [
        {
          label: "Available",
          value: "2,400",
          percent: 56.4,
          color: "var(--color-brand-secondary)",
        },
        {
          label: "Reserved",
          value: "1,850",
          percent: 43.6,
          color: "var(--color-brand-primary-pumpkin)",
        },
      ]
    };
  },

  '[POST]/api/billing/exception/export': () => {
    return {
      url: 'https://example.com/billing-exception-export.csv'
    };
  }
});

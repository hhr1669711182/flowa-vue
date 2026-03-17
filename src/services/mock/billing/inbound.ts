import { defineMock } from '@alova/mock';

const generateMockList = () => {
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

const mockList = generateMockList();

export const mockInbound = defineMock({
  '/api/billing/inbound/list': ({ query }) => {
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
  }
});

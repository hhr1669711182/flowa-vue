import { defineMock } from '@alova/mock';

const generateMockList = () => {
  const list = [];
  for (let i = 1; i <= 50; i++) {
    list.push({
      id: i.toString(),
      serviceId: `Service X0${1230 + i}`,
      approvedDate: '00/00/2026',
      type: 'Service Type',
      typeDescription: 'Service Type Description',
      approvedBy: 'Evan Su',
      price: '$0,00',
      uom: 'Per Item',
      quantity: 3,
      subtotal: '$0,00',
      totalVat: '$0,00',
      total: '$0,00',
    });
  }
  return list;
};

const mockList = generateMockList();

export const mockServices = defineMock({
  '/api/billing/services/list': ({ query }) => {
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

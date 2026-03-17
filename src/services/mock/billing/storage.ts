import { defineMock } from '@alova/mock';

const generateMockList = () => {
  const list = [];
  for (let i = 1; i <= 50; i++) {
    list.push({
      id: i.toString(),
      date: '00/00/2026',
      warehouse: 'XXX-123',
      bins: 2,
      pallets: 3,
      total: '$0,00',
    });
  }
  return list;
};

const mockList = generateMockList();

export const mockStorage = defineMock({
  '/api/billing/storage/list': ({ query }) => {
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

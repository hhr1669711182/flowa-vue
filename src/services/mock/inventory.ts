import { defineMock } from '@alova/mock';

const products = [
  {
    id: '1',
    name: 'Wireless Noise-Canceling Headphones',
    sku: 'AUDIO-001',
    category: 'Electronics',
    type: 'product',
    stock: 45,
    incoming: 20,
    reserved: 5,
    available: 40,
    status: 'In Stock',
    price: 299.99,
    image: 'https://via.placeholder.com/150',
    lastUpdated: '2023-10-01',
  },
  {
    id: '2',
    name: 'Ergonomic Office Chair',
    sku: 'FURN-002',
    category: 'Furniture',
    type: 'product',
    stock: 12,
    incoming: 0,
    reserved: 2,
    available: 10,
    status: 'Low Stock',
    price: 199.50,
    image: 'https://via.placeholder.com/150',
    lastUpdated: '2023-09-28',
  },
  {
    id: '3',
    name: 'Mechanical Gaming Keyboard',
    sku: 'TECH-003',
    category: 'Electronics',
    type: 'product',
    stock: 0,
    incoming: 50,
    reserved: 0,
    available: 0,
    status: 'Out of Stock',
    price: 129.00,
    image: 'https://via.placeholder.com/150',
    lastUpdated: '2023-10-05',
  },
  {
    id: '4',
    name: 'Smartphone Stand',
    sku: 'ACC-004',
    category: 'Accessories',
    type: 'product',
    stock: 150,
    incoming: 100,
    reserved: 10,
    available: 140,
    status: 'In Stock',
    price: 19.99,
    image: 'https://via.placeholder.com/150',
    lastUpdated: '2023-10-02',
  },
  {
    id: '5',
    name: '4K Monitor 27"',
    sku: 'TECH-005',
    category: 'Electronics',
    type: 'product',
    stock: 8,
    incoming: 10,
    reserved: 0,
    available: 8,
    status: 'Low Stock',
    price: 349.00,
    image: 'https://via.placeholder.com/150',
    lastUpdated: '2023-09-30',
  },
  {
    id: '6',
    name: 'USB-C Hub',
    sku: 'ACC-006',
    category: 'Accessories',
    type: 'product',
    stock: 85,
    incoming: 30,
    reserved: 5,
    available: 80,
    status: 'In Stock',
    price: 45.00,
    image: 'https://via.placeholder.com/150',
    lastUpdated: '2023-10-04',
  },
  // Add more products to test pagination
  ...Array.from({ length: 24 }).map((_, i) => ({
    id: `${7 + i}`,
    name: `Product Sample ${i + 1}`,
    sku: `SMP-${100 + i}`,
    category: ['Electronics', 'Furniture', 'Accessories', 'Clothing', 'Home', 'Books'][i % 6],
    type: 'product',
    stock: 10 + i * 5,
    incoming: i * 2,
    reserved: i,
    available: 10 + i * 4,
    status: (10 + i * 5) > 20 ? 'In Stock' : ((10 + i * 5) > 0 ? 'Low Stock' : 'Out of Stock'),
    price: 10.00 + i * 2.5,
    image: 'https://via.placeholder.com/150',
    lastUpdated: new Date().toISOString().split('T')[0]
  })),
  // Add some mock bundles
  ...Array.from({ length: 10 }).map((_, i) => ({
    id: `B-${i + 1}`,
    name: `Bundle Sample ${i + 1}`,
    sku: `BND-${100 + i}`,
    category: ['Electronics', 'Home'][i % 2],
    type: 'bundle',
    stock: 5 + i,
    incoming: 0,
    reserved: 0,
    available: 5 + i,
    status: 'Active',
    price: 99.99 + i * 10,
    image: 'https://via.placeholder.com/150',
    lastUpdated: new Date().toISOString().split('T')[0],
    items: 3 + i
  }))
];

export const mockInventory = defineMock({
  // GET /inventory/products
  '[GET]/api/inventory/products': ({ query }) => {
    const page = parseInt(query.page || '1');
    const pageSize = parseInt(query.pageSize || '10');
    const keyword = (query.keyword || '').toLowerCase();
    const status = query.status || '';
    const type = query.type || '';

    let filtered = products;

    if (type) {
      filtered = filtered.filter(p => p.type === type);
    }

    if (keyword) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(keyword) || 
        p.sku.toLowerCase().includes(keyword)
      );
    }

    if (status) {
      filtered = filtered.filter(p => p.status === status);
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const list = filtered.slice(start, end);

    return {
      list,
      total,
      page,
      pageSize
    };
  },
  
  '[GET]/api/inventory/stats': () => {
    return {
      totalInventory: 1250,
      totalValue: 98500,
      lowStockCount: 5,
      storageUsage: 30, // Percentage
      categoryData: {
        categories: ['Electronics', 'Furniture', 'Accessories', 'Clothing', 'Home', 'Books'],
        counts: [450, 320, 280, 200, 150, 100]
      }
    }
  }
});

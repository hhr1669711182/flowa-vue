import { defineMock } from '@alova/mock';
import yfImage from '@/views/icon/yf.png';

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
    image: yfImage,
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
    image: yfImage,
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
    image: yfImage,
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
    image: yfImage,
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
    image: yfImage,
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
    image: yfImage,
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
    image: yfImage,
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
    cost: 20.00,
    bestBefore: '2026-12-20',
    measures: {
      length: 100,
      width: 100,
      height: 100,
      weight: 100
    },
    packaging: 'Standard Box',
    items: [
      {
        id: '1',
        name: 'Black Shirt S',
        sku: '012345',
        details: 'Black Shirt S Cotton...',
        qty: 1,
        stockStatus: 'In Stock'
      },
      {
        id: '2',
        name: 'Black Shirt S',
        sku: '012345',
        details: 'Black Shirt S Cotton...',
        qty: 1,
        stockStatus: 'Out of Stock'
      }
    ],
    incoming: 0,
    reserved: 0,
    available: 5 + i,
    status: 'In Stock',
    price: 99.99 + i * 10,
    image: yfImage,
    lastUpdated: new Date().toISOString().split('T')[0],
  }))
];

export const mockInventory = defineMock({
  // GET /inventory/products
  '[GET]/api/inventory/products': ({ query }) => {
    const page = parseInt(query.page || '1');
    const pageSize = parseInt(query.pageSize || '10');
    const keyword = (query.keyword || '').toLowerCase();
    const status = query.status || '';

    let filtered = products.filter(p => p.type !== 'bundle'); // Only products

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
    const list = filtered.slice(start, end).map((bundle: any) => {
      const { items, ...rest } = bundle || {};
      return rest;
    });

    return {
      list,
      total,
      page,
      pageSize
    };
  },

  // GET /inventory/bundles
  '[GET]/api/inventory/bundles': ({ query }) => {
    const page = parseInt(query.page || '1');
    const pageSize = parseInt(query.pageSize || '10');
    const keyword = (query.sku || '').toLowerCase();
    const status = query.stock || 'all';

    let filtered = products.filter(p => p.type === 'bundle');

    if (keyword) {
      filtered = filtered.filter(p => 
        p.sku.toLowerCase().includes(keyword) || 
        p.name.toLowerCase().includes(keyword)
      );
    }

    if (status !== 'all') {
      // Simplistic status filter
      if (status === 'in') filtered = filtered.filter(p => p.stock > 0);
      if (status === 'out') filtered = filtered.filter(p => p.stock === 0);
      if (status === 'low') filtered = filtered.filter(p => p.stock > 0 && p.stock < 10);
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
  
  '[GET]/api/inventory/bundles/{id}': ({ params }) => {
    const bundle = products.find(p => p.id === params.id && p.type === 'bundle');
    if (!bundle) return { status: 404, message: 'Bundle not found' };
    return bundle;
  },

  '[POST]/api/inventory/bundles': ({ data }) => {
    return {
      id: `B-${products.length + 1}`,
      ...data,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
  },

  '[PUT]/api/inventory/bundles/{id}': ({ params, data }) => {
    return {
      id: params.id,
      ...data,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
  },

  '[DELETE]/api/inventory/bundles/{id}': ({ params }) => {
    return { success: true, id: params.id };
  },

  '[DELETE]/api/inventory/bundles/{id}/items/{itemId}': ({ params }) => {
    const bundle = products.find(p => p.id === params.id && p.type === 'bundle') as any
    if (bundle?.items && Array.isArray(bundle.items)) {
      bundle.items = bundle.items.filter((item: any) => item.id !== params.itemId)
    }
    return { success: true, id: params.id, itemId: params.itemId };
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
  },

  '[GET]/api/inventory/export': () => {
    return {
      url: 'https://example.com/download/inventory_export.xlsx',
      filename: 'inventory_export.xlsx'
    }
  },

  // CRUD for Products
  '[GET]/api/inventory/products/{id}': ({ params }) => {
    const product = products.find(p => p.id === params.id);
    if (!product) return { status: 404, message: 'Product not found' };
    return {
      ...product,
      description: "Black Shirt S Cotton/Polyester. The Hutchence Short Sleeve Cotton Blend Polo Shirt by Connor is a must-have for any guy seeking a casual and comfortable wardrobe staple.",
      cost: 20.00,
      bestBefore: '2026-12-10',
      measures: {
        length: 100,
        width: 100,
        height: 100,
        weight: 100,
        unit: 'cm',
        weightUnit: 'g'
      },
      qcImages: Array(4).fill(product.image)
    };
  },

  '[POST]/api/inventory/products': ({ data }) => {
    return {
      id: String(products.length + 1),
      ...data,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
  },

  '[PUT]/api/inventory/products/{id}': ({ params, data }) => {
    return {
      id: params.id,
      ...data,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
  },

  '[DELETE]/api/inventory/products/{id}': ({ params }) => {
    return { success: true, id: params.id };
  }
});

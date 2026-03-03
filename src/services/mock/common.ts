import { defineMock } from '@alova/mock';

interface SearchResult {
  id: number
  name: string
  sku: string
  desc: string
  qty: number
  image: string
}

const mockSearchResults: SearchResult[] = [
  {
    id: 1,
    name: 'Classic White T-Shirt',
    sku: 'TS-001-WHT',
    desc: 'Premium cotton basic tee',
    qty: 120,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
  },
  {
    id: 2,
    name: 'Slim Fit Jeans',
    sku: 'JN-002-BLU',
    desc: 'Stretch denim blue jeans',
    qty: 85,
    image: 'https://images.unsplash.com/photo-1542272617-08f086302542?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
  },
  {
    id: 3,
    name: 'Leather Jacket',
    sku: 'JK-003-BLK',
    desc: 'Genuine leather biker jacket',
    qty: 45,
    image: 'https://images.unsplash.com/photo-1551028919-ac66e6a39d7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
  },
  {
    id: 4,
    name: 'Running Shoes',
    sku: 'SH-004-GRY',
    desc: 'Lightweight athletic sneakers',
    qty: 200,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
  },
  {
    id: 5,
    name: 'Canvas Backpack',
    sku: 'BG-005-GRN',
    desc: 'Durable travel bag',
    qty: 60,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
  }
];

export const mockCommon = defineMock({
  // GET /search
  '[GET]/api/search': ({ query }) => {
    const q = (query.q || '').toLowerCase();
    if (!q) return [];
    
    return mockSearchResults.filter(item => 
      item.name.toLowerCase().includes(q) || 
      item.sku.toLowerCase().includes(q)
    );
  }
});

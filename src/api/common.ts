import { alovaInstance } from '@/services/alova';

export interface SearchResult {
  id: number
  name: string
  sku: string
  desc: string
  qty: number
  image: string
}

export const getSearchResults = (query: string) => {
  return alovaInstance.Get<SearchResult[]>('/api/search', {
    params: { q: query }
  });
}

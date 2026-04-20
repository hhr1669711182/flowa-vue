import { alovaInstance } from '@/services/alova';
import { useAppStoreWithOut } from '@/store/modules/app'

export interface SearchResult {
  id: number
  name: string
  sku: string
  desc: string
  qty: number
  image: string
}

export const getSearchResults = (query: string) => {
  if (useAppStoreWithOut().useMock) {
    return alovaInstance.Get<SearchResult[]>('/api/search', {
      params: { q: query }
    });
  }
  return alovaInstance.Get<any>('frappe.desk.search.search_widget', {
    params: { txt: query }
  })
}

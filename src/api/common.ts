import { alovaInstance } from '@/services/alova'

export interface SearchResult {
  id: number
  name: string
  sku: string
  desc: string
  qty: number
  image: string
}

export const getSearchResults = (query: string) => {
  return alovaInstance.Get<any>('/api/method/frappe.desk.search.search_widget', {
    params: { txt: query }
  })
}

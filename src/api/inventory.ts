import { alovaInstance } from '@/services/alova';
import { useAppStoreWithOut } from '@/store/modules/app'
import { site } from '@/api/useAddress'

const OMS_API = site.UU_API_OMS_UI
// const OMS_API_FETCH = site.UU_API_OMS_UI

/** 商品列表（含 WDT 库存）：POST get_item_list_with_wdt_stock，关联 WDT Shopify Inventory Snapshot Inst。Total=wdt_quantity，Reserved=wdt_lock_quantity。 */
export const getItemListWithWdtStock = (params: {
  company?: string
  page?: number
  page_size?: number
  name?: string
  item_group?: string
  item_code?: string
  search?: string
  keyword?: string
}) => {
  return alovaInstance.Post<any>(`${OMS_API}.get_item_list_with_wdt_stock`, {
    company: params.company,
    page: params.page ?? 1,
    page_size: params.page_size ?? 10,
    name: params.name,
    item_group: params.item_group,
    item_code: params.item_code,
    search: params.search ?? params.keyword,
    keyword: params.keyword ?? params.search,
  })
}

/** 商品列表：GET /api/resource/Item 或 get_item_list_with_wdt_stock（当传入 company 时）。filters=[[Item, disabled, =, 0]]。 */
export const getInventoryProducts = async (params: {
  page?: number
  pageSize?: number
  limit_page_length?: number
  limit_start?: number
  order_by?: string
  fields?: string[]
  name?: string
  item_group?: string
  item_code?: string
  keyword?: string
  sku?: string
  search?: string
  status?: string
  company?: string
}) => {
  const p = params || {}
  const page = Number(p.page) || 1
  const pageSize = Number(p.pageSize) || p.limit_page_length || 10
  const kw = (p.search || p.keyword || '').trim()
  const name = kw ? '' : (p.name || '').trim()
  const item_group = (p.item_group || '').trim()
  const item_code = kw ? '' : (p.item_code || p.sku || '').trim()
  
  if (!useAppStoreWithOut().useMock) {
    const res = await getItemListWithWdtStock({
      company: p.company || undefined,
      page,
      page_size: pageSize,
      search: kw || undefined,
      name: name || undefined,
      item_group: item_group || undefined,
      item_code: item_code || undefined,
    }).send()
    const msg = (res as any)?.message ?? res
    const data = msg?.data ?? []
    const total = typeof msg?.total === 'number' ? msg.total : 0
    return {
      list: Array.isArray(data) ? data : [],
      total,
      page,
      pageSize,
    }
  }

  const res = await alovaInstance.Get<any>('/api/inventory/products', {
    params: { page: String(page), pageSize: String(pageSize), keyword: name, status: p.status }
  }).send()
  const msg = (res as any)?.message ?? res
  return {
    list: msg?.list ?? msg?.data ?? [],
    total: msg?.total ?? 0,
    page,
    pageSize,
  }
}

export const getInventoryStats = (company?: string) => {
  if (useAppStoreWithOut().useMock) {
    return alovaInstance.Get<any>('/api/inventory/stats');
  }
  return alovaInstance.Post<any>(`${OMS_API}.get_item_available_count`, company ? { company } : {})
}

export const exportInventoryProducts = (params: any) => {
  return alovaInstance.Get<any>('/api/inventory/export', { params })
}

/** 导出与列表相同筛选的 Item 导入模板 CSV（UTF-8 BOM），表头中英对照。 */
export async function exportOmsItemsImportTemplate(params: {
  company: string
  search?: string
  keyword?: string
  item_group?: string
  name?: string
  item_code?: string
}) {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  const csrf = typeof localStorage !== 'undefined' ? localStorage.getItem('frappe_csrf_token') : null
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
  if (csrf) headers['X-Frappe-CSRF-Token'] = csrf
  if (token) headers.Authorization = `Bearer ${token}`

  // 文件下载仍需保留 fetch 以获取 blob
  const res = await fetch(`${OMS_API}.export_oms_items_import_template`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify({
      company: params.company,
      search: params.search ?? params.keyword,
      keyword: params.keyword ?? params.search,
      item_group: params.item_group,
      name: params.name,
      item_code: params.item_code,
    }),
  })

  const ct = (res.headers.get('content-type') || '').toLowerCase()
  if (!res.ok || ct.includes('application/json')) {
    const t = await res.text()
    let msg = `HTTP ${res.status}`
    try {
      const j = JSON.parse(t) as { exc?: string; message?: string | { message?: string } }
      msg =
        j?.exc ||
        (typeof j?.message === 'object' ? j?.message?.message : j?.message) ||
        msg
    } catch {
      if (t) msg = t.slice(0, 300)
    }
    throw new Error(msg)
  }

  let filename = 'oms_items_export.csv'
  const cd = res.headers.get('content-disposition')
  if (cd) {
    const utfMatch = cd.match(/filename\*=UTF-8''([^;\n]+)/i)
    if (utfMatch?.[1]) {
      try {
        filename = decodeURIComponent(utfMatch[1].trim())
      } catch {
        filename = utfMatch[1].trim()
      }
    } else {
      const m = cd.match(/filename="?([^";\n]+)"?/i)
      if (m?.[1]) filename = m[1].trim()
    }
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** 商品详情查看：POST get_item，返回 success/data，含 description、image、valuation_rate、wdt_quantity、wdt_lock_quantity 等 */
export const getProductDetail = (id: string, company?: string) => {
  if (useAppStoreWithOut().useMock) {
    return alovaInstance.Get<any>(`/api/inventory/products/${id}`);
  }
  return alovaInstance.Post<any>(`${OMS_API}.get_item`, { item_code: id, company })
}

/** 品牌列表：POST get_brand_list，供 Item 编辑时选择品牌 */
export const getBrandList = () => {
  return alovaInstance.Post<any>(`${OMS_API}.get_brand_list`, {})
}

/** 供应商列表：POST get_supplier_list，按 company 过滤（Party Account） */
export const getSupplierList = (company?: string) => {
  return alovaInstance.Post<any>(`${OMS_API}.get_supplier_list`, { company })
}

export const createProduct = (data: any) => {
  return alovaInstance.Post<any>('/api/resource/Item', data)
}

/** 商品修改：POST update_item，支持 item_name、valuation_rate、description、weight_per_unit 等。company 必填。 */
export const updateProduct = (id: string, data: {
  company?: string
  item_name?: string
  valuation_rate?: number
  description?: string
  weight_per_unit?: number
  [k: string]: any
}) => {
  if (useAppStoreWithOut().useMock) {
    return alovaInstance.Put<any>(`/api/inventory/products/${id}`, data);
  }
  const { company, ...rest } = data
  return alovaInstance.Post<any>(`${OMS_API}.update_item`, { item_code: id, company, ...rest })
}

export const deleteProduct = (id: string) => {
  if (useAppStoreWithOut().useMock) {
    return alovaInstance.Delete<any>(`/api/inventory/products/${id}`);
  }
  return alovaInstance.Delete<any>(`/api/resource/Item/${encodeURIComponent(id)}`)
}

export const removeProductVirtualName = (id: string, name: string) => {
  return alovaInstance.Post<{ success: boolean; virtualNames: string[] }>(
    `/api/inventory/products/${id}/virtual-name/remove`,
    { name }
  );
}

// Bundle API
export const getInventoryBundles = (params: any) => {
  if (useAppStoreWithOut().useMock) {
    return alovaInstance.Get<any>('/api/inventory/bundles', { params });
  }
  return alovaInstance.Get<any>('/api/resource/Item Bundle', { params })
}

export const getBundleDetail = (id: string) => {
  if (useAppStoreWithOut().useMock) {
    return alovaInstance.Get<any>(`/api/inventory/bundles/${id}`);
  }
  return alovaInstance.Get<any>(`/api/resource/Item Bundle/${encodeURIComponent(id)}`)
}

export const createBundle = (data: any) => {
  if (useAppStoreWithOut().useMock) {
    return alovaInstance.Post<any>('/api/inventory/bundles', data);
  }
  return alovaInstance.Post<any>('/api/resource/Item Bundle', data)
}

export const updateBundle = (id: string, data: any) => {
  if (useAppStoreWithOut().useMock) {
    return alovaInstance.Put<any>(`/api/inventory/bundles/${id}`, data);
  }
  return alovaInstance.Put<any>(`/api/resource/Item Bundle/${encodeURIComponent(id)}`, data)
}

export const deleteBundle = (id: string) => {
  if (useAppStoreWithOut().useMock) {
    return alovaInstance.Delete<any>(`/api/inventory/bundles/${id}`);
  }
  return alovaInstance.Delete<any>(`/api/resource/Item Bundle/${encodeURIComponent(id)}`)
}

export const deleteBundleItem = (bundleId: string, itemId: string) => {
  if (useAppStoreWithOut().useMock) {
    return alovaInstance.Delete<any>(`/api/inventory/bundles/${bundleId}/items/${itemId}`);
  }
  return alovaInstance.Delete<any>(`/api/resource/Item Bundle/${encodeURIComponent(bundleId)}`)
}

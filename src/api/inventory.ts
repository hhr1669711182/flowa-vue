import { alovaInstance } from '@/services/alova';

export const getInventoryProducts = (params: any) => {
  return alovaInstance.Get<any>('/api/inventory/products', { params });
}

export const getInventoryStats = () => {
  return alovaInstance.Get<any>('/api/inventory/stats');
}

export const exportInventoryProducts = (params: any) => {
  return alovaInstance.Get<any>('/api/inventory/export', { params });
}

export const getProductDetail = (id: string) => {
  return alovaInstance.Get<any>(`/api/inventory/products/${id}`);
}

export const createProduct = (data: any) => {
  return alovaInstance.Post<any>('/api/inventory/products', data);
}

export const updateProduct = (id: string, data: any) => {
  return alovaInstance.Put<any>(`/api/inventory/products/${id}`, data);
}

export const deleteProduct = (id: string) => {
  return alovaInstance.Delete<any>(`/api/inventory/products/${id}`);
}

// Bundle API
export const getInventoryBundles = (params: any) => {
  return alovaInstance.Get<any>('/api/inventory/bundles', { params });
}

export const getBundleDetail = (id: string) => {
  return alovaInstance.Get<any>(`/api/inventory/bundles/${id}`);
}

export const createBundle = (data: any) => {
  return alovaInstance.Post<any>('/api/inventory/bundles', data);
}

export const updateBundle = (id: string, data: any) => {
  return alovaInstance.Put<any>(`/api/inventory/bundles/${id}`, data);
}

export const deleteBundle = (id: string) => {
  return alovaInstance.Delete<any>(`/api/inventory/bundles/${id}`);
}

export const deleteBundleItem = (bundleId: string, itemId: string) => {
  return alovaInstance.Delete<any>(
    `/api/inventory/bundles/${bundleId}/items/${itemId}`
  )
}

import { alovaInstance } from '@/services/alova';

export interface StorageRecord {
  id: string;
  date: string;
  warehouse: string;
  bins: number;
  pallets: number;
  total: string;
}

export const getStorageList = (params: {
  page?: number;
  pageSize?: number;
  search?: string;
  dateRange?: string[];
}) => {
  return alovaInstance.Get<{
    total: number;
    list: StorageRecord[];
    page: number;
    pageSize: number;
  }>('/api/billing/storage/list', { params });
};

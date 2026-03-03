import { alovaInstance } from '@/services/alova';

export interface GeneralSetting {
  id: string
  key: string
  label: string
  description: string
  value: boolean
  category: 'Inventory' | 'Orders'
}

export interface OperationLog {
  id: number
  sku: string
  actionInfo: string
  operationDetails: string
  operator: string
  date: string
}

export const getGeneralSettings = () => {
  return alovaInstance.Get<GeneralSetting[]>('/api/settings/general');
}

export const updateGeneralSetting = (key: string, value: boolean) => {
  return alovaInstance.Post<boolean>('/api/settings/general', { key, value });
}

export const getOperationLogs = (params: { 
  page?: number, 
  pageSize?: number, 
  search?: string,
  operator?: string 
}) => {
  return alovaInstance.Get<{ list: OperationLog[], total: number }>('/api/settings/logs', {
    params
  });
}

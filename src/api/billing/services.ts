import { alovaInstance } from '@/services/alova';

export interface ServiceRecord {
  id: string;
  serviceId: string;
  approvedDate: string;
  type: string;
  typeDescription: string;
  approvedBy: string;
  price: string;
  uom: string;
  quantity: number;
  subtotal: string;
  totalVat: string;
  total: string;
}

export const getServicesList = (params: {
  page?: number;
  pageSize?: number;
  search?: string;
  dateRange?: string[];
  type?: string;
}) => {
  return alovaInstance.Get<{
    total: number;
    list: ServiceRecord[];
    page: number;
    pageSize: number;
  }>('/api/billing/services/list', { params });
};

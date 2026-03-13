import { alovaInstance } from '@/services/alova';

export interface OutboundRecord {
  id: string;
  orderId: string;
  platformId: string;
  fulfilledDate: string;
  picking: number;
  packaging: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Failed';
}

export interface OutboundStats {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  price: string;
  progressItems: Array<{
    label: string;
    value: number;
    total: number;
    percent: number;
    color: string;
  }>;
}

export const getOutboundBillingList = (params: {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
  dateRange?: string[];
}) => {
  return alovaInstance.Get<{
    total: number;
    list: OutboundRecord[];
    page: number;
    pageSize: number;
  }>('/api/billing/outbound', { params });
};

export const getOutboundStats = () => {
  return alovaInstance.Get<OutboundStats>('/api/billing/outbound/stats');
}

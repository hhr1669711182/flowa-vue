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

export interface TransactionRecord {
  id: string;
  transactionTime: string;
  type: 'Credit' | 'Debit';
  description: string;
  amount: string;
  currentBalance: string;
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

export const exportOutboundBilling = (params: any) => {
  return alovaInstance.Post<{ url: string }>('/api/billing/outbound/export', params);
}

export const rechargeCredit = (data: { amount: number }) => {
  return alovaInstance.Post('/api/billing/recharge', data);
}

export const getBillingTransactions = (params: {
  page?: number;
  pageSize?: number;
  type?: string;
  search?: string;
  dateRange?: string[];
}) => {
  return alovaInstance.Get<{
    total: number;
    list: TransactionRecord[];
    page: number;
    pageSize: number;
  }>('/api/billing/transactions', { params });
};

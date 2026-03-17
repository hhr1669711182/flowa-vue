import { alovaInstance } from '@/services/alova';

export interface ExceptionRecord {
  id: string;
  orderId: string;
  approvedDate: string;
  trackingNo: string;
  type: string;
  total: string;
}

export interface ExceptionStats {
  creditRemaining: string;
  creditTotal: string;
  creditPercent: number;
  reservedCredits: string;
  availableCredits: string;
  reservedAmount: string;
  totalSavings: string;
  savingsPercent: string;
  progressItems: Array<{
    label: string;
    value: string;
    percent: number;
    color: string;
  }>;
}

export const getExceptionList = (params: {
  page?: number;
  pageSize?: number;
  search?: string;
  dateRange?: string[];
  type?: string;
}) => {
  return alovaInstance.Get<{
    total: number;
    list: ExceptionRecord[];
    page: number;
    pageSize: number;
  }>('/api/billing/exception/list', { params });
};

export const getExceptionStats = () => {
  return alovaInstance.Get<ExceptionStats>('/api/billing/exception/stats');
};

export const exportExceptionBilling = (params: any) => {
  return alovaInstance.Post<{ url: string }>('/api/billing/exception/export', params);
};

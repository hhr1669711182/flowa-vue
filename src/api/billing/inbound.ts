import { alovaInstance } from '@/services/alova';

export interface InboundRecord {
  id: string;
  inboundId: string;
  completionDate: string;
  warehouse: string;
  totalAmount: string;
  
  // Detail fields
  createDate?: string;
  forecastedDate?: string;
  completedDate?: string;
  
  // Table groups
  palletQty: number;
  palletPrice: string;
  palletSubtotal: string;
  
  boxQty: number;
  boxPrice: string;
  boxSubtotal: string;
  
  scanQty: number;
  scanPrice: string;
  scanSubtotal: string;
  
  grandTotal: string;
}

export const getInboundList = (params: {
  page?: number;
  pageSize?: number;
  search?: string;
  dateRange?: string[];
}) => {
  return alovaInstance.Get<{
    total: number;
    list: InboundRecord[];
    page: number;
    pageSize: number;
  }>('/api/billing/inbound/list', { params });
};

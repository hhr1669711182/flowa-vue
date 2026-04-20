import { alovaInstance } from '@/services/alova';
import { site } from '@/api/useAddress';
import { parseOmsBillingListResult, unwrapFrappeMessage } from '@/utils/frappeResponse';

const OMS_API = site.UU_API_OMS_UI;

export interface StorageRecord {
  id: string;
  date: string;
  warehouse: string;
  bins: number;
  pallets: number;
  total: string;
}

export const getStorageList = (params: {
  company: string;
  period_start?: string;
  period_end?: string;
  billing_cycle?: string;
  page?: number;
  pageSize?: number;
  name?: string;
  billing_date?: string;
  status?: string;
  search?: string;
  dateRange?: string[];
}) => {
  return alovaInstance.Post<{
    total: number;
    list: StorageRecord[];
    page: number;
    pageSize: number;
  }>(`${OMS_API}.get_storage_billing_list`, {
    company: params.company,
    period_start: params.period_start || params.dateRange?.[0],
    period_end: params.period_end || params.dateRange?.[1],
    billing_cycle: params.billing_cycle,
    page: params.page ?? 1,
    page_size: params.pageSize ?? 10,
    name: params.name,
    billing_date: params.billing_date,
    status: params.status,
  }, {
    transform: (raw: any) => {
      const parsed = parseOmsBillingListResult(raw);
      return {
        total: parsed.total,
        list: parsed.data as StorageRecord[],
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10
      };
    }
  });
};

export const exportStorageBilling = (params: {
  company: string;
  period_start?: string;
  period_end?: string;
  billing_cycle?: string;
  name?: string;
  billing_date?: string;
  status?: string;
}) => {
  return alovaInstance.Post<{ url: string }>(`${OMS_API}.export_storage_billing`, {
    company: params.company,
    period_start: params.period_start,
    period_end: params.period_end,
    billing_cycle: params.billing_cycle,
    name: params.name,
    billing_date: params.billing_date,
    status: params.status,
  }, {
    transform: (raw: any) => {
      const msg = unwrapFrappeMessage(raw);
      return msg as { url: string };
    }
  });
};

import { alovaInstance } from '@/services/alova'
import { site } from '@/api/useAddress'
import { parseOmsBillingListResult, unwrapFrappeMessage } from '@/utils/frappeResponse'

const OMS_API = site.UU_API_OMS_UI

export interface OutboundRecord {
  id: string
  orderId: string
  platformId: string
  fulfilledDate: string
  picking: number
  packaging: number
  shipping: number
  tax: number
  total: number
  status: 'Paid' | 'Pending' | 'Overdue' | 'Failed'
}

export interface OutboundStats {
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  price?: string
  progressItems?: Array<{
    label: string
    value: number
    total: number
    percent: number
    color: string
  }>
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
  company: string
  period_start?: string
  period_end?: string
  billing_cycle?: string
  page?: number
  pageSize?: number
  status?: string
  search?: string
  destination_country?: string
  sales_order?: string
  logistics_code?: string
  dateRange?: string[]
}) => {
  return alovaInstance.Post<{
    total: number;
    list: OutboundRecord[];
    page: number;
    pageSize: number;
  }>(`${OMS_API}.get_outbound_billing_list`, {
    company: params.company,
    period_start: params.period_start || params.dateRange?.[0],
    period_end: params.period_end || params.dateRange?.[1],
    billing_cycle: params.billing_cycle,
    page: params.page ?? 1,
    page_size: params.pageSize ?? 10,
    destination_country: params.destination_country,
    sales_order: params.search || params.sales_order,
    logistics_code: params.logistics_code,
  }, {
    transform: (raw: any) => {
      const parsed = parseOmsBillingListResult(raw)
      return {
        total: parsed.total,
        list: parsed.data as OutboundRecord[],
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10
      }
    }
  })
}

export const getOutboundStats = (params?: {
  company?: string
  period_start?: string
  period_end?: string
  months?: number
}) => {
  return alovaInstance.Post<OutboundStats>(`${OMS_API}.get_outbound_billing_dashboard`, {
    company: params?.company ?? undefined,
    period_start: params?.period_start,
    period_end: params?.period_end,
    months: params?.months ?? 6,
  }, {
    transform: (raw: any) => {
      const msg = unwrapFrappeMessage(raw)
      return msg as OutboundStats
    }
  })
}

export const exportOutboundBilling = (params: {
  company: string
  period_start?: string
  period_end?: string
  billing_cycle?: string
  search?: string
  destination_country?: string
  sales_order?: string
  logistics_code?: string
  status?: string
}) => {
  return alovaInstance.Post<{ url: string }>(`${OMS_API}.export_outbound_billing`, {
    company: params.company,
    period_start: params.period_start,
    period_end: params.period_end,
    billing_cycle: params.billing_cycle,
    sales_order: params.search || params.sales_order,
    logistics_code: params.logistics_code,
    destination_country: params.destination_country,
    status: params.status,
  }, {
    transform: (raw: any) => {
      const msg = unwrapFrappeMessage(raw)
      return msg as { url: string }
    }
  })
}

export const rechargeCredit = (data: { amount: number; company?: string }) => {
  return alovaInstance.Post<{ success: boolean }>(`${OMS_API}.create_recharge`, {
    amount: data.amount,
    company: data.company,
  }, {
    transform: (raw: any) => {
      const msg = unwrapFrappeMessage(raw) as any
      if (msg?.ok === false) throw new Error(msg.error || 'Failed to recharge')
      return { success: true, ...msg }
    }
  })
}

/** 出库费单条详情：POST get_outbound_billing_detail，参数 name（单据名） */
export const getOutboundBillingDetail = (name: string, company?: string) => {
  return alovaInstance.Post<any>(`${OMS_API}.get_outbound_billing_detail`, {
    name,
    ...(company ? { company } : {}),
  }, {
    transform: (raw: any) => {
      return unwrapFrappeMessage(raw)
    }
  })
}

/** Transaction History：从 Acct Balance Ledger 按公司查询，company 必填 */
export const getBillingTransactions = (params: {
  company?: string
  page?: number
  pageSize?: number
  type?: string
  search?: string
  dateRange?: string[]
}) => {
  const dateFrom = params.dateRange?.[0]
  const dateTo = params.dateRange?.[1]
  return alovaInstance.Post<{
    total: number;
    list: TransactionRecord[];
    page: number;
    pageSize: number;
  }>(`${OMS_API}.get_billing_transactions`, {
    company: params.company,
    page: params.page ?? 1,
    page_size: params.pageSize ?? 10,
    type_filter: params.type || undefined,
    search: params.search || undefined,
    date_from: dateFrom,
    date_to: dateTo,
  }, {
    transform: (raw: any) => {
      const parsed = parseOmsBillingListResult(raw)
      return {
        total: parsed.total,
        list: parsed.data as TransactionRecord[],
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10
      }
    }
  })
}

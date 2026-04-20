import { alovaInstance } from '@/services/alova'
import { site } from '@/api/useAddress'

const OMS_API = site.UU_API_OMS_UI

export interface ExceptionRecord {
  id: string
  orderId: string
  approvedDate: string
  trackingNo: string
  type: string
  total: string
}

export interface ExceptionStats {
  creditRemaining: string
  creditTotal: string
  creditPercent: number
  reservedCredits: string
  availableCredits: string
  reservedAmount: string
  totalSavings: string
  savingsPercent: string
  progressItems: Array<{
    label: string
    value: string
    percent: number
    color: string
  }>
}

export const getExceptionList = (params: {
  company?: string
  period_start?: string
  period_end?: string
  billing_cycle?: string
  page?: number
  pageSize?: number
  search?: string
  dateRange?: string[]
  type?: string
}) => {
  return alovaInstance.Post<any>(`${OMS_API}.get_exception_billing_list`, {
    company: params.company,
    period_start: params.period_start || params.dateRange?.[0],
    period_end: params.period_end || params.dateRange?.[1],
    billing_cycle: params.billing_cycle,
    page: params.page ?? 1,
    page_size: params.pageSize ?? 10,
    search: params.search,
    type: params.type,
  }, {
    transform: (raw: any) => {
      const data = raw?.message ?? raw
      return {
        total: data?.total || 0,
        list: data?.list || [],
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 10
      }
    }
  })
}

export const getExceptionStats = (params?: {
  company?: string
  period_start?: string
  period_end?: string
}) => {
  return alovaInstance.Post<any>(`${OMS_API}.get_exception_billing_dashboard`, {
    company: params?.company,
    period_start: params?.period_start,
    period_end: params?.period_end,
  }, {
    transform: (raw: any) => {
      return raw?.message ?? raw
    }
  })
}

export const exportExceptionBilling = (params: {
  company?: string
  period_start?: string
  period_end?: string
  billing_cycle?: string
  type?: string
  search?: string
}) => {
  return alovaInstance.Post<any>(`${OMS_API}.export_exception_billing`, {
    company: params.company,
    period_start: params.period_start,
    period_end: params.period_end,
    billing_cycle: params.billing_cycle,
    type: params.type,
    search: params.search,
  }, {
    transform: (raw: any) => {
      return raw?.message ?? raw
    }
  })
}

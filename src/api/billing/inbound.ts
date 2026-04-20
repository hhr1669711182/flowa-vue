import { alovaInstance } from '@/services/alova'
import { site } from '@/api/useAddress'

const OMS_API = site.UU_API_OMS_UI

export interface InboundRecord {
  id: string
  inboundId: string
  completionDate: string
  warehouse: string
  totalAmount: string
  createDate?: string
  forecastedDate?: string
  completedDate?: string
  palletQty: number
  palletPrice: string
  palletSubtotal: string
  boxQty: number
  boxPrice: string
  boxSubtotal: string
  scanQty: number
  scanPrice: string
  scanSubtotal: string
  grandTotal: string
}

export const getInboundList = (params: {
  company: string
  period_start?: string
  period_end?: string
  billing_cycle?: string
  page?: number
  pageSize?: number
  search?: string
  dateRange?: string[]
}) => {
  return alovaInstance.Post<any>(`${OMS_API}.get_inbound_billing_list`, {
    company: params.company,
    period_start: params.period_start || params.dateRange?.[0],
    period_end: params.period_end || params.dateRange?.[1],
    billing_cycle: params.billing_cycle,
    page: params.page ?? 1,
    page_size: params.pageSize ?? 10,
    search: params.search,
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

export const exportInboundBilling = (params: {
  company: string
  period_start?: string
  period_end?: string
  billing_cycle?: string
  search?: string
}) => {
  return alovaInstance.Post<any>(`${OMS_API}.export_inbound_billing`, {
    company: params.company,
    period_start: params.period_start,
    period_end: params.period_end,
    billing_cycle: params.billing_cycle,
    search: params.search,
  }, {
    transform: (raw: any) => {
      return raw?.message ?? raw
    }
  })
}

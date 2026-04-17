import { alovaInstance } from '@/services/alova'
import { OMS_API } from '@/api/omsApiBase'

export const getOrders = (
  params: {
    company?: string
    order_no?: string
    sku?: string
    country?: string
    status?: string
    menu_key?: string
    page?: number
    page_size?: number
  } = {}
) => {
  return alovaInstance.Post<any>(`${OMS_API}.flowa_list_sales_orders`, {
    page: params.page ?? 1,
    page_size: params.page_size ?? 20,
    ...params,
  })
}

export const getOrderStats = (company?: string) => {
  return alovaInstance.Post<any>(`${OMS_API}.get_sales_order_counts`, company ? { company } : {})
}


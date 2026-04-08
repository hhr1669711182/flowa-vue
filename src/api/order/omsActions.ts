import { alovaInstance } from '@/services/alova'
import { OMS_API } from '@/api/omsApiBase'
import { unwrapFrappeMessage } from '@/utils/frappeResponse'

export function extractFlowaOrderActionResult(raw: unknown): {
  ok: boolean
  error?: string
  message?: string
  data?: Record<string, unknown>
} {
  const msg = unwrapFrappeMessage(raw) as Record<string, unknown> | undefined
  if (!msg || typeof msg !== 'object') return { ok: false, error: 'Invalid response' }
  if (msg.ok === false) return { ok: false, error: String(msg.error || msg.message || 'Failed') }
  if (msg.ok === true || msg.success === true) {
    const data = msg.data
    return {
      ok: true,
      message: String(msg.message || ''),
      data:
        data != null && typeof data === 'object' && !Array.isArray(data)
          ? (data as Record<string, unknown>)
          : undefined,
    }
  }
  return { ok: false, error: String(msg.error || msg.message || 'Failed') }
}

export const flowaOrderActionApprove = (p: { sales_order_name: string; company?: string }) =>
  alovaInstance.Post<unknown>(`${OMS_API}.flowa_order_action_approve`, p)

export const flowaOrderActionCancel = (p: {
  sales_order_name: string
  company?: string
  cancel_reason: string
}) => alovaInstance.Post<unknown>(`${OMS_API}.flowa_order_action_cancel`, p)

export const flowaOrderActionBlock = (p: { sales_order_name: string; company?: string }) =>
  alovaInstance.Post<unknown>(`${OMS_API}.flowa_order_action_block`, p)

export const flowaOrderActionMarkPending = (p: { sales_order_name: string; company?: string }) =>
  alovaInstance.Post<unknown>(`${OMS_API}.flowa_order_action_mark_pending`, p)

export const flowaOrderActionDuplicateOrder = (p: {
  sales_order_name: string
  company?: string
  new_delivery_date?: string
}) => alovaInstance.Post<unknown>(`${OMS_API}.flowa_order_action_duplicate_order`, p)

export const flowaOrderActionContactSupport = (p: {
  sales_order_name: string
  company?: string
  subject?: string
  message?: string
  priority?: string
}) => alovaInstance.Post<unknown>(`${OMS_API}.flowa_order_action_contact_support`, p)

export const flowaOrderActionSplitLineToNewOrder = (p: {
  sales_order_name: string
  company?: string
  item_row_name: string
  qty?: number
}) => alovaInstance.Post<unknown>(`${OMS_API}.flowa_order_action_split_line_to_new_order`, p)

export const flowaOrderActionAddLineItem = (p: {
  sales_order_name: string
  company?: string
  item_code: string
  qty: number
  uom?: string
  rate?: number
  is_gift?: boolean
}) => alovaInstance.Post<unknown>(`${OMS_API}.flowa_order_action_add_line_item`, p)

/** Merge editable fields into Sales Order.custom_shop_raw_data → shippingAddress (does not touch formatted[]). */
export const flowaOrderActionUpdateShopifyShipping = (p: {
  sales_order_name: string
  company?: string
  /** JSON string of camelCase Shopify address fields */
  shipping_updates: string
}) => alovaInstance.Post<unknown>(`${OMS_API}.flowa_order_action_update_shopify_shipping_address`, p)

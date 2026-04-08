import type { MenuButtonItem } from '@/views/components/menuButtons'

/** 与列表「⋯」菜单 item.key 一致，便于主按钮与菜单去重 */
export type OrderListPrimaryActionKey = 'approve' | 'cancel_order' | 'block_order' | 'support'

function norm(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Order is no longer cancellable (menu + avoid redundant UI). */
function isNonCancellableStatus(rawNorm: string) {
  return (
    rawNorm === 'cancelled' ||
    rawNorm === 'canceled' ||
    rawNorm === 'closed' ||
    rawNorm === 'completed'
  )
}

/** Closed / Completed: only primary Support + eye (view); no other row actions. */
export function orderListRowIsReadonlyClosedOrCompleted(row: { statusKey?: string }): boolean {
  const raw = norm(String(row?.statusKey ?? ''))
  return raw === 'closed' || raw === 'completed'
}

function isFulfilmentLike(raw: string) {
  const k = norm(raw)
  if (!k) return false
  return (
    k === 'to fulfilment' ||
    k === 'fulfilment' ||
    k === 'to fulfillment' ||
    k === 'fulfillment' ||
    k.includes('fulfilment') ||
    k.includes('fulfillment')
  )
}

/**
 * Primary action from raw ERPNext `status` (not translated display text).
 * Draft → Approve; To Deliver → Cancel; To Bill → Block (waybill intercept);
 * To Fulfilment / Fulfilment → Support;
 * Other statuses (incl. Cancelled) → Support for alignment; Closed / Completed → Support (read-only: view + support only).
 */
export function primaryActionKeyForOrderRow(row: { statusKey?: string }): OrderListPrimaryActionKey {
  const raw = norm(String(row?.statusKey ?? ''))
  if (raw === 'draft') return 'approve'
  if (raw === 'to deliver') return 'cancel_order'
  if (raw === 'to bill') return 'block_order'
  if (isFulfilmentLike(raw)) return 'support'
  return 'support'
}

export function orderListMenuItemsWithoutPrimary(
  all: MenuButtonItem[],
  row: { statusKey?: string }
): MenuButtonItem[] {
  const pk = primaryActionKeyForOrderRow(row)
  return all.filter((it) => it.key !== pk)
}

/** Whether a ⋯ menu entry is allowed for this row’s raw ERPNext status. */
export function orderListMenuItemVisibleForStatus(menuKey: string, row: { statusKey?: string }): boolean {
  const raw = norm(String(row?.statusKey ?? ''))
  // DEBUG: split / add line / duplicate — show on all statuses (incl. closed/completed) for env testing; tighten before prod.
  if (menuKey === 'split' || menuKey === 'add_item' || menuKey === 'duplicate') {
    return true
  }
  // View / edit detail drawer: always available (read-only UX for closed/completed).
  if (menuKey === 'view' || menuKey === 'edit') {
    return true
  }
  if (orderListRowIsReadonlyClosedOrCompleted(row)) {
    return false
  }
  switch (menuKey) {
    case 'cancel_order':
      return !isNonCancellableStatus(raw)
    case 'approve':
      return raw === 'draft'
    case 'block_order':
      return raw === 'to deliver' || raw === 'to bill'
    case 'mark_pending':
      return raw === 'to deliver'
    case 'tracking':
      return isFulfilmentLike(String(row?.statusKey ?? ''))
    default:
      return true
  }
}

function stripLeadingMenuDivider(items: MenuButtonItem[]): MenuButtonItem[] {
  if (!items.length) return items
  return items.map((it, i) => (i === 0 ? { ...it, dividerBefore: false } : it))
}

/** ⋯ menu: remove primary duplicate, then apply per-status visibility, then fix top divider. */
export function orderListFilteredMenuItems(
  all: MenuButtonItem[],
  row: { statusKey?: string }
): MenuButtonItem[] {
  const step = orderListMenuItemsWithoutPrimary(all, row).filter((it) =>
    orderListMenuItemVisibleForStatus(it.key, row)
  )
  return stripLeadingMenuDivider(step)
}

export function primaryActionButtonMeta(key: OrderListPrimaryActionKey): { label: string; icon: string } {
  switch (key) {
    case 'approve':
      return { label: 'Approve', icon: 'svg-icon:circle-check' }
    case 'cancel_order':
      return { label: 'Cancel', icon: 'svg-icon:circle-xmark' }
    case 'block_order':
      return { label: 'Block', icon: 'svg-icon:circle-minus' }
    case 'support':
      return { label: 'Support', icon: 'svg-icon:headphones' }
  }
}

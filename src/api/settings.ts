import { alovaInstance } from '@/services/alova';
import { OMS_API } from '@/api/omsApiBase';

export interface ProfileData {
  name: string
  account: string
  department: string
  role: string
  /** 与 get_current_user_info.roles 一致时，前端可拼接展示 */
  roles?: string[]
  email: string
  phone: string
  user_image: string
  company: string
  companies?: string[]
}

/** 个人信息查询：POST get_profile，返回当前登录用户信息 */
export const getProfile = () => {
  return alovaInstance.Post<any>(`${OMS_API}.get_profile`, {});
};

/** 密码修改：POST change_password，需传入 old_password、new_password */
export const changePassword = (data: {
  old_password: string
  new_password: string
  logout_all_sessions?: number
}) => {
  return alovaInstance.Post<any>(`${OMS_API}.change_password`, data)
}

/** 个人信息修改：POST update_profile，只更新传入的字段 */
export const updateProfile = (data: {
  full_name?: string
  first_name?: string
  last_name?: string
  middle_name?: string
  phone?: string
  mobile_no?: string
  user_image?: string
  department?: string
}) => {
  return alovaInstance.Post<any>(`${OMS_API}.update_profile`, data);
};

export interface GeneralSetting {
  id: string
  key: string
  label: string
  description: string
  value: boolean
  category: 'Inventory' | 'Orders'
}

export interface OperationLog {
  id: number
  sku: string
  actionInfo: string
  operationDetails: string
  operator: string
  date: string
}

/** 默认 General Settings（当后端不可用时的后备） */
const defaultGeneralSettings: GeneralSetting[] = [
  { id: '1', key: 'low_stock_alerts', label: 'Low Stock Alerts', description: 'Notify me when any SKU is running low on stock.', value: true, category: 'Inventory' },
  { id: '2', key: 'out_of_stock_alerts', label: 'Out-of-Stock Alerts', description: 'Notify me when an item becomes out of stock.', value: true, category: 'Inventory' },
  { id: '3', key: 'reorder_recommendations', label: 'Reorder Recommendations', description: 'Receive suggested replenishment quantities based on recent order activity.', value: true, category: 'Inventory' },
  { id: '4', key: 'order_requires_approval', label: 'Order Requires Approval', description: 'Notify me when an order is waiting for approval.', value: true, category: 'Orders' },
  { id: '5', key: 'order_needs_attention', label: 'Order in "Needs Attention"', description: 'Notify me when an order requires action.', value: true, category: 'Orders' },
  { id: '6', key: 'insufficient_inventory', label: 'Insufficient Inventory for Order', description: 'Alert me when an order includes items that are out of stock.', value: true, category: 'Orders' },
  { id: '7', key: 'order_shipped', label: 'Order Shipped', description: 'Notify me when an order has been dispatched.', value: true, category: 'Orders' },
  { id: '8', key: 'tracking_updates', label: 'Tracking Updates', description: 'Receive updates when tracking status changes.', value: true, category: 'Orders' },
];

/** General Settings：调用 api_oms_ui.get_general_settings */
export const getGeneralSettings = async (): Promise<GeneralSetting[]> => {
  try {
    const res = (await alovaInstance.Post<any>(`${OMS_API}.get_general_settings`, {}).send()) as any;
    const msg = res?.message ?? res;
    if (msg?.success && Array.isArray(msg?.data)) return msg.data;
    return [...defaultGeneralSettings];
  } catch {
    return [...defaultGeneralSettings];
  }
};

/** 更新 General Setting：调用 api_oms_ui.update_general_setting */
export const updateGeneralSetting = async (key: string, value: boolean): Promise<boolean> => {
  try {
    const res = (await alovaInstance.Post<any>(`${OMS_API}.update_general_setting`, { key, value }).send()) as any;
    const msg = res?.message ?? res;
    return msg?.success === true;
  } catch {
    return false;
  }
};

/** 默认空日志（当 /api/settings/logs 不可用时的后备） */
const defaultLogsResponse = { list: [] as OperationLog[], total: 0 };

export const getOperationLogs = async (params: { 
  page?: number, 
  pageSize?: number, 
  search?: string,
  operator?: string 
}): Promise<{ list: OperationLog[], total: number }> => {
  try {
    const res = await alovaInstance.Get<{ list: OperationLog[], total: number }>('/api/settings/logs', {
      params
    }).send();
    return (res as any)?.data ?? (res as any) ?? defaultLogsResponse;
  } catch {
    return defaultLogsResponse;
  }
};

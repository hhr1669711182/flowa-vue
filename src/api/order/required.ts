import { alovaInstance } from "@/services/alova";

export type RequiredOrderStage =
  | "Review & Fix"
  | "Warehouse Processing"
  | "Export Processing"
  | "Local Delivery";

export type RequiredOrderStatus =
  | "Need Attention"
  | "Awaiting Approval"
  | "Info Required"
  | "In Review";

export type RequiredInventoryStatus = "In Stock" | "Reserved" | "Out of Stock";

export interface RequiredOrderRecord {
  id: string;
  orderId: string;
  platformId: string;
  stage: RequiredOrderStage;
  status: RequiredOrderStatus;
  customerName: string;
  customerRegion: string;
  inventoryStatus: RequiredInventoryStatus;
  createDate: string;
  dueDate: string;
  title?: string;
  code?: string;
  deliveryStatus?: string;
  carrier?: string;
  method?: string;
  trackingNo?: string;
  warningMessage?: string;
}

export interface RequiredOrderListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  stage?: RequiredOrderStage | "";
  status?: RequiredOrderStatus | "";
  inventory?: RequiredInventoryStatus | "";
  dateRange?: [string, string] | [];
}

export interface RequiredOrderListResponse {
  total: number;
  list: RequiredOrderRecord[];
}

export const getRequiredOrderList = (params: RequiredOrderListParams) => {
  return alovaInstance.Get<RequiredOrderListResponse>("/api/orders/required", { params });
};

export const getRequiredOrderDetail = (id: string) => {
  return alovaInstance.Get<RequiredOrderRecord>("/api/orders/required/detail", {
    params: { id },
  });
};

export const approveRequiredOrder = (payload: {
  id: string;
  note?: string;
  targetStage?: RequiredOrderStage;
}) => {
  return alovaInstance.Post<{ success: boolean }>("/api/orders/required/approve", payload);
};

export const updateRequiredOrderStatus = (payload: {
  id: string;
  status: RequiredOrderStatus;
}) => {
  return alovaInstance.Post<{ success: boolean }>("/api/orders/required/status", payload);
};

export const createRequiredSupportTicket = (payload: {
  id: string;
  subject: string;
  message: string;
  priority: "High" | "Medium" | "Low";
}) => {
  return alovaInstance.Post<{ success: boolean }>("/api/orders/required/ticket", payload);
};

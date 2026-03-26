import { alovaInstance } from '@/services/alova';

export type TicketStatus =
  | 'Open'
  | 'Investigating'
  | 'Info. Required'
  | 'Awaiting Support'
  | 'Resolved'
  | 'Closed'

export type TicketPriority = 'High' | 'Medium' | 'Low'
export type TicketStage = 'Order' | 'Inventory' | 'Billing' | 'Invoices' | 'Settings'

export const TicketStageOptions: TicketStage[] = ['Order', 'Inventory', 'Billing', 'Invoices', 'Settings']

export interface ChatMessage {
  id: number
  sender: 'user' | 'support'
  senderName: string
  avatar?: string
  content: string
  timestamp: string
}

export interface Ticket {
  id: string
  ticketId: string
  stage: string
  stageDetail: string
  type: string
  status: TicketStatus
  priority: TicketPriority
  createDate: string
  updateDate: string
  dueDate: string
  dueTime: string
  dueUrgent?: boolean
  typeOfInquiry?: string
  typeId?: string
  typeDetails?: string
  notes?: string
  messages?: ChatMessage[]
}

export interface TicketsQuery {
  search?: string
  quickRange?: 'last7' | 'last30' | ''
  dateRange?: [string, string] | null
  stage?: string
  type?: string
  status?: TicketStatus | ''
  priority?: TicketPriority | ''
  page?: number
  pageSize?: number
}

export interface TicketsStats {
  High: number
  Medium: number
  Low: number
}

export interface TicketsResponse {
  list: Ticket[]
  total: number
  stats: TicketsStats
}

export interface CreateTicketPayload {
  stage: TicketStage
  stageDetail: string
  type: string
  priority: TicketPriority
  typeId?: string
  typeDetails?: string
  notes?: string
  dueDate?: string
  dueTime?: string
}

export interface UpdateTicketPayload {
  stage?: TicketStage
  stageDetail?: string
  type?: string
  priority?: TicketPriority
  status?: TicketStatus
  typeId?: string
  typeDetails?: string
  notes?: string
  dueDate?: string
  dueTime?: string
}

export interface TicketUploadPayload {
  fileName: string
  fileSize?: number
}

export interface TicketUploadResult {
  uploadId: string
  fileName: string
  status: 'uploading' | 'completed' | 'done'
}

export const getTickets = (query: TicketsQuery = {}) => {
  return alovaInstance.Get<TicketsResponse>('/api/tickets', {
    params: query
  });
}

export const getTicketDetail = (id: string) => {
  return alovaInstance.Get<Ticket | null>(`/api/tickets/${id}`);
}

export const createTicket = (payload: CreateTicketPayload) => {
  return alovaInstance.Post<Ticket>('/api/tickets', payload);
}

export const updateTicket = (id: string, payload: UpdateTicketPayload) => {
  return alovaInstance.Put<Ticket | null>(`/api/tickets/${id}`, payload);
}

export const uploadTicketFile = (payload: TicketUploadPayload) => {
  return alovaInstance.Post<TicketUploadResult>('/api/tickets/upload/start', payload);
}

export const completeTicketUpload = (uploadId: string) => {
  return alovaInstance.Post<TicketUploadResult>('/api/tickets/upload/complete', { uploadId });
}

export const overwriteTicketUpload = (uploadId: string) => {
  return alovaInstance.Post<TicketUploadResult>('/api/tickets/upload/overwrite', { uploadId });
}

export const updateTicketStatus = (id: string, status: TicketStatus) => {
  return alovaInstance.Put<boolean>(`/api/tickets/${id}/status`, { status });
}

export const deleteTicket = (id: string) => {
  return alovaInstance.Delete<boolean>(`/api/tickets/${id}`);
}

export const sendMessage = (ticketId: string, content: string) => {
  return alovaInstance.Post<ChatMessage>(`/api/tickets/${ticketId}/messages`, { content });
}

export const startTicketConversation = (ticketId: string) => {
  return alovaInstance.Post<ChatMessage>(`/api/tickets/${ticketId}/conversation/start`, {});
}

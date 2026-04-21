import { alovaInstance } from '@/services/alova';
import { useAuthStore } from '@/store/modules/auth';
import { site } from '@/api/useAddress';
import { useAppStoreWithOut } from '@/store/modules/app';

const OMS_API = site.UU_API_OMS_UI;

/** 与 DocType `problem_category` 存库值一致；界面仅展示英文 label。 */
export const TICKET_CATEGORY_OPTIONS = [
  { label: 'Logistics', value: '物流' },
  { label: 'Warehouse', value: '仓库' },
  { label: 'Billing', value: '账单' },
  { label: 'Onboarding', value: 'Onboarding' },
  { label: 'Other', value: '其他' },
] as const;

export type TicketCategoryValue = (typeof TICKET_CATEGORY_OPTIONS)[number]['value'];

/** 列表/筛选用：与后端 `enquiry_type` 一致（英文 key）。 */
export const TICKET_FILTER_CATEGORY_OPTIONS = [
  { label: 'Logistics', value: 'Logistics' },
  { label: 'Warehouse', value: 'Warehouse' },
  { label: 'Billing', value: 'Billing' },
  { label: 'Onboarding', value: 'Onboarding' },
  { label: 'Other', value: 'Other' },
  ...([
    { label: 'Order (legacy)', value: 'Order' },
    { label: 'Inventory (legacy)', value: 'Inventory' },
    { label: 'Invoices (legacy)', value: 'Invoices' },
    { label: 'Settings (legacy)', value: 'Settings' },
  ] as const),
] as const;

export type TicketStatus =
  | 'Open'
  | 'Investigating'
  | 'Info. Required'
  | 'Awaiting Support'
  | 'Resolved'
  | 'Closed';

export type TicketPriority = 'High' | 'Medium' | 'Low';
export type TicketStage = 'Order' | 'Inventory' | 'Billing' | 'Invoices' | 'Settings';
export const TicketStageOptions: TicketStage[] = ['Order', 'Inventory', 'Billing', 'Invoices', 'Settings'];

export interface ChatMessage {
  id: string;
  sender: 'user' | 'support';
  senderName: string;
  avatar?: string;
  content: string;
  timestamp: string;
  image?: string;
  fileUrl?: string;
  sentAtRaw?: string;
}

export interface Ticket {
  id: string;
  ticketId: string;
  subject?: string;
  subject_en?: string;
  subjectDisplay?: string;
  description?: string;
  description_en?: string;
  descriptionDisplay?: string;
  stage?: string;
  stageDetail?: string;
  linkedDocType?: string;
  linkedDocName?: string;
  type?: string;
  typeOfInquiry?: string;
  typeId?: string;
  problemCategory?: string;
  reasonSolution?: string;
  status: TicketStatus;
  priority: TicketPriority;
  createDate?: string;
  updateDate?: string;
  dueDate?: string;
  dueTime?: string;
  notes?: string;
  image?: string;
  fileAttachment?: string;
  createdBy?: string;
  assignedTo?: string;
  creatorDisplay?: string;
  assigneeDisplay?: string;
  messages?: ChatMessage[];
  infos?: Array<{ id: string; field: string; value: string }>;
  typeDetails?: string;
}

export interface TicketsQuery {
  search?: string;
  quickRange?: 'last7' | 'last30' | '';
  dateRange?: [string, string] | null;
  stage?: string;
  type?: string;
  status?: TicketStatus | '';
  priority?: TicketPriority | '';
  page?: number;
  pageSize?: number;
  // ---------------------------- new
}

export interface TicketsStats {
  High: number;
  Medium: number;
  Low: number;
}

export interface TicketsResponse {
  list: Ticket[];
  total: number;
  stats: TicketsStats;
}

const defaultStats: TicketsStats = { High: 0, Medium: 0, Low: 0 };

const PROBLEM_CAT_EN: Record<string, string> = {
  物流: 'Logistics',
  仓库: 'Warehouse',
  账单: 'Billing',
  Onboarding: 'Onboarding',
  其他: 'Other',
};

export function ticketAssetUrl(path: string | undefined | null): string {
  if (!path || typeof path !== 'string') return '';
  const p = path.trim();
  if (!p) return '';
  if (/^https?:\/\//i.test(p)) return p;
  const baseUrl = import.meta.env.VITE_APP_BASE_URL || '';
  return `${baseUrl}${p.startsWith('/') ? p : `/${p}`}`;
}

export function splitTicketAssetPaths(raw: string | undefined | null): string[] {
  if (raw == null || typeof raw !== 'string') return [];
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const _imgPathRe = /\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/i;

export function ticketPathLooksLikeImage(path: string): boolean {
  const p = (path || '').trim().toLowerCase();
  if (!p) return false;
  if (p.startsWith('data:image/')) return true;
  return _imgPathRe.test((p.split('?')[0] || ''));
}

export function mapTicketReplyToChatMessage(row: Record<string, unknown>): ChatMessage {
  const st = String(row.sender_type ?? '客服');
  const sender: ChatMessage['sender'] = st === '客户' ? 'user' : 'support';
  const textEn = String(row.content_en ?? '').trim();
  const textZh = String(row.content ?? '').trim();
  const content = textEn || textZh;
  const rawSent = row.sent_at != null ? String(row.sent_at) : '';
  const d = rawSent ? new Date(rawSent.replace(' ', 'T')) : new Date();
  const timestamp = Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const isMine = row.is_mine === true || row.is_mine === 1;
  let senderName = String(row.sender_display ?? '').trim();
  if (sender === 'user') {
    senderName = isMine ? 'You' : senderName || 'Customer';
  } else {
    senderName = senderName || (st === '系统' ? 'System' : 'Support');
  }
  const imageRaw = row.image != null ? String(row.image) : '';
  const fileRaw = row.file_attachment != null ? String(row.file_attachment) : '';
  return {
    id: String(row.name ?? ''),
    sender,
    senderName,
    content,
    timestamp,
    image: imageRaw ? ticketAssetUrl(imageRaw) : undefined,
    fileUrl: fileRaw ? ticketAssetUrl(fileRaw) : undefined,
    sentAtRaw: rawSent || undefined,
  };
}

export const getTicketReplies = (ticketName: string) => {
  const auth = useAuthStore();
  const company = auth.company || undefined;
  return alovaInstance.Post<ChatMessage[]>(`${OMS_API}.flowa_list_trouble_ticket_replies`, {
    trouble_ticket: ticketName,
    company,
  }, {
    transform: (raw: any) => {
      const msg = raw?.message ?? raw;
      if (!msg || typeof msg !== 'object') {
        return [];
      }
      if (msg.ok === false) {
        throw new Error(String(msg.message || 'Failed to load messages'));
      }
      if (!Array.isArray(msg.data)) {
        return [];
      }
      return (msg.data as Record<string, unknown>[]).map(mapTicketReplyToChatMessage);
    }
  });
}

export const appendTicketReply = (ticketName: string, content: string) => {
  const text = (content || '').trim();
  if (!text) {
    throw new Error('Message is empty');
  }
  const auth = useAuthStore();
  const company = auth.company || undefined;
  return alovaInstance.Post<any>(`${OMS_API}.flowa_append_trouble_ticket_reply`, {
    trouble_ticket: ticketName,
    company,
    content: text,
    content_en: text,
  }, {
    transform: (raw: any) => {
      const msg = raw?.message ?? raw;
      if (!msg || msg.ok === false) {
        throw new Error(String(msg?.message || 'Send failed'));
      }
      return msg;
    }
  });
}

function formatTicketDate(v: unknown): string {
  if (v == null || v === '') return '';
  const raw = typeof v === 'string' ? v.replace(' ', 'T') : String(v);
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return typeof v === 'string' ? v : '';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function docStatusToDisplay(status: string): TicketStatus {
  const s = status || 'Open';
  if (s === 'In Progress') return 'Investigating';
  if (s === 'Waiting Reply') return 'Awaiting Support';
  return s as TicketStatus;
}

function categoryEnglishFromDoc(row: Record<string, unknown>): string {
  const en = row.problem_category_en != null ? String(row.problem_category_en).trim() : '';
  if (en) return en;
  const cat = String(row.problem_category ?? '');
  return PROBLEM_CAT_EN[cat] || cat;
}

function ticketUserCell(display: unknown, link: unknown): string {
  const d = display != null ? String(display).trim() : '';
  if (d) return d;
  const l = link != null ? String(link).trim() : '';
  return l || '—';
}

function mapDocToTicket(row: Record<string, unknown>): Ticket {
  const name = String(row.name ?? '');
  const desc = String(row.description ?? '');
  const descEn = String(row.description_en ?? '');
  const subj = String(row.subject ?? '');
  const subjEn = String(row.subject_en ?? '');
  const st = String(row.status ?? 'Open');
  const refDt = row.reference_doctype != null ? String(row.reference_doctype) : '';
  const refName = String(row.reference_name ?? '');
  const catEn = categoryEnglishFromDoc(row);
  const descDisplay = (descEn || desc).trim();
  const subjDisplay = (subjEn || subj).trim();

  return {
    id: name,
    ticketId: name,
    subject: subj,
    subject_en: subjEn || undefined,
    subjectDisplay: subjDisplay || subj,
    description: desc || undefined,
    description_en: descEn || undefined,
    descriptionDisplay: descDisplay || undefined,
    linkedDocType: refDt || undefined,
    linkedDocName: refName || undefined,
    stage: refDt || undefined,
    stageDetail: refName || undefined,
    type: catEn,
    typeOfInquiry: catEn,
    typeId: refName || undefined,
    problemCategory: String(row.problem_category ?? ''),
    reasonSolution: row.reason_solution != null ? String(row.reason_solution) : undefined,
    status: docStatusToDisplay(st),
    priority: (String(row.priority || 'Medium') as TicketPriority) || 'Medium',
    createDate: formatTicketDate(row.created_at ?? row.creation),
    updateDate: formatTicketDate(row.modified),
    notes: descDisplay || undefined,
    image: row.image != null ? String(row.image) : undefined,
    fileAttachment: row.file_attachment != null ? String(row.file_attachment) : undefined,
    createdBy: row.created_by != null ? String(row.created_by) : undefined,
    assignedTo: row.assigned_to != null ? String(row.assigned_to) : undefined,
    creatorDisplay: ticketUserCell(row.created_by_display, row.created_by),
    assigneeDisplay: ticketUserCell(row.assigned_to_display, row.assigned_to),
    messages: [],
  };
}

function normalizeStats(raw: unknown): TicketsStats {
  if (raw != null && typeof raw === 'object' && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    return {
      High: Number(o.High ?? 0) || 0,
      Medium: Number(o.Medium ?? 0) || 0,
      Low: Number(o.Low ?? 0) || 0,
    };
  }
  return { ...defaultStats };
}

function parseListPayload(raw: unknown): { list: Record<string, unknown>[]; total: number; stats: TicketsStats } {
  const msg = (raw as any)?.message ?? raw;
  const p =
    msg && typeof msg === 'object' && ('data' in msg || 'total' in msg)
      ? msg
      : (raw as Record<string, unknown>);
  const list = Array.isArray(p?.data) ? (p.data as Record<string, unknown>[]) : [];
  const total = Number(p?.total ?? 0) || 0;
  const stats = normalizeStats(p?.stats);
  return { list, total, stats };
}

export const getTickets = (query: TicketsQuery & { company?: string } = {}) => {
  const auth = useAuthStore();
  const company = (query.company?.trim() ? query.company.trim() : auth.company) || undefined;
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;

  return alovaInstance.Post<TicketsResponse>(`${OMS_API}.flowa_list_trouble_tickets`, {
    company,
    search: query.search || '',
    status: query.status || '',
    enquiry_type: query.type || '',
    priority: query.priority || '',
    quick_range: query.quickRange === 'last7' ? 'last7' : '',
    date_from: query.dateRange?.[0] || '',
    date_to: query.dateRange?.[1] || '',
    page,
    page_size: pageSize,
  }, {
    transform: (raw: any) => {
      const { list, total, stats } = parseListPayload(raw);
      return {
        list: list.map(mapDocToTicket),
        total,
        stats,
      };
    }
  });
};

export const getTicketDetail = (name: string) => {
  const auth = useAuthStore();
  const company = auth.company || undefined;
  return alovaInstance.Post<Ticket | null>(`${OMS_API}.flowa_get_trouble_ticket`, { name, company }, {
    transform: (raw: any) => {
      const msg = raw?.message ?? raw;
      if (!msg || typeof msg !== 'object' || msg.ok === false || !msg.data) return null;
      return mapDocToTicket(msg.data as Record<string, unknown>);
    }
  });
};

export type CreateTicketPayload = {
  subject: string;
  description?: string;
  subject_en?: string;
  description_en?: string;
  company?: string;
  problem_category: string;
  problem_category_en?: string;
  priority?: TicketPriority;
  assigned_to?: string;
  reference_doctype?: '' | 'Sales Order' | 'Material Request';
  reference_name?: string;
  image?: string;
  file_attachment?: string;
  stage?: string;
  stageDetail?: string;
  type?: string;
};

export type TroubleTicketRefSuggestion = { value: string; label: string; description: string };

export const searchTroubleTicketReferences = (p: {
  reference_doctype: 'Sales Order' | 'Material Request';
  txt?: string;
  limit?: number;
}) => {
  const auth = useAuthStore();
  const company = auth.company || undefined;
  return alovaInstance.Post<TroubleTicketRefSuggestion[]>(`${OMS_API}.flowa_search_trouble_ticket_reference`, {
    company,
    reference_doctype: p.reference_doctype,
    txt: p.txt ?? '',
    limit: p.limit ?? 20,
  }, {
    transform: (raw: any) => {
      const msg = raw?.message ?? raw;
      if (!msg || typeof msg !== 'object' || msg.ok === false || !Array.isArray(msg.data)) {
        return [];
      }
      return (msg.data as unknown[]).map((row) => {
        const o = row as Record<string, unknown>;
        const v = String(o.value ?? o.label ?? '');
        return {
          value: v,
          label: String(o.label ?? v),
          description: String(o.description ?? ''),
        };
      });
    }
  });
}

export const suggestTroubleTicketAssignee = (p: {
  company?: string;
  problem_category: string;
}) => {
  const auth = useAuthStore();
  const company = (p.company?.trim() || auth.company || '').trim();
  if (!company) {
    throw new Error('Company is required');
  }
  return alovaInstance.Post<string>(`${OMS_API}.flowa_suggest_trouble_ticket_assignee`, {
    company,
    problem_category: p.problem_category ?? '',
  }, {
    transform: (raw: any) => {
      const msg = raw?.message ?? raw;
      if (!msg || msg.ok === false) {
        throw new Error(String(msg?.message || 'Suggest assignee failed'));
      }
      const data = msg.data as Record<string, unknown> | undefined;
      const id = data?.assigned_to != null ? String(data.assigned_to).trim() : '';
      return id || 'Administrator';
    }
  });
}

export const createTicket = (payload: CreateTicketPayload) => {
  const auth = useAuthStore();
  const company = (payload.company?.trim() || auth.company || '').trim();
  if (!company) {
    throw new Error('Company is required');
  }
  const subj = (payload.subject || '').trim();
  if (!subj) {
    throw new Error('Subject is required');
  }
  const desc = (payload.description || '').trim();
  const subjEn = (payload.subject_en || '').trim() || subj;
  const descEn = (payload.description_en || '').trim() || desc;
  const rd = (payload.reference_doctype || '').trim();
  const rn = (payload.reference_name || '').trim();

  return alovaInstance.Post<any>(`${OMS_API}.flowa_create_trouble_ticket`, {
    company,
    subject: subj,
    subject_en: subjEn,
    description: desc,
    description_en: descEn,
    problem_category: payload.problem_category,
    problem_category_en: payload.problem_category_en || '',
    priority: payload.priority || 'Medium',
    reference_doctype: rd,
    reference_name: rn,
    image: (payload.image || '').trim(),
    file_attachment: (payload.file_attachment || '').trim(),
    assigned_to: (payload.assigned_to || '').trim(),
    stage: payload.stage || '',
    stage_detail: payload.stageDetail || '',
    enquiry_type: payload.type || '',
  }, {
    transform: (raw: any) => {
      const msg = raw?.message ?? raw;
      if (!msg || msg.ok === false) {
        throw new Error(String(msg?.message || 'Create failed'));
      }
      return msg;
    }
  });
};

export const uploadTicketAttachment = (file: File) => {
  const fd = new FormData();
  fd.append('file', file, file.name);
  fd.append('is_private', '1');

  return alovaInstance.Post<string>('upload_file', fd, {
    headers: {
      // Content-Type 留空，让浏览器自动设置 FormData 的 Content-Type (带 boundary)
    },
    transform: (raw: any) => {
      const message = raw?.message ?? raw;
      if (message && typeof message === 'object' && typeof message.file_url === 'string') {
        return message.file_url;
      }
      throw new Error('Upload failed: no file_url');
    }
  });
}

export const updateTicketStatus = (name: string, status: TicketStatus) => {
  const auth = useAuthStore();
  const company = auth.company || undefined;
  return alovaInstance.Post<any>(`${OMS_API}.flowa_update_trouble_ticket_status`, {
    name,
    status,
    company,
  }, {
    transform: (raw: any) => {
      const msg = raw?.message ?? raw;
      if (!msg || msg.ok === false) {
        throw new Error(String(msg?.message || 'Update failed'));
      }
      return msg;
    }
  });
};

export const sendMessage = (ticketId: string, content: string) => appendTicketReply(ticketId, content);

export const startTicketConversation = (ticketId: string) => {
  // A placeholder to keep compatibility with flowa-vue components
  return alovaInstance.Post<ChatMessage>(`${OMS_API}.flowa_append_trouble_ticket_reply`, {
    trouble_ticket: ticketId,
    content: 'Conversation started',
    content_en: 'Conversation started',
  }, {
    transform: (raw: any) => {
      const msg = raw?.message ?? raw;
      if (!msg || msg.ok === false) {
        throw new Error(String(msg?.message || 'Send failed'));
      }
      return mapTicketReplyToChatMessage(msg as any);
    }
  });
};

export const deleteTicket = (id: string) => {
  if (useAppStoreWithOut().useMock) {
    return alovaInstance.Delete<any>(`/api/resource/Trouble Ticket/${id}`);
  }
};

export const updateTicket = (id: string, payload: any) => {
  if (useAppStoreWithOut().useMock) {
    return alovaInstance.Put<any>(`/api/resource/Trouble Ticket/${id}`, payload);
  }

  // 假接口
  return alovaInstance.Put<any>(`/api/resource/Trouble Ticket/${id}`, payload);
};

export interface TicketUploadPayload {
  fileName: string;
  fileSize?: number;
}

export interface TicketUploadResult {
  uploadId: string;
  fileName: string;
  status: 'uploading' | 'completed' | 'done';
}

export const uploadTicketFile = async (payload: TicketUploadPayload) => {
  // Mock implementation for TicketUploadFlowDialog
  return { uploadId: 'mock-id', fileName: payload.fileName, status: 'uploading' };
};

export const completeTicketUpload = async (uploadId: string) => {
  // Mock implementation for TicketUploadFlowDialog
  return { uploadId, fileName: 'mock', status: 'completed' };
};

export const overwriteTicketUpload = async (uploadId: string) => {
  // Mock implementation for TicketUploadFlowDialog
  return { uploadId, fileName: 'mock', status: 'done' };
};

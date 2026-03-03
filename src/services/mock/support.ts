import { defineMock } from '@alova/mock';

type TicketStatus =
  | 'Open'
  | 'Investigating'
  | 'Info. Required'
  | 'Awaiting Support'
  | 'Resolved'
  | 'Closed'

type TicketPriority = 'High' | 'Medium' | 'Low'

interface ChatMessage {
  id: number
  sender: 'user' | 'support'
  senderName: string
  avatar?: string
  content: string
  timestamp: string
}

interface Ticket {
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

interface TicketsStats {
  High: number
  Medium: number
  Low: number
}

// Seed Data
const nowTime = () => {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const seedTickets = (): Ticket[] => {
  const base: Omit<Ticket, 'id' | 'priority' | 'status' | 'dueUrgent'>[] = [
    {
      ticketId: 'Ticket X0123',
      stage: 'Order',
      stageDetail: 'Order ID X12345',
      type: 'General Issue',
      createDate: '00/00/2026',
      updateDate: '00/00/2026',
      dueDate: '00/00/2026',
      dueTime: '20:12:05',
      typeOfInquiry: 'Address Error',
      typeId: 'Order ID X12345',
      typeDetails: 'Incorrect street number provided',
      notes: 'Additional notes regarding the incorrect street number.',
      messages: [
        {
          id: 1,
          sender: 'user',
          senderName: 'Evan Su',
          content:
            'Hi 👋\nWe need your help to continue processing Order X12345.\nStage: Warehouse Processing\nIssue: Address Error\nCreated: 00/00/2026 | Due: 00/00/2026\n\nThe shipping address is incomplete or incorrect.\nPlease review and send us the correct address so we can move the order forward.\nThanks! Let us know if you need any help 😊',
          timestamp: '20:12',
        },
        {
          id: 2,
          sender: 'support',
          senderName: 'You',
          content: 'Hi, thanks for the heads-up.',
          timestamp: '20:12',
        },
        {
          id: 3,
          sender: 'support',
          senderName: 'You',
          content:
            "Here's the corrected address:\n1 - 20 Haro Street, Sydney Australia, 9543.",
          timestamp: '20:12',
        },
        {
          id: 4,
          sender: 'support',
          senderName: 'You',
          content: 'Please proceed. Thanks!',
          timestamp: '20:12',
        },
      ],
    },
    {
      ticketId: 'Ticket X0123',
      stage: 'Inventory',
      stageDetail: 'SKU ID X12345',
      type: 'Miss Information',
      createDate: '00/00/2026',
      updateDate: '00/00/2026',
      dueDate: '00/00/2026',
      dueTime: '45:12:05',
      typeOfInquiry: 'Stock Mismatch',
      typeId: 'SKU ID X12345',
      typeDetails: 'Physical count does not match system record',
      notes: 'Please verify count in warehouse B.',
    },
    {
      ticketId: 'Ticket X0123',
      stage: 'Billing',
      stageDetail: 'Service X0123',
      type: 'General Issue',
      createDate: '00/00/2026',
      updateDate: '00/00/2026',
      dueDate: '00/00/2026',
      dueTime: '20:12:05',
      typeOfInquiry: 'Payment Failure',
      typeId: 'Service X0123',
      typeDetails: 'Credit card declined',
      notes: 'Customer needs to update payment method.',
    },
    {
      ticketId: 'Ticket X0123',
      stage: 'Invoices',
      stageDetail: 'Invoice X0123',
      type: 'Unpaid Invoice',
      createDate: '00/00/2026',
      updateDate: '00/00/2026',
      dueDate: '00/00/2026',
      dueTime: '45:12:05',
    },
    {
      ticketId: 'Ticket X0123',
      stage: 'Settings',
      stageDetail: 'Evan Su Profile',
      type: 'Profile',
      createDate: '00/00/2026',
      updateDate: '00/00/2026',
      dueDate: '00/00/2026',
      dueTime: '45:12:05',
    },
    {
      ticketId: 'Ticket X0123',
      stage: 'Order',
      stageDetail: 'Order ID X12345',
      type: 'Address Error',
      createDate: '00/00/2026',
      updateDate: '00/00/2026',
      dueDate: '00/00/2026',
      dueTime: '45:12:05',
    },
  ]

  const priorities: TicketPriority[] = [
    ...Array.from({ length: 8 }).map(() => 'High' as const),
    ...Array.from({ length: 10 }).map(() => 'Medium' as const),
    ...Array.from({ length: 4 }).map(() => 'Low' as const),
  ]

  const statuses: TicketStatus[] = [
    'Open',
    'Investigating',
    'Info. Required',
    'Awaiting Support',
    'Resolved',
    'Closed',
  ]

  const list: Ticket[] = []
  for (let i = 0; i < priorities.length; i++) {
    const t = base[i % base.length]
    const priority = priorities[i]!
    const status = statuses[i % statuses.length]!
    list.push({
      ...(t as Ticket),
      id: String(i + 1),
      priority,
      status,
      dueUrgent: priority === 'High' || status === 'Info. Required',
    })
  }
  return list
}

let ticketsDb: Ticket[] = seedTickets()

const calcStats = (tickets: Ticket[]): TicketsStats => {
  return tickets.reduce(
    (acc, t) => {
      acc[t.priority] += 1
      return acc
    },
    { High: 0, Medium: 0, Low: 0 } as TicketsStats,
  )
}

const applyFilters = (tickets: Ticket[], query: any) => {
  const { search, stage, type, status } = query
  let filtered = [...tickets]

  if (stage) filtered = filtered.filter((t) => t.stage === stage)
  if (type) filtered = filtered.filter((t) => t.type === type)
  if (status) filtered = filtered.filter((t) => t.status === status)

  if (search) {
    const q = search.trim().toLowerCase()
    if (q) {
      filtered = filtered.filter((t) => {
        return (
          t.ticketId.toLowerCase().includes(q) ||
          t.stage.toLowerCase().includes(q) ||
          t.stageDetail.toLowerCase().includes(q) ||
          t.type.toLowerCase().includes(q)
        )
      })
    }
  }

  return filtered
}

export const mockSupport = defineMock({
  // GET /tickets
  '[GET]/api/tickets': ({ query }) => {
    const page = parseInt(query.page || '1');
    const pageSize = parseInt(query.pageSize || '10');
    
    const filteredBase = applyFilters(ticketsDb, query);
    const stats = calcStats(filteredBase);
    
    let filtered = [...filteredBase];
    if (query.priority) {
      filtered = filtered.filter((t) => t.priority === query.priority);
    }
    
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const list = filtered.slice(start, end);
    
    return {
      list,
      total,
      stats
    };
  },
  
  // GET /tickets/:id
  '[GET]/api/tickets/{id}': ({ params }) => {
    return ticketsDb.find((t) => t.id === params.id) || null;
  },
  
  // POST /tickets
  '[POST]/api/tickets': ({ data }) => {
    const id = String(Date.now());
    const ticket: Ticket = {
      id,
      ticketId: 'Ticket X0123',
      stage: data.stage,
      stageDetail: data.stageDetail,
      type: data.type,
      status: 'Open',
      priority: data.priority,
      createDate: '00/00/2026',
      updateDate: '00/00/2026',
      dueDate: '00/00/2026',
      dueTime: '20:12:05',
      dueUrgent: data.priority === 'High',
      typeOfInquiry: data.type,
      typeId: data.stageDetail,
      typeDetails: 'N/A',
      notes: 'Additional notes regarding the ticket.',
      messages: [],
    };
    ticketsDb = [ticket, ...ticketsDb];
    return ticket;
  },
  
  // PUT /tickets/:id/status
  '[PUT]/api/tickets/{id}/status': ({ params, data }) => {
    const target = ticketsDb.find((t) => t.id === params.id);
    if (!target) return false;
    
    target.status = data.status;
    target.updateDate = '00/00/2026';
    target.dueUrgent = target.priority === 'High' || data.status === 'Info. Required';
    return true;
  },
  
  // DELETE /tickets/:id
  '[DELETE]/api/tickets/{id}': ({ params }) => {
    const before = ticketsDb.length;
    ticketsDb = ticketsDb.filter((t) => t.id !== params.id);
    return before !== ticketsDb.length;
  },
  
  // POST /tickets/:id/messages
  '[POST]/api/tickets/{id}/messages': ({ params, data }) => {
    const msg: ChatMessage = {
      id: Date.now(),
      sender: 'support',
      senderName: 'You',
      content: data.content,
      timestamp: nowTime(),
    };
    
    const ticket = ticketsDb.find((t) => t.id === params.id);
    if (ticket) {
      if (!ticket.messages) ticket.messages = [];
      ticket.messages.push(msg);
    }
    
    return msg;
  }
});

import { defineMock } from '@alova/mock';

const progressItems = [
  {
    label: "Available",
    value: 2400,
    total: 4250,
    percent: 88,
    color: "var(--color-brand-secondary)",
  },
  {
    label: "Reserved",
    value: 1850,
    total: 4250,
    percent: 38,
    color: "var(--color-brand-primary-pumpkin)",
  },
];

const orderSummary = [
  { label: 'Pending', percent: 70, orders: 45, color: 'var(--el-color-warning)' },
  { label: 'In Process', percent: 70, orders: 160, color: 'var(--el-color-primary)' },
  { label: 'Delivered', percent: 80, orders: 225, color: 'var(--el-color-success)' }
];

const notifications = [
  {
    id: 1,
    title: "Order #X12345 Requires Your Action",
    time: "5 hours ago",
    iconType: "ShoppingCart",
    bg: "#EEF2FF",
    unread: true,
  },
  {
    id: 2,
    title: "SKU #X12345 is Running Low",
    time: "2 hours ago",
    iconType: "Box",
    bg: "#EEF2FF",
    unread: true,
  },
  {
    id: 3,
    title: "Your Flowa Credit is Running Low",
    time: "8 hours ago",
    iconType: "CreditCard",
    bg: "#EEF2FF",
    unread: true,
  },
  {
    id: 4,
    title: "Payment has been successfully received.",
    time: "12 hours ago",
    iconType: "Document",
    bg: "#F5F7FF",
    unread: true,
  },
  {
    id: 5,
    title: "New Reply on Ticket #SUP-1023",
    time: "24 hours ago",
    iconType: "Message",
    bg: "#F5F7FF",
    unread: true,
  },
  {
    id: 6,
    title: "Your Password was Updated",
    time: "32 hours ago",
    iconType: "Lock",
    bg: "#F5F7FF",
    unread: false,
  },
];

const recentOrders = [
  {
    id: 1,
    title: "Order X012345",
    code: "LGF20241212",
    action: "Review & Fix",
    status: "Awaiting Approval",
    statusNote: "",
    image: "https://via.placeholder.com/40",
  },
  {
    id: 2,
    title: "Order X012346",
    code: "LGF20241213",
    action: "Review & Fix",
    status: "Need Attention",
    statusNote: "Address Error",
    image: "https://via.placeholder.com/40",
  },
  {
    id: 3,
    title: "Order X012347",
    code: "LGF20241214",
    action: "Review & Fix",
    status: "Need Attention",
    statusNote: "Out of Stock",
    image: "https://via.placeholder.com/40",
  },
  {
    id: 4,
    title: "Order X012348",
    code: "LGF20241215",
    action: "Review & Fix",
    status: "Need Attention",
    statusNote: "Info Missing",
    image: "https://via.placeholder.com/40",
  },
  {
    id: 5,
    title: "Order X012349",
    code: "LGF20241216",
    action: "Review & Fix",
    status: "Need Attention",
    statusNote: "Issue Detected",
    image: "https://via.placeholder.com/40",
  },
  {
    id: 6,
    title: "Order X012350",
    code: "LGF20241217",
    action: "Export Processing",
    status: "Need Attention",
    statusNote: "Wrong Declaration",
    image: "https://via.placeholder.com/40",
  },
];

export default defineMock({
  '[GET]/api/dashboard/stats': () => {
    return {
      price: "$14,000",
      progressItems,
      orderSummary,
    };
  },
  '[GET]/api/dashboard/notifications': () => {
    return notifications;
  },
  '[GET]/api/dashboard/recent-orders': () => {
    return recentOrders;
  }
});
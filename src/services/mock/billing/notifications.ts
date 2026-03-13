import { defineMock } from '@alova/mock';

export const mockBillingNotifications = defineMock({
  '/api/billing/notifications': () => {
    return [
      {
        id: 1,
        title: "Invoice #INV-2024001 Generated",
        time: "2 hours ago",
        iconType: "Document",
        bg: "#EEF2FF",
        unread: true,
      },
      {
        id: 2,
        title: "Credit Balance Low",
        time: "5 hours ago",
        iconType: "CreditCard",
        bg: "#FFF7ED",
        unread: true,
      },
      {
        id: 3,
        title: "Payment Received",
        time: "1 day ago",
        iconType: "Money",
        bg: "#ECFDF5",
        unread: false,
      }
    ];
  },

  '[POST]/api/billing/notifications/read': () => {
    return { ok: true };
  }
});

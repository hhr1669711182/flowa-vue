import { defineMock } from '@alova/mock';

export const mockBillingOrders = defineMock({
  '/api/billing/recent-orders': () => {
    return [
      {
        id: 1,
        title: "Service X0123",
        code: "Approved Date 00/00/2026",
        action: "Service Type",
        status: "Pending",
        statusNote: "$0.00",
        image: "https://via.placeholder.com/40",
      },
      {
        id: 2,
        title: "Service X0123",
        code: "Approved Date 00/00/2026",
        action: "Service Type",
        status: "Paid",
        statusNote: "$0.00",
        image: "https://via.placeholder.com/40",
      },
      {
        id: 3,
        title: "Service X0123",
        code: "Approved Date 00/00/2026",
        action: "Service Type",
        status: "Failed",
        statusNote: "$0.00",
        image: "https://via.placeholder.com/40",
      },
      {
        id: 4,
        title: "Service X0123",
        code: "Approved Date 00/00/2026",
        action: "Service Type",
        status: "Failed",
        statusNote: "$0.00",
        image: "https://via.placeholder.com/40",
      },
      {
        id: 5,
        title: "Service X0123",
        code: "Approved Date 00/00/2026",
        action: "Service Type",
        status: "Failed",
        statusNote: "$0.00",
        image: "https://via.placeholder.com/40",
      },
      {
        id: 6,
        title: "Service X0123",
        code: "Approved Date 00/00/2026",
        action: "Service Type",
        status: "Failed",
        statusNote: "$0.00",
        image: "https://via.placeholder.com/40",
      }
    ];
  }
});

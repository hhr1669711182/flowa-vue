import { defineMock } from '@alova/mock';

export const mockBillingOrders = defineMock({
  '/api/billing/recent-orders': ({ query }) => {
    const page = parseInt(query.page || '1');
    const pageSize = parseInt(query.pageSize || '10');
    
    // Generate 50 mock items
    const list = Array.from({ length: 50 }).map((_, index) => ({
      id: index + 1,
      title: "Order X012345",
      code: "00/00/2026",
      action: "$0,00",
      status: "$0,00",
      statusNote: "$0,00",
      shipping: "$0,00",
      tax: "$0,00",
      grandTotal: "$0,00",
      image: "https://via.placeholder.com/40",
      
      // Detail fields
      deliveryStatus: "Delivered",
      trackingNo: "0123456789",
      carrier: "Australia Post / 3J85",
      method: "Regular Shipping",
      itemQuantity: "04",
      chargingWeight: "4,0 kg",
      
      // Cost breakdown
      pickingFirst: "00",
      pickingAdditional: "$0,00",
      packagingUsed: "Pack",
      packagingCost: "$0,00",
      shippingCost: "$0,00",
      docFee: "$0,00",
      taxVat: "$0,00",
      taxSurcharge: "$0,00"
    }));

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      total: list.length,
      list: list.slice(start, end),
      page,
      pageSize
    };
  },

  '/api/billing/recent-orders/{id}': ({ params }) => {
    return {
      id: parseInt(params.id),
      title: "Order X012345",
      code: "00/00/2026",
      action: "$0,00",
      status: "$0,00",
      statusNote: "$0,00",
      shipping: "$0,00",
      tax: "$0,00",
      grandTotal: "$0,00",
      image: "https://via.placeholder.com/40",
      
      // Detail fields
      deliveryStatus: "Delivered",
      trackingNo: "0123456789",
      carrier: "Australia Post / 3J85",
      method: "Regular Shipping",
      itemQuantity: "04",
      chargingWeight: "4,0 kg",
      
      // Cost breakdown
      pickingFirst: "00",
      pickingAdditional: "$0,00",
      packagingUsed: "Pack",
      packagingCost: "$0,00",
      shippingCost: "$0,00",
      docFee: "$0,00",
      taxVat: "$0,00",
      taxSurcharge: "$0,00"
    };
  }
});

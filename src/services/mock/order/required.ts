import { defineMock } from "@alova/mock";
import type {
  RequiredInventoryStatus,
  RequiredOrderRecord,
  RequiredOrderStage,
  RequiredOrderStatus,
} from "@/api/order/required";

const stagePool: RequiredOrderStage[] = [
  "Review & Fix",
  "Warehouse Processing",
  "Export Processing",
  "Local Delivery",
];

const statusPool: RequiredOrderStatus[] = [
  "Need Attention",
  "Awaiting Approval",
  "Info Required",
  "In Review",
];

const inventoryPool: RequiredInventoryStatus[] = ["In Stock", "Reserved", "Out of Stock"];

const formatDate = (date: Date) => {
  const mm = `${date.getMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
};

const randomDate = (from: Date, to: Date) => {
  const ts = from.getTime() + Math.random() * (to.getTime() - from.getTime());
  return new Date(ts);
};

const seedRequiredOrders = (): RequiredOrderRecord[] => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  return Array.from({ length: 86 }).map((_, index) => {
    const created = randomDate(start, now);
    const due = new Date(created);
    due.setDate(created.getDate() + ((index % 7) + 1));
    const stage = stagePool[index % stagePool.length]!;
    const status = statusPool[index % statusPool.length]!;
    return {
      id: `RQ-${1300 + index}`,
      orderId: `Order X${(12345 + index).toString().padStart(6, "0")}`,
      platformId: `LGF${20242000 + index}`,
      stage,
      status,
      customerName: ["Evan Su", "Olivia Hall", "Noah Lee", "Liam Carter", "Mia Allen"][index % 5]!,
      customerRegion: ["UK/England", "US/California", "AU/Sydney", "CA/Ontario", "DE/Berlin"][index % 5]!,
      inventoryStatus: inventoryPool[index % inventoryPool.length]!,
      createDate: formatDate(created),
      dueDate: formatDate(due),
      title: `Order X${(12345 + (index % 50)).toString().padStart(6, "0")}`,
      code: "February 20,2025 at 12:34",
      deliveryStatus: status,
      carrier: ["Australia Post / 3J85", "DHL / 8H12", "FedEx / 2A31"][index % 3]!,
      method: ["Regular Shipping", "Express Shipping"][index % 2]!,
      trackingNo: `012345${(6789 + index).toString().padStart(4, "0")}`,
      warningMessage: "Action Required detected. Please review and fix the requirements or Contact Support to proceed.",
    };
  });
};

let requiredOrdersDb: RequiredOrderRecord[] = seedRequiredOrders();

export default defineMock({
  "/api/orders/required": ({ query }) => {
    const page = parseInt(query.page || "1", 10);
    const pageSize = parseInt(query.pageSize || "10", 10);
    const keyword = (query.keyword || "").toLowerCase();
    const stage = query.stage || "";
    const status = query.status || "";
    const inventory = query.inventory || "";
    const dateRange = query.dateRange;

    let filtered = [...requiredOrdersDb];

    if (keyword) {
      filtered = filtered.filter(
        (item) =>
          item.orderId.toLowerCase().includes(keyword) ||
          item.platformId.toLowerCase().includes(keyword) ||
          (item.trackingNo || "").toLowerCase().includes(keyword),
      );
    }

    if (stage) filtered = filtered.filter((item) => item.stage === stage);
    if (status) filtered = filtered.filter((item) => item.status === status);
    if (inventory) filtered = filtered.filter((item) => item.inventoryStatus === inventory);

    if (Array.isArray(dateRange) && dateRange.length === 2) {
      const [from, to] = dateRange;
      filtered = filtered.filter((item) => item.createDate >= from && item.createDate <= to);
    }

    filtered.sort((a, b) => (a.createDate > b.createDate ? -1 : 1));
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const list = filtered.slice(start, start + pageSize);
    return { total, list, page, pageSize };
  },

  "/api/orders/required/detail": ({ query }) => {
    return requiredOrdersDb.find((item) => item.id === query.id) || requiredOrdersDb[0];
  },

  "[POST]/api/orders/required/approve": ({ data }) => {
    requiredOrdersDb = requiredOrdersDb.map((item) =>
      item.id === data.id
        ? {
            ...item,
            status: "In Review",
            deliveryStatus: "In Review",
            stage: data.targetStage || item.stage,
          }
        : item,
    );
    return { success: true };
  },

  "[POST]/api/orders/required/status": ({ data }) => {
    requiredOrdersDb = requiredOrdersDb.map((item) =>
      item.id === data.id
        ? {
            ...item,
            status: data.status || item.status,
            deliveryStatus: data.status || item.deliveryStatus,
          }
        : item,
    );
    return { success: true };
  },

  "[POST]/api/orders/required/ticket": () => {
    return { success: true };
  },
});

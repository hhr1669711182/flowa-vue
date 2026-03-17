<template>
  <div class="products h-full flex flex-col">
    <div class="flex justify-between items-center mb-4 flex-shrink-0">
      <div>
        <div class="flex items-center gap-1 line-height-22px">
          <div class="text-#000 text-28px line-height-36px">Invoices</div>
        </div>
        <div class="text-14px text-#6B6B6B">
          Access, manage, and download all invoices generated for recharges and
          services.
        </div>
      </div>
    </div>

    <ProductFilter ref="filterRef" @search="handleFilterSearch" />

    <div class="flex-1 min-h-0 rounded-xl overflow-hidden">
      <BaseTable
        :data="tableData"
        :columns="columns"
        :loading="loading"
        :pagination="true"
        :total="total"
        v-model:page="page"
        v-model:limit="limit"
        @pagination-change="fetchData"
      >
        <template #expand="{ row }">
          <div class="py-4 px-6 bg-#F7F7F7">
            <div class="bg-#fff rounded-lg border border-gray-200">
              <div
                class="grid grid-cols-3 items-center gap-20 px-6 py-3 !border-b-1.5 border-0 border-solid border-#ECECEC"
              >
                <div class="flex flex-col items-start gap-3">
                  <span class="text-lg font-bold text-gray-900">
                    {{ row.invoiceId }}
                  </span>
                </div>

                <div class="text-left text-sm">
                  <div class="mb-1">
                    <span class="text-gray-500 mr-2">Issued for Period</span>
                    <span class="text-gray-900">{{
                      getIssuedForPeriod(getDetailData(row))
                    }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500 mr-2">Invoice Date</span>
                    <span class="text-gray-900">{{
                      formatDisplayDate(getDetailData(row).invoiceDate)
                    }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500 mr-2">Due Date</span>
                    <span class="text-gray-900">{{
                      formatDisplayDate(getDetailData(row).dueDate)
                    }}</span>
                  </div>
                </div>
                <div class="text-left text-sm">
                  <div class="mb-1">
                    <span class="text-gray-500 mr-2">Bill To</span>
                    <span class="text-gray-900 font-semibold">{{
                      getDetailData(row).billToName || "Billy J"
                    }}</span>
                  </div>
                  <div>
                    <span class="text-gray-900">{{
                      getBillToAddress(getDetailData(row))[0]
                    }}</span>
                  </div>
                  <div>
                    <span class="text-gray-900">{{
                      getBillToAddress(getDetailData(row))[1]
                    }}</span>
                  </div>
                  <div>
                    <span class="text-gray-900">{{
                      getBillToAddress(getDetailData(row))[2]
                    }}</span>
                  </div>
                </div>
              </div>
              <div class="px-6 py-4">
                <div class="mb-4 flex flex-col gap-2">
                  <div
                    v-for="item in getSummaryRows(getDetailData(row))"
                    :key="item.label"
                    class="pl-36% flex justify-between items-center self-stretch text-sm py-1 px-3 !border-b-1.5 border-0 border-solid border-#ECECEC"
                  >
                    <span :class="item.labelClass">{{ item.label }}</span>
                    <span :class="item.valueClass">{{ item.value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template #invoiceId="{ row }">
          <div class="flex items-center gap-2">
            <span class="font-medium text-gray-900">{{ row.invoiceId }}</span>
          </div>
        </template>

        <template #invoiceDate="{ row }">
          <span class="text-gray-500">{{
            formatDisplayDate(row.invoiceDate)
          }}</span>
        </template>

        <template #issuedPeriod="{ row }">
          <span class="text-gray-500">{{ getIssuedForPeriod(row) }}</span>
        </template>

        <template #dueDate="{ row }">
          <span class="text-gray-500">{{
            formatDisplayDate(row.dueDate)
          }}</span>
        </template>

        <template #total="{ row }">
          <span class="font-medium text-gray-900">{{
            formatAmount(row.total)
          }}</span>
        </template>

        <template #actions="{ row }">
          <div class="flex flex-1 items-center">
            <el-button class="w-8 h-8" @click="onDownLoadFile(row)">
              <Icon icon="svg-icon:arrow-down-to-square" color="#16215B" />
            </el-button>
            <el-popover
              placement="bottom-start"
              trigger="click"
              popper-class="!p-0 !px-6 !min-w-auto !rounded-lg !w-auto"
              :show-arrow="false"
            >
              <template #reference>
                <el-button class="w-8 h-8">
                  <Icon icon="svg-icon:ellipsis-vertical" color="#16215B" />
                </el-button>
              </template>
              <div class="py-2 px-1">
                <el-button
                  link
                  class="!text-red-600 !font-semibold w-full !justify-start hover:!bg-#F4F6FA !px-3 !h-9"
                >
                  <span class="flex items-center gap-2">
                    <Icon icon="svg-icon:headphones" />
                    Contact Support
                  </span>
                </el-button>
              </div>
            </el-popover>
          </div>
        </template>
      </BaseTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import ProductFilter from "./components/ProductFilter.vue";
import {
  downloadInvoiceById,
  getInvoiceDetail,
  getInvoiceList,
  type InvoiceRecord,
} from "@/api/invoices";
import { ElMessage } from "element-plus";

const filterRef = ref();
const currentFilters = ref<Record<string, any>>({});

const handleFilterSearch = (params: any) => {
  currentFilters.value = params;
  page.value = 1;
  fetchData();
};

const columns = [
  { type: "selection", width: 50 },
  { type: "expand", width: 50, slot: "expand" },
  { label: "Invoice ID", slot: "invoiceId", minWidth: 200 },
  { label: "Invoice Date", slot: "invoiceDate", minWidth: 150 },
  { label: "Issued for Period", slot: "issuedPeriod", minWidth: 200 },
  { label: "Due Date", slot: "dueDate", minWidth: 150 },
  { label: "Total", slot: "total", minWidth: 120, align: "right" },
  {
    label: "Actions",
    slot: "actions",
    width: 100,
    fixed: "right",
    align: "center",
  },
];

const tableData = ref<InvoiceRecord[]>([]);
const detailMap = ref<Record<string, InvoiceRecord>>({});
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const limit = ref(20);

const formatDisplayDate = (value?: string) => {
  if (!value) return "00/00/2026";
  const parts = value.split("-");
  if (parts.length === 3) {
    const [yyyy, mm, dd] = parts;
    return `${mm}/${dd}/${yyyy}`;
  }
  return value;
};

const formatAmount = (value?: number) => {
  const amount = Number.isFinite(Number(value)) ? Number(value) : 0;
  return `$${amount.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const getIssuedForPeriod = (row: InvoiceRecord) => {
  return `${formatDisplayDate(row.periodStart)} - ${formatDisplayDate(row.periodEnd)}`;
};

const getBillToAddress = (row: InvoiceRecord) => {
  return (
    row.billToAddress || [
      "Unit 132 Hoepers Rd",
      "Kunda Park QLD 4556",
      "Australia",
    ]
  );
};

const getDetailData = (row: InvoiceRecord) => {
  return detailMap.value[row.id] || row;
};

const getDiscount = (row: InvoiceRecord) => {
  return Number(row.discount || 0);
};

const getSubtotalAfterDiscount = (row: InvoiceRecord) => {
  return Math.max(0, Number(row.total || 0) - getDiscount(row));
};

const getTotalGST = (row: InvoiceRecord) => {
  return getSubtotalAfterDiscount(row) * Number(row.gstRate || 0.1);
};

const getInvoiceTotal = (row: InvoiceRecord) => {
  return getSubtotalAfterDiscount(row) + getTotalGST(row);
};

const getSecondarySubtotal = (row: InvoiceRecord) => {
  return Number(row.secondarySubtotal || 0);
};

const getSecondaryGST = (row: InvoiceRecord) => {
  const rate = Number(row.secondaryGstRate || 0.01);
  if (getSecondarySubtotal(row) > 0) {
    return getSecondarySubtotal(row) * rate;
  }
  return getInvoiceTotal(row);
};

const getSummaryRows = (row: InvoiceRecord) => {
  return [
    {
      label: "Total Discount",
      value: formatAmount(getDiscount(row)),
      labelClass: "text-gray-500",
      valueClass: "font-medium text-gray-500",
    },
    {
      label: "Subtotal (After Discount)",
      value: formatAmount(getSubtotalAfterDiscount(row)),
      labelClass: "text-gray-500",
      valueClass: "font-medium text-gray-500",
    },
    {
      label: "Total GST 10%",
      value: formatAmount(getTotalGST(row)),
      labelClass: "text-gray-500",
      valueClass: "font-medium text-gray-500",
    },
    {
      label: "Invoice Total (AUD)",
      value: formatAmount(getInvoiceTotal(row)),
      labelClass: "text-gray-900 font-semibold",
      valueClass: "font-semibold text-gray-900",
    },
    {
      label: "Subtotal (After Discount)",
      value: formatAmount(getSecondarySubtotal(row)),
      labelClass: "text-gray-900 font-semibold",
      valueClass: "font-semibold text-gray-900",
    },
    {
      label: "Total GST 1%",
      value: formatAmount(getSecondaryGST(row)),
      labelClass: "text-gray-900 font-semibold",
      valueClass: "font-semibold text-gray-900",
    },
  ];
};

const loadDetails = async (rows: InvoiceRecord[]) => {
  const pairs = await Promise.all(
    rows.map(async (row) => {
      try {
        const detail = await getInvoiceDetail(row.id);
        return [row.id, detail] as const;
      } catch (error) {
        console.error("Failed to fetch invoice detail:", error);
        return [row.id, row] as const;
      }
    }),
  );
  detailMap.value = Object.fromEntries(pairs);
};

const onDownLoadFile = async (row: InvoiceRecord) => {
  try {
    const res = await downloadInvoiceById(row.id);
    if (res?.url) {
      window.open(res.url, "_blank");
      ElMessage.success("Download started");
    }
  } catch (error) {
    console.error("Download failed:", error);
    ElMessage.error("Download failed");
  }
};

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getInvoiceList({
      page: page.value,
      pageSize: limit.value,
      keyword: currentFilters.value.keyword || "",
      status: currentFilters.value.status || "",
      quickRange: currentFilters.value.quickRange || "all",
      dateRange: currentFilters.value.dateRange || [],
    });
    tableData.value = (res.list || []) as InvoiceRecord[];
    total.value = res.total || 0;
    await loadDetails(tableData.value);
    await nextTick();
  } catch (error) {
    console.error("Failed to fetch invoice list:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await nextTick();
  if (filterRef.value) {
    currentFilters.value = filterRef.value.getSearchParams();
  }
  fetchData();
});
</script>

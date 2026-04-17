<template>
  <div class="p-6 space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-800">Orders / Tracking</h2>
      <p class="text-gray-500 mt-1">Query and view logistics tracking by sales order.</p>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-6 py-5 bg-white border-b border-gray-100 flex flex-wrap gap-3 items-start">
        <el-input
          v-model="keyword"
          class="!w-[640px] max-w-full"
          type="textarea"
          :autosize="keywordAutosize"
          placeholder="Please enter your order number(s). Support multiple inputs separated by comma/space/newline."
          clearable
          @focus="handleKeywordFocus"
          @blur="handleKeywordBlur"
          @keyup.ctrl.enter.prevent="refresh"
        />
        <el-button type="primary" :loading="loading" class="yuntrack-track-btn !px-8" @click="refresh">Track</el-button>
      </div>

      <div class="px-6 pt-4">
        <el-tabs v-model="activeStatusTab" type="card" class="tracking-tabs">
          <el-tab-pane :label="`All(${statusCounts.all})`" name="all" />
          <el-tab-pane :label="`Processing(${statusCounts.processing})`" name="processing" />
          <el-tab-pane :label="`Transit(${statusCounts.transit})`" name="transit" />
          <el-tab-pane :label="`Delivered(${statusCounts.delivered})`" name="delivered" />
          <el-tab-pane :label="`Not Found(${statusCounts.not_found})`" name="not_found" />
          <el-tab-pane :label="`Alert(${statusCounts.alert})`" name="alert" />
          <el-tab-pane :label="`Returned(${statusCounts.returned})`" name="returned" />
        </el-tabs>
      </div>

      <el-table
        v-loading="loading"
        :data="filteredRows"
        stripe
        style="width: 100%"
        :row-key="rowKey"
        :expand-row-keys="expandedRowKeys"
        :header-cell-style="{ background: '#EAF7F3', color: '#0F766E', fontWeight: '700' }"
        :row-class-name="rowClassName"
        @row-click="onRowClick"
      >
        <el-table-column type="expand" width="44">
          <template #default="{ row }">
            <div class="yuntrack-expand-wrap">
              <div class="yuntrack-expand-top">
                <button class="yuntrack-expand-action" type="button" @click.stop="copyTrackingHistory(row)">
                  Copy Tracking History
                </button>
                <button class="yuntrack-expand-action" type="button" @click.stop="copyTrackingLink(row)">
                  Copy Link
                </button>
              </div>
              <div class="yuntrack-expand-grid">
                <div class="yuntrack-left">
                  <div class="yuntrack-stage">
                    <div class="yuntrack-stage-title">Pickup</div>
                    <div class="yuntrack-stage-line">
                      <div
                        v-for="(s, i) in stageSteps"
                        :key="i"
                        class="yuntrack-stage-step"
                        :class="[
                          i <= computeProgressIndex(row) ? 'is-reached' : 'is-pending',
                          i === stageSteps.length - 1 ? 'is-last' : ''
                        ]"
                      >
                        <span class="dot" />
                        <span class="label">{{ s }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="yuntrack-timeline">
                    <div
                      v-for="(group, idx) in groupHistoryByDay(row.tracking_history)"
                      :key="idx"
                      class="yuntrack-day-group"
                    >
                      <div class="yuntrack-day-head">
                        <div class="dow">{{ group.dow }}</div>
                        <div class="date">{{ group.dateLabel }}</div>
                      </div>
                      <div class="yuntrack-day-body">
                        <div v-for="(ev, i) in group.items" :key="i" class="yuntrack-ev">
                          <div class="time">{{ formatLocalTime(ev.timestamp || ev.process_time) }}</div>
                          <div class="dotline">
                            <span class="dot" />
                            <span class="line" />
                          </div>
                          <div class="desc">
                            <div class="title">{{ ev.description || ev.event || '—' }}</div>
                            <div class="sub" v-if="ev.location">{{ ev.location }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div v-if="!row.tracking_history?.length" class="text-gray-500 text-sm py-6">
                      No tracking events.
                    </div>
                  </div>
                </div>
                <div class="yuntrack-right">
                  <div class="yuntrack-card">
                    <div class="yuntrack-card-title">Shipment Information</div>
                    <div class="yuntrack-card-row">
                      <div class="k">Order Number</div>
                      <div class="v">{{ row.sales_order || '—' }}</div>
                    </div>
                    <div class="yuntrack-card-row">
                      <div class="k">Country</div>
                      <div class="v">{{ row.destination_country || '—' }}</div>
                    </div>
                  </div>
                  <div class="yuntrack-card">
                    <div class="yuntrack-card-title">Additional Notes</div>
                    <div v-if="buildAdditionalNotes(row.last_mile).length" class="yuntrack-notes">
                      <div v-for="(line, i) in buildAdditionalNotes(row.last_mile)" :key="i" class="line">
                        <template v-if="line.type === 'link'">
                          <span>{{ line.label }}</span>
                          <a :href="line.href" target="_blank" rel="noreferrer">{{ line.href }}</a>
                        </template>
                        <template v-else>
                          {{ line.text }}
                        </template>
                      </div>
                    </div>
                    <div v-else class="text-gray-500 text-sm">—</div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Tracking Number" min-width="220">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-800">{{ row.display_tracking_no || '—' }}</span>
              <el-icon
                v-if="row.display_tracking_no"
                class="cursor-pointer text-gray-400 hover:text-primary"
                title="Copy tracking number"
                @click.stop="copyText(row.display_tracking_no)"
              >
                <CopyDocument />
              </el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Delivery Status" width="140">
          <template #default="{ row }">
            <el-tag size="small" :type="statusTagType(row.status_text)">
              {{ statusLabel(row.status_text) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sales_order" label="Order Number" min-width="150" />
        <el-table-column label="Last Event" min-width="260">
          <template #default="{ row }">
            <div class="text-xs text-gray-500">{{ formatTs(row.latest_time) }}</div>
            <div class="text-sm truncate" :title="row.latest_event">{{ row.latest_event || '—' }}</div>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end items-center gap-2 px-6 py-4 border-t border-gray-100">
        <span class="text-sm text-gray-500">Per page</span>
        <el-select v-model="pageSize" class="!w-20" size="small" @change="onPageSizeChange">
          <el-option :value="20" label="20" />
          <el-option :value="50" label="50" />
          <el-option :value="100" label="100" />
        </el-select>
        <el-button size="small" :disabled="pageIndex <= 1" @click="prevPage">Prev</el-button>
        <span class="text-sm text-gray-600">{{ pageIndex }} / {{ totalPages }}</span>
        <el-button size="small" :disabled="pageIndex >= totalPages" @click="nextPage">Next</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getShopShipments, batchTracking, getTrackingBySalesOrders } from '@/api/tracking'
import { getCurrentUserInfo } from '@/api/auth'
import { ElMessage } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'

const route = useRoute()
const company = ref('')
const keyword = ref('')
const keywordAutosize = ref<{ minRows: number; maxRows: number }>({ minRows: 1, maxRows: 3 })
const keywordFocused = ref(false)
const activeStatusTab = ref<'all' | 'processing' | 'transit' | 'delivered' | 'not_found' | 'alert' | 'returned'>('all')
const loading = ref(false)
const pageIndex = ref(1)
const pageSize = ref(20)
const serverTotal = ref(0)
const rawShipments = ref<any[]>([])
const expandedRowKeys = ref<string[]>([])
const selectedRow = ref<any>(null)

const stageSteps = ['Pickup', 'Departed from origin', 'Arrived at destination', 'Local carrier on the way', 'Delivered successfully']

const totalPages = computed(() => Math.max(1, Math.ceil((serverTotal.value || 0) / pageSize.value)))

type StatusKey = typeof activeStatusTab.value

function splitKeywords(text: string): string[] {
  return String(text || '')
    .split(/[\n,\s]+/g)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 50)
}

function hasMultipleOrderIds(text: string): boolean {
  return splitKeywords(text).length >= 2
}

function handleKeywordFocus() {
  keywordFocused.value = true
  keywordAutosize.value = hasMultipleOrderIds(keyword.value) ? { minRows: 3, maxRows: 8 } : { minRows: 1, maxRows: 3 }
}

function handleKeywordBlur() {
  keywordFocused.value = false
  keywordAutosize.value = { minRows: 1, maxRows: 3 }
}

watch(
  () => keyword.value,
  () => {
    if (!keywordFocused.value) return
    keywordAutosize.value = hasMultipleOrderIds(keyword.value) ? { minRows: 3, maxRows: 8 } : { minRows: 1, maxRows: 3 }
  }
)

function normalizeStatusKey(statusText: any): StatusKey {
  const s = String(statusText || '').toLowerCase()
  if (!s) return 'processing'
  if (s.includes('not found')) return 'not_found'
  if (s.includes('deliver')) return 'delivered'
  if (s.includes('return')) return 'returned'
  if (s.includes('alert') || s.includes('exception') || s.includes('issue')) return 'alert'
  if (s.includes('transit') || s.includes('in transit') || s.includes('transport')) return 'transit'
  return 'processing'
}

function computeLatest(hist: any[]): { latest_time: any; latest_event: string } {
  let latest: any = null
  ;(hist || []).forEach((ev: any) => {
    const ts = ev?.timestamp || ev?.process_time
    if (!ts) return
    if (!latest || new Date(ts) > new Date(latest.timestamp || latest.process_time)) latest = ev
  })
  return {
    latest_time: latest?.timestamp || latest?.process_time || '',
    latest_event: latest ? (latest.description || latest.event || '') : '',
  }
}

function getLastMileTrackingNo(lastMile: any): string {
  const v = lastMile?.tracking_number
  return v && String(v).trim() ? String(v).trim() : ''
}

function buildAdditionalNotes(lastMile: any): Array<{ type: 'text'; text: string } | { type: 'link'; label: string; href: string }> {
  const lines: Array<{ type: 'text'; text: string } | { type: 'link'; label: string; href: string }> = []
  const lm = lastMile && typeof lastMile === 'object' ? lastMile : null
  if (!lm) return lines
  const trackNo = getLastMileTrackingNo(lm)
  if (trackNo) {
    lines.push({ type: 'text', text: `Last mile tracking: ${trackNo}` })
  }
  const url = String((lm as any)?.tracking_url || '').trim()
  if (url) {
    lines.push({ type: 'link', label: 'Tracking URL:', href: url })
  }
  const carrier = String((lm as any)?.carrier || '').trim()
  if (carrier) lines.push({ type: 'text', text: `Carrier: ${carrier}` })
  return lines
}

const shipments = computed(() => {
  const list = Array.isArray(rawShipments.value) ? rawShipments.value : []
  return list.map((r: any) => {
    const tracking = r?.tracking || null
    const failMsg = tracking && tracking.success === false ? String(tracking?.message || 'Query failed') : ''
    const trackingData =
      failMsg || !tracking
        ? {}
        : tracking.data && typeof tracking.data === 'object'
          ? tracking.data
          : {}
    const hist = Array.isArray((trackingData as any)?.tracking_history) ? (trackingData as any).tracking_history : []
    const { latest_time, latest_event } = computeLatest(hist)
    const status_text = failMsg
      ? `error: ${failMsg}`
      : !tracking
        ? 'No data'
        : (trackingData as any)?.status || (trackingData as any)?.package_status || r?.status_text || 'processing'
    const status_key = normalizeStatusKey(status_text)
    const primary_tracking_no = String(tracking?.tracking_number || r?.primary_tracking_no || '').trim()
    const lastMilePayload = r?.last_mile || null
    const lastMileTrackingNo = getLastMileTrackingNo(lastMilePayload)
    const display_tracking_no =
      lastMileTrackingNo ||
      String((trackingData as any)?.last_mile_tracking || primary_tracking_no || r?.primary_tracking_no || '').trim()
    return {
      ...r,
      tracking,
      primary_tracking_no,
      display_tracking_no,
      status_text,
      status_key,
      latest_time: latest_time || (failMsg ? '' : ''),
      latest_event: latest_event || failMsg || '',
      last_mile_tracking: lastMileTrackingNo,
      tracking_history: hist,
    }
  })
})

const statusCounts = computed(() => {
  const counts: Record<string, number> = {
    all: shipments.value.length,
    processing: 0,
    transit: 0,
    delivered: 0,
    not_found: 0,
    alert: 0,
    returned: 0,
  }
  shipments.value.forEach((r: any) => {
    const k = String(r?.status_key || 'processing')
    if (Object.prototype.hasOwnProperty.call(counts, k)) counts[k] = (counts[k] ?? 0) + 1
  })
  return counts as any
})

const filteredRows = computed(() => {
  const list = shipments.value
  const tab = activeStatusTab.value
  if (tab === 'all') return list
  return list.filter((r: any) => String(r?.status_key) === tab)
})

function rowKey(row: any) {
  return String(row?.sales_order || row?.display_tracking_no || row?.primary_tracking_no || row?.name || '')
}

function rowClassName({ row }: any) {
  const k = rowKey(row)
  return expandedRowKeys.value.includes(k) ? 'yuntrack-row-expanded' : ''
}

function onRowClick(row: any) {
  const k = rowKey(row)
  const idx = expandedRowKeys.value.indexOf(k)
  if (idx >= 0) {
    expandedRowKeys.value.splice(idx, 1)
  } else {
    expandedRowKeys.value = [k]
  }
  selectedRow.value = row
}

function computeProgressIndex(row: any): number {
  const statusKey = String(row?.status_key || '').toLowerCase()
  const statusText = String(row?.status_text || '').toLowerCase()
  if (statusKey === 'delivered' || statusText.includes('delivered')) return 4
  if (statusKey === 'returned' || statusText.includes('return')) return 4
  if (statusKey === 'transit' || statusText.includes('transit')) return 2
  if (statusKey === 'alert' || statusText.includes('alert') || statusText.includes('exception')) return 1
  if (statusKey === 'not_found' || statusText.includes('not found')) return 0
  return 1
}

function groupHistoryByDay(hist: any[]) {
  const list = Array.isArray(hist) ? hist.slice() : []
  list.sort((a: any, b: any) => {
    const ta = new Date(a?.timestamp || a?.process_time || 0).getTime()
    const tb = new Date(b?.timestamp || b?.process_time || 0).getTime()
    return tb - ta
  })
  const groups: any[] = []
  const byKey = new Map<string, any>()
  list.forEach((ev: any) => {
    const t = ev?.timestamp || ev?.process_time
    const d = t ? new Date(t) : null
    const key = d && !isNaN(d.getTime()) ? `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` : 'unknown'
    if (!byKey.has(key)) {
      const dow = d ? d.toLocaleDateString('en-US', { weekday: 'long' }) : '—'
      const dateLabel = d
        ? d.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })
        : '—'
      byKey.set(key, { key, dow, dateLabel, items: [] })
      groups.push(byKey.get(key))
    }
    byKey.get(key).items.push(ev)
  })
  return groups
}

function formatLocalTime(ts: any) {
  if (!ts) return '—'
  const d = new Date(ts)
  return isNaN(d.getTime()) ? String(ts) : d.toLocaleTimeString('en-US', { hour12: false })
}

function formatTs(ts: any) {
  if (!ts) return '—'
  const d = new Date(ts)
  return isNaN(d.getTime()) ? String(ts) : d.toLocaleString('en-US', { hour12: false })
}

function statusLabel(s: string) {
  const x = String(s || '').toLowerCase()
  if (x === 'no data') return 'No data'
  if (x.includes('error:')) return 'Error'
  if (x.includes('delivered')) return 'Delivered'
  if (x.includes('return')) return 'Returned'
  if (x.includes('not found')) return 'Not Found'
  if (x.includes('alert') || x.includes('exception') || x.includes('issue')) return 'Alert'
  if (x.includes('transit')) return 'Transit'
  return 'Processing'
}

function statusTagType(
  s: string
): 'primary' | 'success' | 'warning' | 'info' | 'danger' | undefined {
  const x = String(s || '').toLowerCase()
  if (x.includes('delivered')) return 'success'
  if (x.includes('return')) return 'warning'
  if (x.includes('error:')) return 'danger'
  if (x.includes('not found')) return 'info'
  if (x.includes('alert') || x.includes('exception') || x.includes('issue')) return 'danger'
  return undefined
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(String(text || ''))
    ElMessage.success('Copied')
  } catch {
    ElMessage.error('Copy failed')
  }
}

function copyTrackingLink(row: any) {
  const kw = String(row?.display_tracking_no || row?.primary_tracking_no || '').trim()
  if (!kw) return
  const url = `${window.location.origin}${window.location.pathname}#/tms_tracking?kw=${encodeURIComponent(kw)}`
  void copyText(url)
}

function copyTrackingHistory(row: any) {
  const hist = Array.isArray(row?.tracking_history) ? row.tracking_history : []
  const lines = hist
    .slice()
    .sort((a: any, b: any) => {
      const ta = new Date(a?.timestamp || a?.process_time || 0).getTime()
      const tb = new Date(b?.timestamp || b?.process_time || 0).getTime()
      return tb - ta
    })
    .map((ev: any) => {
      const t = ev?.timestamp || ev?.process_time
      const time = formatTs(t)
      const desc = String(ev?.description || ev?.event || '').trim() || '—'
      const loc = String(ev?.location || '').trim()
      return loc ? `${time} | ${desc} | ${loc}` : `${time} | ${desc}`
    })
  void copyText(lines.join('\n'))
}

async function resolveCompanyIfNeeded() {
  if (company.value.trim()) return
  try {
    const res = await getCurrentUserInfo().send()
    const msg = (res as any)?.message ?? res
    if (msg && typeof msg === 'object' && (msg as any).company) {
      company.value = String((msg as any).company).trim()
    }
  } catch {
    return
  }
}

async function refresh() {
  const keys = splitKeywords(keyword.value)
  if (!keys.length) {
    ElMessage.warning('Please enter at least one order number')
    return
  }
  loading.value = true
  expandedRowKeys.value = []
  selectedRow.value = null
  try {
    await resolveCompanyIfNeeded()
    const c = company.value.trim()
    const salesOrders = keys
    const trackingRes = c ? await getTrackingBySalesOrders({ company: c, sales_orders: salesOrders }).send() : null
    const trackMap = new Map<string, any>()
    const msg = (trackingRes as any)?.message ?? trackingRes
    if (msg && typeof msg === 'object') {
      const data = Array.isArray((msg as any).data) ? (msg as any).data : Array.isArray(msg) ? msg : []
      data.forEach((it: any) => {
        const so = String(it?.sales_order || it?.salesOrder || '').trim()
        if (so) trackMap.set(so, it)
      })
    }
    const listRes = await getShopShipments({ page: pageIndex.value, page_size: pageSize.value }).send()
    const listMsg = (listRes as any)?.message ?? listRes
    const rows = Array.isArray((listMsg as any)?.data) ? (listMsg as any).data : Array.isArray(listMsg) ? listMsg : []
    serverTotal.value = Number((listMsg as any)?.total ?? rows.length) || rows.length

    const merged = rows.map((r: any) => {
      const so = String(r?.sales_order || r?.salesOrder || '').trim()
      return so && trackMap.has(so) ? { ...r, ...trackMap.get(so) } : r
    })
    rawShipments.value = merged

    const missingTrackingNos = merged
      .map((r: any) => String(r?.primary_tracking_no || r?.tracking_number || '').trim())
      .filter(Boolean)
      .slice(0, 50)
    if (missingTrackingNos.length) {
      try {
        const batchRes = await batchTracking(missingTrackingNos).send()
        const bmsg = (batchRes as any)?.message ?? batchRes
        if (bmsg && typeof bmsg === 'object' && Array.isArray((bmsg as any).data)) {
          const byNo = new Map<string, any>()
          ;((bmsg as any).data as any[]).forEach((x: any) => {
            const no = String(x?.tracking_number || '').trim()
            if (no) byNo.set(no, x)
          })
          rawShipments.value = merged.map((r: any) => {
            const no = String(r?.primary_tracking_no || r?.tracking_number || '').trim()
            return no && byNo.has(no) ? { ...r, tracking: byNo.get(no) } : r
          })
        }
      } catch {
        return
      }
    }
  } catch (e: any) {
    ElMessage.error(e?.message || 'Failed to fetch tracking')
  } finally {
    loading.value = false
  }
}

function prevPage() {
  if (pageIndex.value <= 1) return
  pageIndex.value -= 1
  refresh()
}

function nextPage() {
  if (pageIndex.value >= totalPages.value) return
  pageIndex.value += 1
  refresh()
}

function onPageSizeChange() {
  pageIndex.value = 1
  refresh()
}

onMounted(async () => {
  const kw = String(route.query.kw || '')
  if (kw.trim()) {
    keyword.value = kw
    refresh()
  }
})
</script>

<style scoped>
:deep(.tracking-tabs .el-tabs__header) { margin: 0; }
.yuntrack-track-btn { background: #ff6a3d !important; border-color: #ff6a3d !important; }
:deep(.tracking-tabs.el-tabs--card > .el-tabs__header .el-tabs__item) {
  border: 0 !important; background: transparent !important; color: #6b7280; font-weight: 600;
}
:deep(.tracking-tabs.el-tabs--card > .el-tabs__header .el-tabs__item.is-active) { color: #ff6a3d !important; }
:deep(.tracking-tabs.el-tabs--card > .el-tabs__header .el-tabs__nav) { border: 0 !important; }
:deep(.el-table__expanded-cell) { padding: 0 !important; background: #0f8a73 !important; }
.yuntrack-row-expanded :deep(td) { background: #0f8a73 !important; color: #fff; }
.yuntrack-expand-wrap { background: #0f8a73; color: #fff; padding: 16px 18px; }
.yuntrack-expand-top { display: flex; justify-content: flex-end; gap: 16px; margin-bottom: 12px; }
.yuntrack-expand-action { color: #fff; opacity: 0.9; font-size: 12px; border: 0; background: transparent; cursor: pointer; }
.yuntrack-expand-grid { display: grid; grid-template-columns: 1fr 320px; gap: 18px; }
.yuntrack-left { background: #fff; border-radius: 8px; padding: 14px; color: #111827; }
.yuntrack-right { display: flex; flex-direction: column; gap: 12px; }
.yuntrack-card { background: #f3fbf8; border-radius: 8px; padding: 12px 14px; color: #111827; }
.yuntrack-card-title { font-weight: 700; margin-bottom: 10px; color: #0f766e; }
.yuntrack-card-row { display: grid; grid-template-columns: 120px 1fr; gap: 10px; padding: 6px 0; border-top: 1px solid rgba(15, 118, 110, 0.12); }
.yuntrack-card-row:first-of-type { border-top: 0; }
.yuntrack-card-row .k { color: #6b7280; font-size: 12px; }
.yuntrack-card-row .v { font-size: 13px; font-weight: 600; }
.yuntrack-notes .line { font-size: 12px; color: #374151; padding: 2px 0; word-break: break-word; }
.yuntrack-notes a { color: #0f766e; text-decoration: underline; }
.yuntrack-stage-title { font-size: 22px; font-weight: 800; color: #0f766e; margin-bottom: 8px; }
.yuntrack-stage-line { display: flex; gap: 14px; flex-wrap: wrap; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb; margin-bottom: 10px; }
.yuntrack-stage-step { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #6b7280; }
.yuntrack-stage-step .dot { width: 8px; height: 8px; border-radius: 999px; background: #10b981; display: inline-block; }
.yuntrack-stage-step.is-pending { color: #9ca3af; }
.yuntrack-stage-step.is-pending .dot { background: #d1d5db; }
.yuntrack-stage-step.is-reached { color: #0f766e; }
.yuntrack-timeline { padding-top: 6px; }
.yuntrack-day-group { margin-bottom: 14px; }
.yuntrack-day-head { display: flex; flex-direction: column; gap: 2px; margin-bottom: 6px; }
.yuntrack-day-head .dow { font-weight: 800; color: #0f766e; }
.yuntrack-day-head .date { font-size: 12px; color: #6b7280; }
.yuntrack-ev { display: grid; grid-template-columns: 110px 24px 1fr; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
.yuntrack-ev:last-child { border-bottom: 0; }
.yuntrack-ev .time { font-size: 12px; color: #6b7280; }
.yuntrack-ev .dotline { position: relative; display: flex; justify-content: center; }
.yuntrack-ev .dotline .dot { width: 10px; height: 10px; border-radius: 999px; background: #10b981; margin-top: 2px; }
.yuntrack-ev .dotline .line { position: absolute; top: 14px; bottom: -12px; width: 2px; background: rgba(16, 185, 129, 0.35); }
.yuntrack-ev .desc .title { font-weight: 700; font-size: 13px; color: #111827; }
.yuntrack-ev .desc .sub { margin-top: 2px; font-size: 12px; color: #6b7280; }
@media (max-width: 1024px) { .yuntrack-expand-grid { grid-template-columns: 1fr; } }
</style>

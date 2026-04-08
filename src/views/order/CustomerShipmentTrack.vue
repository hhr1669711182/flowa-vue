<template>
  <div class="p-6 space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-800">Track your shipment</h2>
      <p class="text-gray-500 mt-1">
        Enter tracking number(s). Shareable link:
        <code class="text-gray-600">/#/tms_tracking?num=</code>
        (also <code class="text-gray-600">?waybill=</code> /
        <code class="text-gray-600">?tracking=</code>).
      </p>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-6 py-5 bg-white border-b border-gray-100 flex flex-wrap gap-3 items-start">
        <el-input
          v-model="keyword"
          class="!w-[640px] max-w-full"
          type="textarea"
          :autosize="keywordAutosize"
          placeholder="Tracking number(s). Separate with comma, space or newline."
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { batchTracking } from '@/api/tracking'
import { ElMessage } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'

const route = useRoute()
const keyword = ref('')
const keywordAutosize = ref<{ minRows: number; maxRows: number }>({ minRows: 1, maxRows: 3 })
const keywordFocused = ref(false)
const activeStatusTab = ref<'all' | 'processing' | 'transit' | 'delivered' | 'not_found' | 'alert' | 'returned'>('all')
const loading = ref(false)
const rawShipments = ref<any[]>([])
const expandedRowKeys = ref<string[]>([])

const stageSteps = ['Pickup', 'Departed from origin', 'Arrived at destination', 'Local carrier on the way', 'Delivered successfully']

type StatusKey = typeof activeStatusTab.value

function splitKeywords(text: string): string[] {
  return String(text || '')
    .split(/[\n,\s]+/g)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 50)
}

function hasMultipleIds(text: string): boolean {
  return splitKeywords(text).length >= 2
}

function handleKeywordFocus() {
  keywordFocused.value = true
  keywordAutosize.value = hasMultipleIds(keyword.value) ? { minRows: 3, maxRows: 8 } : { minRows: 1, maxRows: 3 }
}

function handleKeywordBlur() {
  keywordFocused.value = false
  keywordAutosize.value = { minRows: 1, maxRows: 3 }
}

watch(
  () => keyword.value,
  () => {
    if (!keywordFocused.value) return
    keywordAutosize.value = hasMultipleIds(keyword.value)
      ? { minRows: 3, maxRows: 8 }
      : { minRows: 1, maxRows: 3 }
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

const tableRows = computed(() => {
  return rawShipments.value.map((r: any) => {
    const tracking = r?.tracking || null
    const trackingData = tracking?.success && tracking?.data ? tracking.data : {}
    const hist = Array.isArray(trackingData?.tracking_history) ? trackingData.tracking_history : []
    const { latest_time, latest_event } = computeLatest(hist)
    const failMsg = tracking && tracking.success === false ? String(tracking?.message || 'Query failed') : ''
    const status_text = failMsg
      ? `error: ${failMsg}`
      : trackingData?.status || trackingData?.package_status || r?.status_text || 'processing'
    const status_key = normalizeStatusKey(status_text)
    const primary_tracking_no = String(tracking?.tracking_number || r?.primary_tracking_no || '').trim()
    const lastMilePayload = r?.last_mile || null
    const lastMileTrackingNo = getLastMileTrackingNo(lastMilePayload)
    const display_tracking_no =
      lastMileTrackingNo ||
      String(trackingData?.last_mile_tracking || primary_tracking_no || r?.primary_tracking_no || '').trim()
    return {
      ...r,
      tracking,
      sales_order: r?.sales_order || '',
      destination_country: r?.destination_country || '',
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
  const c = { all: 0, processing: 0, transit: 0, delivered: 0, not_found: 0, alert: 0, returned: 0 }
  tableRows.value.forEach((r: any) => {
    c.all += 1
    const k = (r?.status_key as StatusKey) || 'processing'
    if (k in c) (c as any)[k] += 1
  })
  return c
})

const filteredRows = computed(() => {
  const tab = activeStatusTab.value
  if (tab === 'all') return tableRows.value
  return tableRows.value.filter((r: any) => r?.status_key === tab)
})

function rowKey(row: any) {
  return (
    String(row?.sales_order || '').trim() ||
    String(row?.primary_tracking_no || '').trim() ||
    Math.random().toString(36).slice(2, 10)
  )
}

function rowClassName({ row }: { row: any }) {
  const k = rowKey(row)
  return expandedRowKeys.value.includes(k) ? 'yuntrack-row-expanded' : ''
}

function onRowClick(row: any) {
  const k = rowKey(row)
  const idx = expandedRowKeys.value.indexOf(k)
  expandedRowKeys.value = idx >= 0 ? [] : [k]
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
      const dateLabel = d ? d.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }) : '—'
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
  try {
    const d = new Date(ts)
    if (isNaN(d.getTime())) return String(ts)
    return d.toLocaleString('zh-CN', { hour12: false })
  } catch {
    return String(ts)
  }
}

function copyText(text: string) {
  const str = String(text || '').trim()
  if (!str) return
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(str).then(
      () => ElMessage.success('Copied'),
      () => ElMessage.error('Copy failed')
    )
  } else {
    try {
      const el = document.createElement('textarea')
      el.value = str
      el.setAttribute('readonly', '')
      el.style.position = 'absolute'
      el.style.left = '-9999px'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      ElMessage.success('Copied')
    } catch {
      ElMessage.error('Copy failed')
    }
  }
}

function copyTrackingHistory(row: any) {
  const items = Array.isArray(row?.tracking_history) ? row.tracking_history : []
  const text = items
    .map((ev: any) => `${formatTs(ev.timestamp || ev.process_time)} ${ev.description || ev.event || ''}`.trim())
    .filter(Boolean)
    .join('\n')
  if (!text) return ElMessage.warning('No tracking history')
  copyText(text)
}

function copyTrackingLink(row: any) {
  const n = String(row?.display_tracking_no || row?.primary_tracking_no || '').trim()
  if (!n) return ElMessage.warning('No tracking number')
  const base = `${location.origin}${location.pathname}`.replace(/\/?$/, '/')
  copyText(`${base}#/tms_tracking?num=${encodeURIComponent(n)}`)
}

function statusLabel(s: string) {
  const x = String(s || '').toLowerCase()
  if (x.includes('error:')) return 'Error'
  if (x.includes('delivered')) return 'Delivered'
  if (x.includes('return')) return 'Returned'
  if (x.includes('alert') || x.includes('exception')) return 'Exception'
  if (x.includes('transit')) return 'In Transit'
  return 'Processing'
}

function statusTagType(s: string) {
  const x = String(s || '').toLowerCase()
  if (x.includes('error:')) return 'danger'
  if (x.includes('delivered')) return 'success'
  if (x.includes('return')) return 'warning'
  if (x.includes('alert') || x.includes('exception')) return 'danger'
  if (x.includes('transit')) return 'primary'
  return 'info'
}

function buildAdditionalNotes(lastMile: any): Array<{ type: 'text'; text: string } | { type: 'link'; label: string; href: string }> {
  const obj = lastMile && typeof lastMile === 'object' ? lastMile : null
  if (!obj) return []
  const lines: Array<any> = []
  const site = String(obj.last_mile_site || '').trim()
  if (site) lines.push({ type: 'link', label: 'Last Mile Website: ', href: site })
  const nameEn = String(obj.last_mile_name_en || '').trim()
  if (nameEn) lines.push({ type: 'text', text: `Last Mile: ${nameEn}` })
  return lines
}

async function refresh() {
  loading.value = true
  try {
    const keys = splitKeywords(keyword.value)
    if (!keys.length) {
      rawShipments.value = []
      expandedRowKeys.value = []
      return
    }
    const tr = await batchTracking(keys)
    const list = (tr as any)?.message?.data ?? (tr as any)?.data ?? []
    const rows = keys.map((trackingKey: string) => ({
      sales_order: '',
      destination_country: '',
      waybill_number: trackingKey,
      tracking_number: trackingKey,
      primary_tracking_no: trackingKey,
      tracking: null as any,
      last_mile: null,
    }))
    ;(Array.isArray(list) ? list : []).forEach((it: any) => {
      if (!it?.tracking_number) return
      const row = rows.find((r: any) => r.primary_tracking_no === it.tracking_number)
      if (row) row.tracking = it
    })
    rawShipments.value = rows
    expandedRowKeys.value = rows.length === 1 ? [rowKey(rows[0])] : []
  } catch (e: any) {
    ElMessage.error(e?.message || 'Failed to load tracking')
  } finally {
    loading.value = false
  }
}

function applyQueryToKeyword() {
  const n =
    (route.query.num as string) ||
    (route.query.waybill as string) ||
    (route.query.tracking as string) ||
    ''
  if (String(n).trim()) {
    keyword.value = String(n).trim()
    return
  }
  const kw = (route.query.kw as string) || ''
  if (kw) keyword.value = kw
}

onMounted(() => {
  applyQueryToKeyword()
  refresh()
})

watch(
  () => route.fullPath,
  () => {
    applyQueryToKeyword()
    refresh()
  }
)
</script>

<style scoped>
:deep(.tracking-tabs .el-tabs__header) {
  margin: 0;
}
.yuntrack-track-btn {
  background: #ff6a3d !important;
  border-color: #ff6a3d !important;
}
:deep(.tracking-tabs.el-tabs--card > .el-tabs__header .el-tabs__item) {
  border: 0 !important;
  background: transparent !important;
  color: #6b7280;
  font-weight: 600;
}
:deep(.tracking-tabs.el-tabs--card > .el-tabs__header .el-tabs__item.is-active) {
  color: #ff6a3d !important;
}
:deep(.tracking-tabs.el-tabs--card > .el-tabs__header .el-tabs__nav) {
  border: 0 !important;
}
:deep(.el-table__expanded-cell) {
  padding: 0 !important;
  background: #0f8a73 !important;
}
.yuntrack-row-expanded :deep(td) {
  background: #0f8a73 !important;
  color: #fff;
}
.yuntrack-expand-wrap {
  background: #0f8a73;
  color: #fff;
  padding: 16px 18px;
}
.yuntrack-expand-top {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-bottom: 12px;
}
.yuntrack-expand-action {
  color: #fff;
  opacity: 0.9;
  font-size: 12px;
  border: 0;
  background: transparent;
  cursor: pointer;
}
.yuntrack-expand-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 18px;
}
.yuntrack-left {
  background: #fff;
  border-radius: 8px;
  padding: 14px;
  color: #111827;
}
.yuntrack-right {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.yuntrack-card {
  background: #f3fbf8;
  border-radius: 8px;
  padding: 12px 14px;
  color: #111827;
}
.yuntrack-card-title {
  font-weight: 700;
  margin-bottom: 10px;
  color: #0f766e;
}
.yuntrack-card-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 10px;
  padding: 6px 0;
  border-top: 1px solid rgba(15, 118, 110, 0.12);
}
.yuntrack-card-row:first-of-type {
  border-top: 0;
}
.yuntrack-card-row .k {
  color: #6b7280;
  font-size: 12px;
}
.yuntrack-card-row .v {
  font-size: 13px;
  font-weight: 600;
}
.yuntrack-notes .line {
  font-size: 12px;
  color: #374151;
  padding: 2px 0;
  word-break: break-word;
}
.yuntrack-notes a {
  color: #0f766e;
  text-decoration: underline;
}
.yuntrack-stage-title {
  font-size: 22px;
  font-weight: 800;
  color: #0f766e;
  margin-bottom: 8px;
}
.yuntrack-stage-line {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  padding-bottom: 10px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 10px;
}
.yuntrack-stage-step {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}
.yuntrack-stage-step .dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #10b981;
  display: inline-block;
}
.yuntrack-stage-step.is-pending {
  color: #9ca3af;
}
.yuntrack-stage-step.is-pending .dot {
  background: #d1d5db;
}
.yuntrack-stage-step.is-reached {
  color: #0f766e;
}
.yuntrack-timeline {
  padding-top: 6px;
}
.yuntrack-day-group {
  margin-bottom: 14px;
}
.yuntrack-day-head {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 6px;
}
.yuntrack-day-head .dow {
  font-weight: 800;
  color: #0f766e;
}
.yuntrack-day-head .date {
  font-size: 12px;
  color: #6b7280;
}
.yuntrack-ev {
  display: grid;
  grid-template-columns: 110px 24px 1fr;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
}
.yuntrack-ev:last-child {
  border-bottom: 0;
}
.yuntrack-ev .time {
  font-size: 12px;
  color: #6b7280;
}
.yuntrack-ev .dotline {
  position: relative;
  display: flex;
  justify-content: center;
}
.yuntrack-ev .dotline .dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #10b981;
  margin-top: 2px;
}
.yuntrack-ev .dotline .line {
  position: absolute;
  top: 14px;
  bottom: -12px;
  width: 2px;
  background: rgba(16, 185, 129, 0.35);
}
.yuntrack-ev .desc .title {
  font-weight: 700;
  font-size: 13px;
  color: #111827;
}
.yuntrack-ev .desc .sub {
  margin-top: 2px;
  font-size: 12px;
  color: #6b7280;
}
@media (max-width: 1024px) {
  .yuntrack-expand-grid {
    grid-template-columns: 1fr;
  }
}
</style>

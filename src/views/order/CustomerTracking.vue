<template>
  <div class="tms-public-page p-6 min-h-[60vh]">
    <div v-if="!queryKey && !loading" class="text-center text-gray-500 py-16 text-sm">
      Invalid or missing tracking link.
    </div>

    <div
      v-else
      v-loading="loading"
      class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-6xl mx-auto"
    >
      <div class="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
        <span class="text-lg font-semibold text-gray-800">{{ headerTrackingNo }}</span>
        <el-tag v-if="loading" size="small" type="info">Loading…</el-tag>
        <el-tag v-else-if="detailRow" size="small" :type="statusTagType(detailRow.status_text)">
          {{ statusLabel(detailRow.status_text) }}
        </el-tag>
      </div>

      <div v-if="!loading && detailRow" class="yuntrack-expand-wrap border-0 rounded-b-xl">
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
                    i <= computeProgressIndex(detailRow) ? 'is-reached' : 'is-pending',
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
                v-for="(group, idx) in groupHistoryByDay(detailRow.tracking_history)"
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
              <div v-if="!detailRow.tracking_history?.length" class="text-gray-500 text-sm py-6">
                No tracking events for this number yet.
              </div>
            </div>
          </div>
          <div class="yuntrack-right">
            <div v-if="recipientPanelFields" class="yuntrack-card tms-recipient-card">
              <div class="tms-recipient-title">Delivery address</div>
              <div class="tms-recipient-box">
                <div v-for="f in recipientPanelFields" :key="f.label" class="tms-recipient-field">
                  <div class="tms-recipient-label">{{ f.label }}</div>
                  <div class="tms-recipient-value">{{ f.value }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getPublicTrackingByNumber } from '@/api/tracking'
import { ElMessage } from 'element-plus'

const route = useRoute()
const loading = ref(false)
/** one row from get_public_tracking_by_number, before display mapping */
const rawRow = ref<any | null>(null)

const stageSteps = [
  'Pickup',
  'Departed from origin',
  'Arrived at destination',
  'Local carrier on the way',
  'Delivered successfully'
]

const queryKey = computed(() => {
  const n =
    (route.query.num as string) ||
    (route.query.waybill as string) ||
    (route.query.tracking as string) ||
    (route.query.kw as string) ||
    ''
  return String(n || '')
    .trim()
    .slice(0, 200)
})

function normalizeStatusKey(statusText: any) {
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
    latest_event: latest ? (latest.description || latest.event || '') : ''
  }
}

function getLastMileTrackingNo(lastMile: any): string {
  const v = lastMile?.tracking_number
  return v && String(v).trim() ? String(v).trim() : ''
}

type PublicRecipient = {
  recipient_country?: string
  recipient_state?: string
  recipient_city?: string
  recipient_address?: string
}

const headerTrackingNo = computed(() => detailRow.value?.display_tracking_no || queryKey.value)

/** 仅国家与地址（LOS recipient_country/state/city/address），不含姓名/电话/邮箱 */
const RECIPIENT_FIELD_DEF: ReadonlyArray<[keyof PublicRecipient, string]> = [
  ['recipient_country', 'Country'],
  ['recipient_state', 'State / Province'],
  ['recipient_city', 'City'],
  ['recipient_address', 'Address'],
]

const recipientPanelFields = computed(() => {
  const r = rawRow.value?.recipient as PublicRecipient | undefined
  if (!r || typeof r !== 'object') return null
  const rows = RECIPIENT_FIELD_DEF.map(([key, label]) => ({
    label,
    value: String(r[key] ?? '').trim() || '—',
  }))
  if (!rows.some((x) => x.value !== '—')) return null
  return rows
})

const detailRow = computed(() => {
  const r = rawRow.value
  if (!r) return null
  const tracking = r?.tracking || null
  const failMsg = tracking && tracking.success === false ? String(tracking?.message || 'Query failed') : ''
  const trackingData =
    failMsg || !tracking
      ? {}
      : tracking.data && typeof tracking.data === 'object'
        ? tracking.data
        : {}
  const hist = Array.isArray(trackingData?.tracking_history) ? trackingData.tracking_history : []
  const { latest_time, latest_event } = computeLatest(hist)
  const status_text = failMsg
    ? `error: ${failMsg}`
    : !tracking
      ? 'No data'
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
    tracking_history: hist
  }
})

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

function statusLabel(s: string) {
  const x = String(s || '').toLowerCase()
  if (x === 'no data') return 'No data'
  if (x.includes('error:')) return 'Error'
  if (x.includes('delivered')) return 'Delivered'
  if (x.includes('return')) return 'Returned'
  if (x.includes('alert') || x.includes('exception')) return 'Exception'
  if (x.includes('transit')) return 'In Transit'
  return 'Processing'
}

function statusTagType(s: string) {
  const x = String(s || '').toLowerCase()
  if (x === 'no data') return 'info'
  if (x.includes('error:')) return 'danger'
  if (x.includes('delivered')) return 'success'
  if (x.includes('return')) return 'warning'
  if (x.includes('alert') || x.includes('exception')) return 'danger'
  if (x.includes('transit')) return 'primary'
  return 'info'
}

function emptyShellRow(key: string) {
  return {
    sales_order: '',
    destination_country: '',
    waybill_number: key,
    tracking_number: key,
    primary_tracking_no: key,
    tracking: null as any,
    last_mile: null,
    recipient: null as PublicRecipient | null
  }
}

async function load() {
  rawRow.value = null
  const key = queryKey.value
  if (!key) return

  loading.value = true
  try {
    const tr = await getPublicTrackingByNumber(key)
    const msg = (tr as any)?.message ?? tr
    if (!msg?.success) {
      ElMessage.error(String(msg?.error || msg?.message || 'Failed to load tracking'))
      rawRow.value = emptyShellRow(key)
      return
    }
    const d = msg.data
    if (!d?.tracking) {
      rawRow.value = emptyShellRow(key)
      return
    }
    const dest = String(d.tracking?.data?.destination_country || '').trim()
    rawRow.value = {
      sales_order: '',
      destination_country: dest,
      waybill_number: key,
      tracking_number: d.tracking.tracking_number || key,
      primary_tracking_no: d.tracking.tracking_number || key,
      tracking: { ...d.tracking, success: true },
      last_mile: null,
      recipient: (d.recipient as PublicRecipient) || null,
    }
  } catch (e: any) {
    ElMessage.error(e?.message || 'Failed to load tracking')
    rawRow.value = emptyShellRow(key)
  } finally {
    loading.value = false
  }
}

onMounted(load)

watch(
  () => route.fullPath,
  () => load()
)
</script>

<style scoped>
.tms-public-page :deep(.el-loading-mask) {
  border-radius: 12px;
}
.yuntrack-expand-wrap {
  background: #0f8a73;
  color: #fff;
  padding: 16px 18px;
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
.tms-recipient-card {
  background: #fff;
  border: 1px solid rgba(255, 255, 255, 0.35);
}
.tms-recipient-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 10px;
}
.tms-recipient-box {
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fafafa;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.tms-recipient-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}
.tms-recipient-value {
  font-size: 14px;
  color: #111827;
  line-height: 1.45;
  border-radius: 6px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  padding: 8px 10px;
  word-break: break-word;
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

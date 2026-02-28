import { useTimeAgo as useTimeAgoCore, UseTimeAgoMessages } from '@vueuse/core'
import { computed, unref } from 'vue'
// import { useLocaleStoreWithOut } from '@/store/modules/locale'

const TIME_AGO_MESSAGE_MAP: {
  'zh-CN': UseTimeAgoMessages
  en: UseTimeAgoMessages
} = {
  'zh-CN': {
    justNow: '刚刚',
    invalid: '无效时间',
    past: (n: any) => (n.match(/\d/) ? `${n}前` : n),
    future: (n: any) => (n.match(/\d/) ? `${n}后` : n),
    month: (n: number, past: boolean) => (n === 1 ? (past ? '上个月' : '下个月') : `${n} 个月`),
    year: (n: number, past: boolean) => (n === 1 ? (past ? '去年' : '明年') : `${n} 年`),
    day: (n: number, past: boolean) => (n === 1 ? (past ? '昨天' : '明天') : `${n} 天`),
    week: (n: number, past: boolean) => (n === 1 ? (past ? '上周' : '下周') : `${n} 周`),
    hour: (n: number) => `${n} 小时`,
    minute: (n: number) => `${n} 分钟`,
    second: (n: number) => `${n} 秒`
  },
  en: {
    justNow: '刚刚',
    invalid: 'Invalid Date',
    past: (n: any) => (n.match(/\d/) ? `${n} ago` : n),
    future: (n: any) => (n.match(/\d/) ? `in ${n}` : n),
    month: (n: number, past: boolean) =>
      n === 1 ? (past ? 'last month' : 'next month') : `${n} month${n > 1 ? 's' : ''}`,
    year: (n: number, past: boolean) =>
      n === 1 ? (past ? 'last year' : 'next year') : `${n} year${n > 1 ? 's' : ''}`,
    day: (n: number, past: boolean) => (n === 1 ? (past ? 'yesterday' : 'tomorrow') : `${n} day${n > 1 ? 's' : ''}`),
    week: (n: number, past: boolean) =>
      n === 1 ? (past ? 'last week' : 'next week') : `${n} week${n > 1 ? 's' : ''}`,
    hour: (n: number) => `${n} hour${n > 1 ? 's' : ''}`,
    minute: (n: number) => `${n} minute${n > 1 ? 's' : ''}`,
    second: (n: number) => `${n} second${n > 1 ? 's' : ''}`
  }
}

export const useTimeAgo = (time: Date | number | string) => {
  // const localeStore = useLocaleStoreWithOut()

  const currentLocale = computed(() => ({ lang: 'zh-CN' })) // localeStore.getCurrentLocale)

  const timeAgo = useTimeAgoCore(time, {
    messages: TIME_AGO_MESSAGE_MAP[unref(currentLocale).lang as 'zh-CN' | 'en']
  })

  return timeAgo
}

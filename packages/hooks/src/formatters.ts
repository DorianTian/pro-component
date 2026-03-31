import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)

/** Locale-specific date format patterns */
const DATE_FORMATS: Record<string, Record<string, string>> = {
  'zh-CN': {
    date: 'YYYY-MM-DD',
    dateTime: 'YYYY-MM-DD HH:mm:ss',
  },
  'en-US': {
    date: 'MM/DD/YYYY',
    dateTime: 'MM/DD/YYYY h:mm:ss A',
  },
}

/** Format a date/dateTime value according to the given locale pattern */
export function formatDate(
  value: Date | string | number,
  valueType: 'date' | 'dateTime',
  locale: string,
): string {
  const fmt = DATE_FORMATS[locale]?.[valueType] ?? DATE_FORMATS['en-US'][valueType]
  return dayjs(value).format(fmt)
}

/** Format a value as relative time (e.g., "2 hours ago"). Respects current dayjs locale. */
export function formatRelativeTime(value: Date | string | number): string {
  return dayjs(value).fromNow()
}

/** Format a number with locale-appropriate grouping separators */
export function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value)
}

/** Format a monetary value. Defaults to CNY for zh-CN and USD for en-US. */
export function formatMoney(value: number, locale: string, currency?: string): string {
  const cur = currency ?? (locale === 'zh-CN' ? 'CNY' : 'USD')
  return new Intl.NumberFormat(locale, { style: 'currency', currency: cur }).format(value)
}

/** Format a decimal value as a percentage with one fraction digit */
export function formatPercent(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 1,
  }).format(value)
}

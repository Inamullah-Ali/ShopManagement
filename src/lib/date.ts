import { format } from "date-fns"

export type DateValue =
  | Date
  | string
  | number
  | { seconds?: number; nanoseconds?: number }
  | null
  | undefined

export const DEFAULT_DATE_FORMAT = "dd MMMM yyyy"
export const DEFAULT_TIME_FORMAT = "hh:mm a"
export const DEFAULT_DATE_TIME_FORMAT = `${DEFAULT_DATE_FORMAT} ${DEFAULT_TIME_FORMAT}`

function normalizeDate(value?: DateValue): Date | null {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return value
  }

  if (typeof value === "number") {
    return new Date(value)
  }

  if (typeof value === "string") {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  if (typeof value === "object" && value !== null && typeof value.seconds === "number") {
    return new Date(value.seconds * 1000)
  }

  return null
}

export function formatDate(value?: DateValue, dateFormat = DEFAULT_DATE_FORMAT) {
  const date = normalizeDate(value)
  if (date) return format(date, dateFormat)
  return typeof value === "string" ? value : ""
}

export function formatTime(value?: DateValue, timeFormat = DEFAULT_TIME_FORMAT) {
  const date = normalizeDate(value)
  if (date) return format(date, timeFormat)
  return typeof value === "string" ? value : ""
}

export function formatDateTime(
  value?: DateValue,
  dateTimeFormat = DEFAULT_DATE_TIME_FORMAT,
) {
  const date = normalizeDate(value)
  if (date) return format(date, dateTimeFormat)
  return typeof value === "string" ? value : ""
}

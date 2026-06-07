import {
  format,
} from "date-fns";
import { Timestamp } from "firebase/firestore";


export function formatTimestamp(
  ts?: Timestamp | null,
  fmt: string = "hh:mm a",
): string {
  if (!ts) return "--:--";
  return format(ts.toDate(), fmt);
}

/**
 * Format a Firestore Timestamp into a date string (default long date)
 */
export function formatDate(
  ts?: Timestamp | null,
  fmt: string = "dd MMMM yyyy",
): string {
  if (!ts) return "--";
  return format(ts.toDate(), fmt);
}

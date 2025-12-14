import { parseISO, differenceInCalendarDays, addDays, formatISO } from "date-fns";
import { clamp } from "@/lib/utils";
import { Task } from "@/lib/model";

export function iso(d: Date) {
  return formatISO(d, { representation: "date" });
}

export function daysBetween(aIso: string, bIso: string) {
  return differenceInCalendarDays(parseISO(bIso), parseISO(aIso));
}

export function computeViewport(tasks: Task[]) {
  // Determine timeline range from planned + actual dates
  const dates: Date[] = [];
  for (const t of tasks) {
    dates.push(parseISO(t.plannedStart), parseISO(t.plannedEnd));
    if (t.actualStart) dates.push(parseISO(t.actualStart));
    if (t.actualEnd) dates.push(parseISO(t.actualEnd));
  }
  const min = dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : new Date();
  const max = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : addDays(new Date(), 14);

  // pad the ends a bit for aesthetics
  const start = addDays(min, -2);
  const end = addDays(max, 3);

  const totalDays = Math.max(1, differenceInCalendarDays(end, start) + 1);
  return { start, end, totalDays };
}

export function barLeftPx(startIso: string, viewportStart: Date, dayWidth: number) {
  const leftDays = differenceInCalendarDays(parseISO(startIso), viewportStart);
  return leftDays * dayWidth;
}

export function barWidthPx(startIso: string, endIso: string, dayWidth: number) {
  const wDays = differenceInCalendarDays(parseISO(endIso), parseISO(startIso)) + 1;
  return Math.max(dayWidth * 0.75, wDays * dayWidth);
}

export function expectedProgressForTask(t: Task, today: Date) {
  // Expected progress based on planned start/end and today's date
  const s = parseISO(t.plannedStart);
  const e = parseISO(t.plannedEnd);

  if (today <= s) return 0;
  if (today >= e) return 100;

  const total = differenceInCalendarDays(e, s);
  const done = differenceInCalendarDays(today, s);
  const pct = total <= 0 ? 100 : (done / total) * 100;
  return clamp(Math.round(pct), 0, 100);
}

export function behindAheadLabel(actual: number, expected: number) {
  const delta = actual - expected;
  if (Math.abs(delta) <= 4) return { text: "on track", kind: "ok" as const };
  if (delta < 0) return { text: `${Math.abs(delta)}% behind`, kind: "bad" as const };
  return { text: `${delta}% ahead`, kind: "good" as const };
}

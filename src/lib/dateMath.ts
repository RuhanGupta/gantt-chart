import { differenceInCalendarDays, parseISO, eachDayOfInterval, isWeekend } from "date-fns";

export function durationDaysInclusive(startIso: string, endIso: string) {
  return differenceInCalendarDays(parseISO(endIso), parseISO(startIso)) + 1;
}

export function workDaysInclusive(startIso: string, endIso: string) {
  const days = eachDayOfInterval({ start: parseISO(startIso), end: parseISO(endIso) });
  return days.filter((d) => !isWeekend(d)).length;
}

"use client";

import { useMemo, useState } from "react";
import type { Task } from "@/lib/model";
import {
  addDays,
  differenceInCalendarDays,
  format,
  isSameDay,
  parseISO,
} from "date-fns";
import { cn } from "@/lib/utils";

function computeRange(tasks: Task[]) {
  const dates = tasks.flatMap((t) => [parseISO(t.plannedStart), parseISO(t.plannedEnd)]);
  const min = dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : new Date();
  const max = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : addDays(new Date(), 14);
  const start = addDays(min, -2);
  const end = addDays(max, 3);
  const totalDays = Math.max(1, differenceInCalendarDays(end, start) + 1);
  return { start, end, totalDays };
}

function leftPx(dateIso: string, start: Date, dayW: number) {
  return differenceInCalendarDays(parseISO(dateIso), start) * dayW;
}

function widthPx(sIso: string, eIso: string, dayW: number) {
  return (differenceInCalendarDays(parseISO(eIso), parseISO(sIso)) + 1) * dayW;
}

function expectedProgress(startIso: string, endIso: string) {
  const today = new Date();
  const s = parseISO(startIso);
  const e = parseISO(endIso);

  if (today <= s) return 0;
  if (today >= e) return 100;

  const total = differenceInCalendarDays(e, s);
  const done = differenceInCalendarDays(today, s);
  return Math.round((done / Math.max(1, total)) * 100);
}

function todayLeftPx(rangeStart: Date, dayW: number) {
  const t0 = new Date();
  t0.setHours(0, 0, 0, 0);

  const s0 = new Date(rangeStart);
  s0.setHours(0, 0, 0, 0);

  const days = (t0.getTime() - s0.getTime()) / (1000 * 60 * 60 * 24);
  return days * dayW;
}

export default function PlannedGantt({
  tasks,
  onTaskClick,
}: {
  tasks: Task[];
  onTaskClick: (t: Task) => void;
}) {
  const [dayW, setDayW] = useState(20);

  const sorted = useMemo(
    () => tasks.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [tasks]
  );

  const range = useMemo(() => computeRange(sorted), [sorted]);

  const days = useMemo(() => {
    const out: Date[] = [];
    for (let i = 0; i < range.totalDays; i++) out.push(addDays(range.start, i));
    return out;
  }, [range]);

  const today = new Date();

  return (
    <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
      {/* Header */}
      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className="text-base font-semibold text-white">Schedule</div>
          <div className="text-sm text-white/60">
            Planned only · {format(range.start, "d MMM")} → {format(range.end, "d MMM")}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="rounded-full bg-white/5 px-3 py-1 text-sm ring-1 ring-white/10 hover:bg-white/10"
            onClick={() => setDayW((w) => Math.max(14, w - 2))}
          >
            −
          </button>
          <div className="text-sm text-white/60">zoom</div>
          <button
            className="rounded-full bg-white/5 px-3 py-1 text-sm ring-1 ring-white/10 hover:bg-white/10"
            onClick={() => setDayW((w) => Math.min(30, w + 2))}
          >
            +
          </button>
        </div>
      </div>

      {/* Date strip */}
      <div className="grid grid-cols-[320px_1fr] gap-3">
        <div className="text-xs text-white/50">Task</div>

        <div className="relative overflow-hidden rounded-2xl bg-black/20 ring-1 ring-white/10">
          {/* Today line */}
          <div
            className="absolute top-0 bottom-0 z-10 w-[2px] bg-orange-400/80"
            style={{ left: todayLeftPx(range.start, dayW) }}
          />

          <div className="flex">
            {days.map((d) => {
              const isToday = isSameDay(d, today);
              return (
                <div
                  key={d.toISOString()}
                  style={{ width: dayW }}
                  className={cn(
                    "h-9 border-r border-white/5 text-center text-[10px] leading-9 text-white/60",
                    isToday && "bg-white/[0.08] text-white"
                  )}
                  title={format(d, "EEE, MMM d")}
                >
                  {format(d, "d")}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rows */}
      <div className="mt-3 space-y-2">
        {sorted.map((t) => {
          const left = leftPx(t.plannedStart, range.start, dayW);
          const width = Math.max(10, widthPx(t.plannedStart, t.plannedEnd, dayW));
          const progress = Math.max(0, Math.min(100, t.progress ?? 0));
          const progressW = Math.max(6, (width * progress) / 100);

          const expected = expectedProgress(t.plannedStart, t.plannedEnd);
          const behind = progress + 5 < expected;

          const fillClass =
            progress < 30
              ? "bg-red-500/80"
              : progress < 70
              ? "bg-amber-400/85"
              : "bg-emerald-500/85";

          return (
            <button
              key={t.id}
              onClick={() => onTaskClick(t)}
              className="grid w-full grid-cols-[320px_1fr] items-center gap-3 rounded-2xl px-2 py-2 hover:bg-white/5"
            >
              <div className="min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <div className="truncate text-sm font-medium text-white">{t.title}</div>
                  {behind && (
                    <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-medium text-red-200 ring-1 ring-red-500/30">
                      behind
                    </span>
                  )}
                  <div className="ml-auto text-xs tabular-nums text-white/70">{progress}%</div>
                </div>
                <div className="mt-1 text-xs text-white/50">
                  {t.plannedStart} → {t.plannedEnd} · expected {expected}%
                </div>
              </div>

              <div className="relative h-11 overflow-hidden rounded-2xl bg-black/20 ring-1 ring-white/10">
                {/* Today line */}
                <div
                  className="absolute top-0 bottom-0 z-10 w-[2px] bg-orange-400/80"
                  style={{ left: todayLeftPx(range.start, dayW) }}
                />

                {/* planned bar track */}
                <div
                  className="absolute top-1/2 h-6 -translate-y-1/2 rounded-full bg-white/10"
                  style={{ left, width }}
                />

                {/* progress fill */}
                <div
                  className={cn("absolute top-1/2 h-6 -translate-y-1/2 rounded-full", fillClass)}
                  style={{ left, width: progressW }}
                />

                {/* label on bar */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 text-[11px] font-medium text-white/90"
                  style={{ left: left + 10 }}
                >
                  {format(parseISO(t.plannedStart), "d MMM")} – {format(parseISO(t.plannedEnd), "d MMM")}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

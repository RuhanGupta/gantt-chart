"use client";

import { useMemo, useState } from "react";
import { Task } from "@/lib/model";
import { computeViewport, iso } from "./ganttMath";
import { GanttRow } from "./GanttRow";
import { cn } from "@/lib/utils";
import { addDays, format, isSameDay } from "date-fns";

export function GanttChart({
  tasks,
  onTaskClick,
}: {
  tasks: Task[];
  onTaskClick: (t: Task) => void;
}) {
  const [dayWidth, setDayWidth] = useState(18); // tweak: 14–28 looks good

  const viewport = useMemo(() => computeViewport(tasks), [tasks]);
  const days = useMemo(() => {
    const arr: Date[] = [];
    for (let i = 0; i < viewport.totalDays; i++) arr.push(addDays(viewport.start, i));
    return arr;
  }, [viewport]);

  const today = new Date();

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-base font-semibold tracking-tight">Gantt</div>
          <div className="text-sm text-white/60">
            Planned (baseline) + Actual (live) · {iso(viewport.start)} → {iso(viewport.end)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className={cn("rounded-full bg-white/5 px-3 py-1 text-sm ring-1 ring-white/10 hover:bg-white/10")}
            onClick={() => setDayWidth((w) => Math.max(14, w - 2))}
          >
            −
          </button>
          <div className="text-sm text-white/60">zoom</div>
          <button
            className={cn("rounded-full bg-white/5 px-3 py-1 text-sm ring-1 ring-white/10 hover:bg-white/10")}
            onClick={() => setDayWidth((w) => Math.min(28, w + 2))}
          >
            +
          </button>
        </div>
      </div>

      {/* Day ticks */}
      <div className="grid grid-cols-[320px_1fr] items-center gap-3">
        <div className="text-xs text-white/50">Tasks</div>
        <div className="relative overflow-hidden rounded-2xl bg-black/20 ring-1 ring-white/10">
          <div className="flex">
            {days.map((d) => {
              const weekend = [0, 6].includes(d.getDay());
              const isToday = isSameDay(d, today);
              return (
                <div
                  key={d.toISOString()}
                  style={{ width: dayWidth }}
                  className={cn(
                    "h-8 border-r border-white/5 text-center text-[10px] leading-8",
                    weekend && "bg-white/[0.03]",
                    isToday && "bg-white/[0.07] text-white"
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
      <div className="rounded-3xl bg-white/5 p-2 ring-1 ring-white/10">
        <div className="space-y-1">
          {tasks.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-white/60">No tasks yet.</div>
          ) : (
            tasks
              .slice()
              .sort((a, b) => a.plannedStart.localeCompare(b.plannedStart))
              .map((t) => (
                <GanttRow
                  key={t.id}
                  task={t}
                  viewportStart={viewport.start}
                  dayWidth={dayWidth}
                  onClick={() => onTaskClick(t)}
                />
              ))
          )}
        </div>
      </div>
    </div>
  );
}

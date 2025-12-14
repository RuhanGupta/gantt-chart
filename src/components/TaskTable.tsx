"use client";

import { useMemo } from "react";
import type { Task } from "@/lib/model";
import { durationDaysInclusive, workDaysInclusive } from "@/lib/dateMath";
import { cn } from "@/lib/utils";

export default function TaskTable({
  tasks,
  onRowClick,
}: {
  tasks: Task[];
  onRowClick: (t: Task) => void;
}) {
  const rows = useMemo(
    () => tasks.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [tasks]
  );

  return (
    <div className="overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10">
      <div className="grid grid-cols-[80px_1fr_120px_120px_70px_80px_90px] gap-0 border-b border-white/10 bg-white/5 text-xs text-white/70">
        {["WBS", "Task", "Start", "End", "Days", "% Done", "Work Days"].map((h) => (
          <div key={h} className="px-3 py-2 font-medium">
            {h}
          </div>
        ))}
      </div>

      {rows.map((t) => {
        const days = durationDaysInclusive(t.plannedStart, t.plannedEnd);
        const work = workDaysInclusive(t.plannedStart, t.plannedEnd);

        return (
          <button
            key={t.id}
            onClick={() => onRowClick(t)}
            className={cn(
              "grid w-full grid-cols-[80px_1fr_120px_120px_70px_80px_90px] text-left",
              "border-b border-white/5 hover:bg-white/5"
            )}
          >
            <div className="px-3 py-2 text-sm text-white/80">{t.wbs ?? ""}</div>
            <div className="px-3 py-2 text-sm text-white">{t.title}</div>
            <div className="px-3 py-2 text-sm text-white/80">{t.plannedStart}</div>
            <div className="px-3 py-2 text-sm text-white/80">{t.plannedEnd}</div>
            <div className="px-3 py-2 text-sm text-white/80">{days}</div>
            <div className="px-3 py-2 text-sm text-white/80">{t.progress ?? 0}%</div>
            <div className="px-3 py-2 text-sm text-white/80">{work}</div>
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { Task } from "@/lib/model";
import { barLeftPx, barWidthPx, expectedProgressForTask, behindAheadLabel } from "./ganttMath";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function GanttRow({
  task,
  viewportStart,
  dayWidth,
  onClick,
}: {
  task: Task;
  viewportStart: Date;
  dayWidth: number;
  onClick: () => void;
}) {
  const today = new Date();

  const expected = useMemo(() => expectedProgressForTask(task, today), [task, today]);
  const delta = useMemo(() => behindAheadLabel(task.progress ?? 0, expected), [task.progress, expected]);

  const plannedLeft = barLeftPx(task.plannedStart, viewportStart, dayWidth);
  const plannedWidth = barWidthPx(task.plannedStart, task.plannedEnd, dayWidth);

  const actualStart = task.actualStart ?? task.plannedStart;
  const actualEnd = task.actualEnd ?? task.plannedEnd;

  const actualLeft = barLeftPx(actualStart, viewportStart, dayWidth);
  const actualWidth = barWidthPx(actualStart, actualEnd, dayWidth);

  return (
    <button
      onClick={onClick}
      className={cn(
        "group grid w-full grid-cols-[320px_1fr] items-center gap-3 rounded-2xl px-3 py-3",
        "hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
      )}
    >
      <div className="min-w-0 text-left">
        <div className="flex items-center gap-2">
          <div className="truncate text-sm font-medium">{task.title}</div>
          <Badge
            className={cn(
              "ml-auto bg-black/30 text-white ring-1 ring-white/10",
              task.status === "blocked" && "bg-red-500/15 text-red-200 ring-red-500/30",
              task.status === "done" && "bg-emerald-500/15 text-emerald-200 ring-emerald-500/30"
            )}
          >
            {task.status}
          </Badge>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <Progress value={task.progress ?? 0} className="h-2 bg-white/10" />
          <span className="text-xs tabular-nums text-white/60">{task.progress ?? 0}%</span>
          <span
            className={cn(
              "text-xs tabular-nums",
              delta.kind === "bad" && "text-red-200",
              delta.kind === "good" && "text-emerald-200",
              delta.kind === "ok" && "text-white/60"
            )}
          >
            · {delta.text} (expected {expected}%)
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative h-10 overflow-hidden rounded-2xl bg-black/20 ring-1 ring-white/10">
        {/* planned baseline */}
        <div
          className="absolute top-1/2 h-3 -translate-y-1/2 rounded-full bg-white/10 ring-1 ring-white/10"
          style={{ left: plannedLeft, width: plannedWidth }}
          title="Planned"
        />
        {/* actual */}
        <div
          className={cn(
            "absolute top-1/2 h-3 -translate-y-1/2 rounded-full ring-1",
            task.status === "blocked"
              ? "bg-red-500/20 ring-red-500/30"
              : task.status === "done"
              ? "bg-emerald-500/20 ring-emerald-500/30"
              : "bg-white/25 ring-white/25"
          )}
          style={{ left: actualLeft, width: actualWidth }}
          title="Actual"
        />
        {/* progress fill indicator inside actual bar */}
        <div
          className={cn(
            "absolute top-1/2 h-3 -translate-y-1/2 rounded-full",
            task.status === "blocked"
              ? "bg-red-300/30"
              : task.status === "done"
              ? "bg-emerald-300/30"
              : "bg-white/35"
          )}
          style={{
            left: actualLeft,
            width: Math.max(6, (actualWidth * (task.progress ?? 0)) / 100),
          }}
        />
      </div>
    </button>
  );
}

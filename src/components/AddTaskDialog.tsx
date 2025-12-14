"use client";

import { useMemo, useState } from "react";
import { addDays, formatISO, parseISO } from "date-fns";

import { useAppStore } from "@/lib/store";
import type { Task } from "@/lib/model";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function isoToday() {
  return formatISO(new Date(), { representation: "date" });
}

function computeNextStartIso(projectTasks: Task[]) {
  if (projectTasks.length === 0) return isoToday();
  const last = projectTasks[projectTasks.length - 1];
  // next task starts the day after the last task ends
  return formatISO(addDays(parseISO(last.plannedEnd), 1), { representation: "date" });
}

function computeEndIso(startIso: string, durationDays: number) {
  const start = parseISO(startIso);
  const dur = Math.max(1, durationDays);
  const end = addDays(start, dur - 1);
  return formatISO(end, { representation: "date" });
}

function nextWbs(projectTasks: Task[]) {
  // Simple WBS like 1.1, 1.2, 1.3 ...
  const used = projectTasks
    .map((t) => t.wbs)
    .filter(Boolean)
    .map((w) => Number(String(w).split(".")[1]))
    .filter((n) => Number.isFinite(n)) as number[];

  const next = (used.length ? Math.max(...used) : 0) + 1;
  return `1.${next}`;
}

export default function AddTaskDialog({
  open,
  onOpenChange,
  projectId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectId: string;
}) {
  const addTask = useAppStore((s) => s.addTask);

  // ✅ select raw tasks only
  const allTasks = useAppStore((s) => s.tasks);

  const projectTasks = useMemo(() => {
    return allTasks
      .filter((t) => t.projectId === projectId)
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [allTasks, projectId]);

  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState<number>(2);
  const [percent, setPercent] = useState<number>(0);

  const startIso = useMemo(() => computeNextStartIso(projectTasks), [projectTasks]);
  const endIso = useMemo(() => computeEndIso(startIso, duration), [startIso, duration]);

  const save = () => {
    const name = title.trim();
    if (!name) return;

    const safePct = Math.max(0, Math.min(100, Number(percent)));
    const nextOrder = (projectTasks[projectTasks.length - 1]?.order ?? projectTasks.length) + 1;

    // We rely on store.addTask to accept plannedStart/plannedEnd.
    // If your store has the auto-chaining logic, this will still work; we already chain here anyway.
    addTask(projectId, {
      title: name,
      plannedStart: startIso,
      plannedEnd: endIso,
      progress: safePct,
      status: safePct >= 100 ? "done" : safePct > 0 ? "doing" : "todo",
      order: nextOrder,
      wbs: nextWbs(projectTasks),
    });

    setTitle("");
    setDuration(2);
    setPercent(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#0b0f17] text-white">
        <DialogHeader>
          <DialogTitle>Add task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-white/60">Task</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design PCB"
              className="bg-white/5 text-white border-white/10 focus-visible:ring-white/20"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs text-white/60">Duration (days)</label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))}
                className="bg-white/5 text-white border-white/10 focus-visible:ring-white/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-white/60">% done</label>
              <Input
                type="number"
                value={percent}
                onChange={(e) => setPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                className="bg-white/5 text-white border-white/10 focus-visible:ring-white/20"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-black/20 p-3 ring-1 ring-white/10">
            <div className="text-xs text-white/60">Scheduled</div>
            <div className="mt-1 text-sm text-white">
              {startIso} → {endIso}
            </div>
            <div className="mt-1 text-xs text-white/50">
              (Auto-chained after the previous task)
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              className="bg-white/10 text-white hover:bg-white/15"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button className="bg-white text-black hover:bg-white/90" onClick={save}>
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

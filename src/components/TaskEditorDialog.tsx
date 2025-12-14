"use client";

import { useEffect, useState } from "react";
import { Task } from "@/lib/model";
import { useAppStore } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const statuses: Task["status"][] = ["todo", "doing", "blocked", "done"];

export function TaskEditorDialog({
  open,
  onOpenChange,
  task,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task: Task | null;
}) {
  const updateTask = useAppStore((s) => s.updateTask);
  const deleteTask = useAppStore((s) => s.deleteTask);

  const [local, setLocal] = useState<Task | null>(task);

  useEffect(() => {
    setLocal(task);
  }, [task]);

  if (!local) return null;

  const set = (patch: Partial<Task>) => setLocal((t) => (t ? { ...t, ...patch } : t));

  const save = () => {
    updateTask(local.id, {
      title: local.title,
      plannedStart: local.plannedStart,
      plannedEnd: local.plannedEnd,
      actualStart: local.actualStart,
      actualEnd: local.actualEnd,
      progress: Number(local.progress ?? 0),
      status: local.status,
      pinnedToToday: local.pinnedToToday ?? false,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#0b0f17] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit Task <Badge className="bg-white/10 text-white/80 ring-1 ring-white/10">{local.status}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-white/60">Title</label>
            <Input
              value={local.title}
              onChange={(e) => set({ title: e.target.value })}
              className="bg-white/5 text-white border-white/10 focus-visible:ring-white/20"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs text-white/60">Planned start</label>
              <Input
                value={local.plannedStart}
                onChange={(e) => set({ plannedStart: e.target.value })}
                className="bg-white/5 text-white border-white/10 focus-visible:ring-white/20"
                placeholder="yyyy-mm-dd"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/60">Planned end</label>
              <Input
                value={local.plannedEnd}
                onChange={(e) => set({ plannedEnd: e.target.value })}
                className="bg-white/5 text-white border-white/10 focus-visible:ring-white/20"
                placeholder="yyyy-mm-dd"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs text-white/60">Actual start</label>
              <Input
                value={local.actualStart ?? ""}
                onChange={(e) => set({ actualStart: e.target.value || undefined })}
                className="bg-white/5 text-white border-white/10 focus-visible:ring-white/20"
                placeholder="yyyy-mm-dd (optional)"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/60">Actual end</label>
              <Input
                value={local.actualEnd ?? ""}
                onChange={(e) => set({ actualEnd: e.target.value || undefined })}
                className="bg-white/5 text-white border-white/10 focus-visible:ring-white/20"
                placeholder="yyyy-mm-dd (optional)"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs text-white/60">Progress (0–100)</label>
              <Input
                type="number"
                value={local.progress ?? 0}
                onChange={(e) => set({ progress: Number(e.target.value) })}
                className="bg-white/5 text-white border-white/10 focus-visible:ring-white/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-white/60">Status</label>
              <div className="flex flex-wrap gap-2">
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => set({ status: s })}
                    className={[
                      "rounded-full px-3 py-1 text-sm ring-1",
                      local.status === s ? "bg-white text-black ring-white/30" : "bg-white/5 text-white ring-white/10 hover:bg-white/10",
                    ].join(" ")}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={local.pinnedToToday ?? false}
              onChange={(e) => set({ pinnedToToday: e.target.checked })}
            />
            Pin to Today
          </label>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="destructive"
              onClick={() => {
                deleteTask(local.id);
                onOpenChange(false);
              }}
            >
              Delete
            </Button>

            <div className="flex gap-2">
              <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/15" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button className="bg-white text-black hover:bg-white/90" onClick={save}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

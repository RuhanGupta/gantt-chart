"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useAppStore, selectProjects, selectTasks } from "@/lib/store";
import type { Task } from "@/lib/model";

import { Button } from "@/components/ui/button";
import AddTaskDialog from "@/components/AddTaskDialog";
import { TaskEditorDialog } from "@/components/TaskEditorDialog";
import PlannedGantt from "@/components/Gantt/PlannedGantt";
import ProjectManagerDialog from "@/components/ProjectManagerDialog";

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const projects = useAppStore(selectProjects);
  const allTasks = useAppStore(selectTasks);

  const project = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projects, projectId]
  );

  const tasks = useMemo(() => {
    return allTasks
      .filter((t) => t.projectId === projectId)
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [allTasks, projectId]);

  const progressSummary = useMemo(() => {
    if (tasks.length === 0) return { avg: 0, done: 0, total: 0 };
    const total = tasks.length;
    const avg = Math.round(tasks.reduce((sum, t) => sum + (t.progress ?? 0), 0) / total);
    const done = tasks.filter((t) => (t.progress ?? 0) >= 100).length;
    return { avg, done, total };
  }, [tasks]);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [pmOpen, setPmOpen] = useState(false);
  const [pmMode, setPmMode] = useState<"rename" | "delete">("rename");

  const selected = useMemo<Task | null>(() => {
    if (!selectedId) return null;
    return tasks.find((t) => t.id === selectedId) ?? null;
  }, [tasks, selectedId]);

  if (!project) {
    return (
      <div className="rounded-3xl bg-white/5 p-8 text-white ring-1 ring-white/10">
        Project not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span
              className="h-3 w-3 rounded-full ring-2 ring-white/20"
              style={{ background: project.color }}
            />
            <h1 className="text-xl font-semibold tracking-tight text-white">
              {project.name}
            </h1>
          </div>
          <p className="mt-1 text-sm text-white/60">
            Planned schedule only · tasks auto-chain sequentially · progress colors + Today line
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            className="bg-white/10 text-white hover:bg-white/15"
            onClick={() => {
              setPmMode("rename");
              setPmOpen(true);
            }}
          >
            Rename
          </Button>

          <Button
            className="bg-red-500 text-white hover:bg-red-500/90"
            onClick={() => {
              setPmMode("delete");
              setPmOpen(true);
            }}
          >
            Delete
          </Button>

          <Button className="bg-white text-black hover:bg-white/90" onClick={() => setAddOpen(true)}>
            + Add Task
          </Button>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="flex items-center justify-between gap-6">
          <div>
            <div className="text-sm text-white/60">Overall progress</div>
            <div className="mt-1 text-lg font-semibold text-white">{progressSummary.avg}% complete</div>
            <div className="text-xs text-white/50">
              {progressSummary.done} of {progressSummary.total} tasks finished
            </div>
          </div>

          <div className="w-[240px]">
            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progressSummary.avg}%`,
                  background:
                    progressSummary.avg < 40 ? "#ef4444" : progressSummary.avg < 75 ? "#f59e0b" : "#22c55e",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Gantt */}
      <PlannedGantt
        tasks={tasks}
        onTaskClick={(t) => {
          setSelectedId(t.id);
          setEditOpen(true);
        }}
      />

      {/* Add Task */}
      <AddTaskDialog open={addOpen} onOpenChange={setAddOpen} projectId={projectId} />

      {/* Edit Task */}
      <TaskEditorDialog open={editOpen} onOpenChange={setEditOpen} task={selected} />

      {/* Rename/Delete Project */}
      <ProjectManagerDialog
        open={pmOpen}
        onOpenChange={setPmOpen}
        mode={pmMode}
        projectId={projectId}
        onDone={() => {
          if (pmMode === "delete") router.push("/");
        }}
      />
    </div>
  );
}

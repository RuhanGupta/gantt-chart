"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import type { Project } from "@/lib/model";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProjectManagerDialog({
  open,
  onOpenChange,
  mode,
  projectId,
  onDone,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "rename" | "delete";
  projectId?: string;
  onDone?: (newId?: string) => void;
}) {
  const projects = useAppStore((s) => s.projects);
  const addProject = useAppStore((s) => s.addProject);
  const renameProject = useAppStore((s) => s.renameProject);
  const deleteProject = useAppStore((s) => (s as any).deleteProject as (id: string) => void);

  const project = useMemo<Project | undefined>(
    () => (projectId ? projects.find((p) => p.id === projectId) : undefined),
    [projects, projectId]
  );

  const [name, setName] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(mode === "rename" && project ? project.name : "");
    setConfirm("");
  }, [open, mode, project]);

  const title =
    mode === "create" ? "New project" : mode === "rename" ? "Rename project" : "Delete project";

  const primaryLabel = mode === "create" ? "Create" : mode === "rename" ? "Save" : "Delete";

  const canSubmit =
    mode === "create"
      ? name.trim().length > 0
      : mode === "rename"
      ? !!project && name.trim().length > 0 && name.trim() !== project.name
      : !!project && confirm.trim() === project.name;

  const submit = () => {
    if (!canSubmit) return;

    if (mode === "create") {
      const id = addProject(name.trim());
      onOpenChange(false);
      onDone?.(id);
      return;
    }

    if (mode === "rename" && projectId) {
      renameProject(projectId, name.trim());
      onOpenChange(false);
      onDone?.();
      return;
    }

    if (mode === "delete" && projectId) {
      deleteProject(projectId);
      onOpenChange(false);
      onDone?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#0b0f17] text-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {mode !== "delete" ? (
          <div className="space-y-3">
            <label className="text-xs text-white/60">
              {mode === "create" ? "Project name" : "New name"}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/5 text-white border-white/10 focus-visible:ring-white/20"
              placeholder="e.g. Blind Cane Project"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-2xl bg-red-500/10 p-3 text-sm text-red-200 ring-1 ring-red-500/25">
              This will delete <b>{project?.name}</b> and all its tasks.
            </div>
            <label className="text-xs text-white/60">
              Type <b>{project?.name}</b> to confirm
            </label>
            <Input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="bg-white/5 text-white border-white/10 focus-visible:ring-white/20"
              placeholder="Type project name"
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="secondary"
            className="bg-white/10 text-white hover:bg-white/15"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            onClick={submit}
            disabled={!canSubmit}
            className={
              mode === "delete"
                ? "bg-red-500 text-white hover:bg-red-500/90 disabled:opacity-40"
                : "bg-white text-black hover:bg-white/90 disabled:opacity-40"
            }
          >
            {primaryLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

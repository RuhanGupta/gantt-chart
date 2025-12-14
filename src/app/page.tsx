"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAppStore, selectProjects, selectTasks } from "@/lib/store";
import { ProjectCard } from "@/components/ProjectCard";
import { TodayPanel } from "@/components/TodayPanel";
import ProjectManagerDialog from "@/components/ProjectManagerDialog";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  const router = useRouter();

  const projects = useAppStore(selectProjects);
  const tasks = useAppStore(selectTasks);

  const [pmOpen, setPmOpen] = useState(false);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const doing = tasks.filter((t) => t.status === "doing").length;
    const blocked = tasks.filter((t) => t.status === "blocked").length;
    return { total, done, doing, blocked };
  }, [tasks]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_.9fr]">
      <div className="space-y-6">
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-4">
            <Stat label="Total tasks" value={stats.total} />
            <Stat label="Doing" value={stats.doing} />
            <Stat label="Blocked" value={stats.blocked} />
            <Stat label="Done" value={stats.done} />
          </CardContent>
        </Card>

        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-lg font-semibold tracking-tight">Projects</div>
            <div className="text-sm text-white/60">
              Click a project to see planned schedule + progress.
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              className="bg-white text-black hover:bg-white/90"
              onClick={() => setPmOpen(true)}
            >
              + New Project
            </Button>

            {projects.length > 0 ? (
              <Link
                href={`/project/${projects[0].id}`}
                className="text-sm text-white/70 hover:text-white"
              >
                Jump to first →
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 said wrong: remove or compile error">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <TodayPanel />
      </div>

      <ProjectManagerDialog
        open={pmOpen}
        onOpenChange={setPmOpen}
        mode="create"
        onDone={(id) => {
          if (id) router.push(`/project/${id}`);
        }}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

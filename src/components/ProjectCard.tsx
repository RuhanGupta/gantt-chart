"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Project } from "@/lib/model";
import { useAppStore, selectTasks } from "@/lib/store";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ProjectCard({ project }: { project: Project }) {
  // ✅ stable, typed
  const allTasks = useAppStore(selectTasks);

  // ✅ derive locally
  const tasks = useMemo(
    () => allTasks.filter((t) => t.projectId === project.id),
    [allTasks, project.id]
  );

  const summary = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const blocked = tasks.filter((t) => t.status === "blocked").length;

    const upcoming = tasks
      .slice()
      .sort(
        (a, b) =>
          parseISO(a.plannedStart).getTime() - parseISO(b.plannedStart).getTime()
      )
      .find((t) => t.status !== "done");

    const daysToNext = upcoming
      ? differenceInCalendarDays(parseISO(upcoming.plannedStart), new Date())
      : null;

    return { total, done, blocked, upcoming, daysToNext };
  }, [tasks]);

  return (
    <Link href={`/project/${project.id}`}>
      <Card className="group border-white/10 bg-white/5 text-white transition hover:bg-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between gap-3 text-base">
            <span className="line-clamp-1">{project.name}</span>
            <span
              className="h-2.5 w-2.5 rounded-full ring-2 ring-white/20"
              style={{ background: project.color }}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className="bg-black/30 text-white ring-1 ring-white/10"
            >
              {summary.done}/{summary.total} done
            </Badge>

            {summary.blocked ? (
              <Badge className="bg-red-500/15 text-red-200 ring-1 ring-red-500/30">
                {summary.blocked} blocked
              </Badge>
            ) : (
              <Badge className="bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30">
                clear
              </Badge>
            )}

            {summary.upcoming ? (
              <Badge
                variant="secondary"
                className="bg-black/30 text-white ring-1 ring-white/10"
              >
                next: {summary.upcoming.title}
                {summary.daysToNext !== null ? ` (${summary.daysToNext}d)` : ""}
              </Badge>
            ) : (
              <Badge className="bg-white/10 text-white/80 ring-1 ring-white/10">
                no upcoming
              </Badge>
            )}
          </div>

          <div className="text-xs text-white/60">
            Open for the full Gantt + “should be vs actual” progress.
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

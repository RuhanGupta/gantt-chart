"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { isSameDay, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function TodayPanel() {
  const projects = useAppStore((s) => s.projects);
  const tasks = useAppStore((s) => s.tasks);

  const today = new Date();

  const todays = useMemo(() => {
    return tasks
      .filter((t) => {
        const dueToday = isSameDay(parseISO(t.plannedEnd), today);
        const startsToday = isSameDay(parseISO(t.plannedStart), today);
        return t.pinnedToToday || dueToday || startsToday;
      })
      .sort((a, b) => a.status.localeCompare(b.status));
  }, [tasks, today]);

  const byProject = (projectId: string) => projects.find((p) => p.id === projectId)?.name ?? "Project";

  return (
    <Card className="border-white/10 bg-white/5 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Today</CardTitle>
        <div className="text-sm text-white/60">Everything you should touch today, across projects.</div>
      </CardHeader>

      <CardContent className="space-y-3">
        {todays.length === 0 ? (
          <div className="rounded-2xl bg-black/20 p-4 text-sm text-white/60 ring-1 ring-white/10">
            Nothing scheduled for today. (You can “Pin to Today” from any task.)
          </div>
        ) : (
          <div className="space-y-2">
            {todays.map((t) => (
              <div key={t.id} className="rounded-2xl bg-black/20 p-3 ring-1 ring-white/10">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{t.title}</div>
                    <div className="mt-1 text-xs text-white/60">
                      <span className="text-white/70">{byProject(t.projectId)}</span> · planned {t.plannedStart} → {t.plannedEnd}
                    </div>
                  </div>
                  <Badge
                    className={[
                      "bg-white/10 text-white/80 ring-1 ring-white/10",
                      t.status === "blocked" ? "bg-red-500/15 text-red-200 ring-red-500/30" : "",
                      t.status === "done" ? "bg-emerald-500/15 text-emerald-200 ring-emerald-500/30" : "",
                    ].join(" ")}
                  >
                    {t.status}
                  </Badge>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-white/60">{t.progress ?? 0}%</div>
                  <Link href={`/project/${t.projectId}`}>
                    <Button variant="secondary" className="h-8 bg-white/10 text-white hover:bg-white/15">
                      Open project →
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

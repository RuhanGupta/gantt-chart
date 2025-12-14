"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { useEffect } from "react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const projects = useAppStore((s) => s.projects);
  const addProject = useAppStore((s) => s.addProject);

  const hydrate = useAppStore((s) => s.hydrateFromServer);

  useEffect(() => {
    hydrate().catch(console.error);
  }, [hydrate]);

  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const x = q.trim().toLowerCase();
    if (!x) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(x));
  }, [q, projects]);

  return (
    <div className="min-h-screen bg-[#0b0f17] text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0f17]/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3">
          <Link href="/" className="group flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-white/10 ring-1 ring-white/15 group-hover:bg-white/15" />
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Gantt World</div>
              <div className="text-xs text-white/60">plan → execute → ship</div>
            </div>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search projects…"
                className={cn(
                  "w-[260px] bg-white/5 pl-8 text-white placeholder:text-white/40",
                  "border-white/10 focus-visible:ring-white/20"
                )}
              />
            </div>

            <Button
              onClick={() => {
                const name = prompt("Project name?");
                if (!name?.trim()) return;
                const id = addProject(name.trim());
                // Optional: auto-navigate to project
                window.location.href = `/project/${id}`;
              }}
              className="bg-white text-black hover:bg-white/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Subnav (projects) */}
      <div className="border-b border-white/10 bg-white/0">
        <div className="mx-auto w-full max-w-6xl px-4 py-3">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded-full bg-white/5 px-3 py-1 text-sm text-white/80 ring-1 ring-white/10 hover:bg-white/10"
            >
              Dashboard
            </Link>

            {filtered.slice(0, 10).map((p) => (
              <Link
                key={p.id}
                href={`/project/${p.id}`}
                className="rounded-full bg-white/5 px-3 py-1 text-sm text-white/80 ring-1 ring-white/10 hover:bg-white/10"
                title={p.name}
              >
                {p.name.length > 24 ? p.name.slice(0, 24) + "…" : p.name}
              </Link>
            ))}

            {filtered.length > 10 ? (
              <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-white/50 ring-1 ring-white/10">
                +{filtered.length - 10} more…
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

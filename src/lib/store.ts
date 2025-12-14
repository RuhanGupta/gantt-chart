"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import { addDays, parseISO, formatISO } from "date-fns";

import { AppState, AppStateSchema, Project, Task } from "./model";

// --------------------------------------------------
// Small fetch helper (kept local on purpose)
// --------------------------------------------------
async function apiJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

// --------------------------------------------------
// Selectors (important: return raw arrays only)
// --------------------------------------------------
export const selectTasks = (s: Store): Task[] => s.tasks;
export const selectProjects = (s: Store): Project[] => s.projects;

// --------------------------------------------------
// Store type
// --------------------------------------------------
type Store = AppState & {
  hydrateFromServer: () => Promise<void>;

  // Projects
  addProject: (name: string) => string;
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;

  // Tasks
  addTask: (
    projectId: string,
    partial: Omit<Partial<Task>, "id" | "projectId"> & {
      title: string;
      plannedStart?: string;
      plannedEnd?: string;
      durationDays?: number;
    }
  ) => string;

  updateTask: (taskId: string, patch: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;

  // Helpers
  getProject: (id: string) => Project | undefined;
  getProjectTasks: (projectId: string) => Task[];
};

// --------------------------------------------------
// Local seed (only used if nothing exists yet)
// --------------------------------------------------
const seed = (): AppState => {
  const today = new Date();
  const iso = (d: Date) => formatISO(d, { representation: "date" });

  const p1: Project = {
    id: uuid(),
    name: "EECS 151 Lab + Paper",
    color: "#0f172a",
    createdAt: new Date().toISOString(),
  };

  const p2: Project = {
    id: uuid(),
    name: "Intern Prep",
    color: "#111827",
    createdAt: new Date().toISOString(),
  };

  const tasks: Task[] = [
    {
      id: uuid(),
      projectId: p1.id,
      title: "Outline paper sections + metrics",
      plannedStart: iso(addDays(today, -2)),
      plannedEnd: iso(addDays(today, 1)),
      progress: 45,
      status: "doing",
      pinnedToToday: true,
      order: 1,
      wbs: "1.1",
    },
    {
      id: uuid(),
      projectId: p1.id,
      title: "Finish Lab 5 implementation",
      plannedStart: iso(addDays(today, -1)),
      plannedEnd: iso(addDays(today, 2)),
      progress: 10,
      status: "todo",
      pinnedToToday: false,
      order: 2,
      wbs: "1.2",
    },
    {
      id: uuid(),
      projectId: p2.id,
      title: "Build mini Gantt MVP + polish UI",
      plannedStart: iso(today),
      plannedEnd: iso(addDays(today, 3)),
      progress: 20,
      status: "doing",
      pinnedToToday: true,
      order: 1,
      wbs: "1.1",
    },
  ];

  return { projects: [p1, p2], tasks };
};

// --------------------------------------------------
// Store
// --------------------------------------------------
export const useAppStore = create<Store>()(
  persist(
    (set, get) => ({
      ...seed(),

      // ----------------------------------------------
      // Remote bootstrap
      // ----------------------------------------------
      hydrateFromServer: async () => {
        const data = await apiJSON<{ projects: any[]; tasks: any[] }>(
          "/api/bootstrap",
          { cache: "no-store" }
        );

        const projects: Project[] = (data.projects ?? []).map((p) => ({
          ...p,
          id: p.id ?? p._id,
        }));

        const tasks: Task[] = (data.tasks ?? []).map((t) => ({
          ...t,
          id: t.id ?? t._id,
        }));

        const parsed = AppStateSchema.safeParse({ projects, tasks });
        if (parsed.success) {
          set(parsed.data);
        } else {
          console.error("hydrateFromServer: invalid data", parsed.error);
        }
      },

      // ----------------------------------------------
      // Projects (optimistic + remote)
      // ----------------------------------------------
      addProject: (name) => {
        const project: Project = {
          id: uuid(),
          name,
          color: "#111827",
          createdAt: new Date().toISOString(),
        };

        set((s) => ({ projects: [...s.projects, project] }));

        void apiJSON("/api/projects", {
          method: "POST",
          body: JSON.stringify(project),
        }).catch((e) => console.error("addProject failed", e));

        return project.id;
      },

      renameProject: (id, name) => {
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, name } : p)),
        }));

        void apiJSON(`/api/projects/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ name }),
        }).catch((e) => console.error("renameProject failed", e));
      },

      deleteProject: (id) => {
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          tasks: s.tasks.filter((t) => t.projectId !== id),
        }));

        void apiJSON(`/api/projects/${id}`, { method: "DELETE" }).catch((e) =>
          console.error("deleteProject failed", e)
        );
      },

      // ----------------------------------------------
      // Tasks (planned-only, sequential)
      // ----------------------------------------------
      addTask: (projectId, partial) => {
        const id = uuid();
        const state = get();

        const projectTasks = state.tasks
          .filter((t) => t.projectId === projectId)
          .slice()
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        const nextOrder =
          (projectTasks[projectTasks.length - 1]?.order ??
            projectTasks.length) + 1;

        let plannedStart = partial.plannedStart;
        let plannedEnd = partial.plannedEnd;

        if (!plannedStart || !plannedEnd) {
          const lastEnd = projectTasks.length
            ? projectTasks[projectTasks.length - 1].plannedEnd
            : formatISO(new Date(), { representation: "date" });

          const start = addDays(parseISO(lastEnd), projectTasks.length ? 1 : 0);
          const duration = Math.max(1, Number(partial.durationDays ?? 2));
          const end = addDays(start, duration - 1);

          plannedStart = formatISO(start, { representation: "date" });
          plannedEnd = formatISO(end, { representation: "date" });
        }

        const progress = Math.max(0, Math.min(100, partial.progress ?? 0));

        const task: Task = {
          id,
          projectId,
          title: partial.title,
          description: partial.description,
          plannedStart,
          plannedEnd,
          progress,
          status: progress >= 100 ? "done" : progress > 0 ? "doing" : "todo",
          pinnedToToday: partial.pinnedToToday ?? false,
          wbs: partial.wbs,
          order: partial.order ?? nextOrder,
        };

        set((s) => ({ tasks: [...s.tasks, task] }));

        void apiJSON("/api/tasks", {
          method: "POST",
          body: JSON.stringify(task),
        }).catch((e) => console.error("addTask failed", e));

        return id;
      },

      updateTask: (taskId, patch) => {
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== taskId) return t;

            const merged = { ...t, ...patch } as Task;

            if (typeof merged.progress === "number") {
              const p = Math.max(0, Math.min(100, merged.progress));
              merged.progress = p;
              merged.status = p >= 100 ? "done" : p > 0 ? "doing" : "todo";
            }

            return merged;
          }),
        }));

        void apiJSON(`/api/tasks/${taskId}`, {
          method: "PATCH",
          body: JSON.stringify(patch),
        }).catch((e) => console.error("updateTask failed", e));
      },

      deleteTask: (taskId) => {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== taskId) }));

        void apiJSON(`/api/tasks/${taskId}`, { method: "DELETE" }).catch((e) =>
          console.error("deleteTask failed", e)
        );
      },

      // ----------------------------------------------
      // Helpers
      // ----------------------------------------------
      getProject: (id) => get().projects.find((p) => p.id === id),
      getProjectTasks: (projectId) =>
        get().tasks.filter((t) => t.projectId === projectId),
    }),
    {
      name: "gantt-world-v1",
      version: 2,

      migrate: (persisted: any) => {
        if (persisted?.projects && persisted?.tasks) return persisted;
        return seed();
      },

      partialize: (s) => ({ projects: s.projects, tasks: s.tasks }),

      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as any) };
        const parsed = AppStateSchema.safeParse({
          projects: merged.projects,
          tasks: merged.tasks,
        });
        return parsed.success ? ({ ...current, ...parsed.data } as any) : current;
      },
    }
  )
);

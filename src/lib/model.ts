import { z } from "zod";

export const TaskStatus = z.enum(["todo", "doing", "blocked", "done"]);
export type TaskStatus = z.infer<typeof TaskStatus>;

export const TaskSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  plannedStart: z.string(),
  plannedEnd: z.string(),
  actualStart: z.string().optional(),
  actualEnd: z.string().optional(),
  progress: z.number().min(0).max(100).default(0),
  status: TaskStatus.default("todo"),
  pinnedToToday: z.boolean().optional().default(false),

  wbs: z.string().optional(),
  order: z.number().optional(),
});


export type Task = z.infer<typeof TaskSchema>;

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  color: z.string().default("#111827"), // slate-900 default
  createdAt: z.string(),
});

export type Project = z.infer<typeof ProjectSchema>;

export const AppStateSchema = z.object({
  projects: z.array(ProjectSchema),
  tasks: z.array(TaskSchema),
});

export type AppState = z.infer<typeof AppStateSchema>;

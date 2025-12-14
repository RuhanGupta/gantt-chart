import { getDb } from "@/lib/mongodb";
import type { ProjectDoc, TaskDoc } from "@/lib/dbTypes";

export async function projectsCol() {
  const db = await getDb();
  return db.collection<ProjectDoc>("projects"); // ✅ typed _id string
}

export async function tasksCol() {
  const db = await getDb();
  return db.collection<TaskDoc>("tasks");       // ✅ typed _id string
}

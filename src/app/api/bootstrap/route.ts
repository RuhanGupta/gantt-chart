import { NextResponse } from "next/server";
import { projectsCol, tasksCol } from "@/lib/dbCollections";

export async function GET() {
  const [pCol, tCol] = await Promise.all([projectsCol(), tasksCol()]);
  const [projects, tasks] = await Promise.all([
    pCol.find({}).sort({ createdAt: 1 }).toArray(),
    tCol.find({}).sort({ projectId: 1, order: 1 }).toArray(),
  ]);

  return NextResponse.json({
    projects,
    tasks,
  });
}

import { NextResponse } from "next/server";
import { tasksCol } from "@/lib/dbCollections";
import { v4 as uuid } from "uuid";
import type { TaskDoc } from "@/lib/dbTypes";

export async function POST(req: Request) {
  const body = await req.json();

  const projectId = String(body?.projectId ?? "");
  const title = String(body?.title ?? "").trim();
  if (!projectId || !title) {
    return NextResponse.json({ error: "projectId + title required" }, { status: 400 });
  }

  const plannedStart = String(body?.plannedStart ?? "");
  const plannedEnd = String(body?.plannedEnd ?? "");
  if (!plannedStart || !plannedEnd) {
    return NextResponse.json({ error: "plannedStart/plannedEnd required" }, { status: 400 });
  }

  const task: TaskDoc = {
    _id: uuid(),
    projectId,
    title,
    description: body?.description ? String(body.description) : undefined,
    plannedStart,
    plannedEnd,
    progress: Number(body?.progress ?? 0),
    status: (body?.status ?? "todo") as TaskDoc["status"],
    pinnedToToday: Boolean(body?.pinnedToToday ?? false),
    wbs: body?.wbs ? String(body.wbs) : undefined,
    order: Number(body?.order ?? 1),
    createdAt: new Date().toISOString(),
  };

  const col = await tasksCol();
  await col.insertOne(task);
  return NextResponse.json(task);
}

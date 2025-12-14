import { NextResponse } from "next/server";
import { projectsCol } from "@/lib/dbCollections";
import { v4 as uuid } from "uuid";
import type { ProjectDoc } from "@/lib/dbTypes";

export async function POST(req: Request) {
  const body = await req.json();
  const name = String(body?.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const col = await projectsCol();

  const project: ProjectDoc = {
    _id: uuid(),
    name,
    color: body?.color ? String(body.color) : "#111827",
    createdAt: new Date().toISOString(),
  };

  await col.insertOne(project);
  return NextResponse.json(project);
}

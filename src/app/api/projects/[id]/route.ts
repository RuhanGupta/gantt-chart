import { NextResponse, type NextRequest } from "next/server";
import { projectsCol, tasksCol } from "@/lib/dbCollections";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json();

  const update: Record<string, unknown> = {};
  if (body?.name != null) update.name = String(body.name).trim();
  if (body?.color != null) update.color = String(body.color);

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  const col = await projectsCol();
  await col.updateOne({ _id: id }, { $set: update });

  const updated = await col.findOne({ _id: id });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;

  const [pCol, tCol] = await Promise.all([projectsCol(), tasksCol()]);
  await Promise.all([
    pCol.deleteOne({ _id: id }),
    tCol.deleteMany({ projectId: id }),
  ]);

  return NextResponse.json({ ok: true });
}

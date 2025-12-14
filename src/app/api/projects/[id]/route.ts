import { NextResponse } from "next/server";
import { projectsCol, tasksCol } from "@/lib/dbCollections";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const body = await req.json();

  const update: any = {};
  if (body?.name != null) update.name = String(body.name).trim();
  if (body?.color != null) update.color = String(body.color);

  if (Object.keys(update).length === 0)
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });

  const col = await projectsCol();
  await col.updateOne({ _id: id }, { $set: update }); // ✅ no ObjectId

  const updated = await col.findOne({ _id: id });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const [pCol, tCol] = await Promise.all([projectsCol(), tasksCol()]);

  await Promise.all([
    pCol.deleteOne({ _id: id }),
    tCol.deleteMany({ projectId: id }),
  ]);

  return NextResponse.json({ ok: true });
}

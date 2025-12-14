import { NextResponse } from "next/server";
import { tasksCol } from "@/lib/dbCollections";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const body = await req.json();

  const allowed = [
    "title",
    "description",
    "plannedStart",
    "plannedEnd",
    "progress",
    "status",
    "pinnedToToday",
    "wbs",
    "order",
  ] as const;

  const update: any = {};
  for (const k of allowed) if (body[k] !== undefined) update[k] = body[k];

  const col = await tasksCol();
  await col.updateOne({ _id: id }, { $set: update });

  const updated = await col.findOne({ _id: id });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const col = await tasksCol();
  await col.deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}

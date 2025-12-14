import { NextResponse, type NextRequest } from "next/server";
import { tasksCol } from "@/lib/dbCollections";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
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

  const update: Record<string, unknown> = {};
  for (const k of allowed) if (body[k] !== undefined) update[k] = body[k];

  const col = await tasksCol();
  await col.updateOne({ _id: id }, { $set: update });

  const updated = await col.findOne({ _id: id });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const col = await tasksCol();
  await col.deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}

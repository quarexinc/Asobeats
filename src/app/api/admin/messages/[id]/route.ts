import { isAdmin, unauthorized } from "@/lib/auth";
import { deleteMessage, getMessage, saveMessage } from "@/lib/db";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  if (!(await isAdmin())) return unauthorized();
  const { id } = await ctx.params;
  const msg = await getMessage(id);
  if (!msg) return Response.json({ error: "Mesaj bulunamadı" }, { status: 404 });
  const { read } = (await request.json().catch(() => ({}))) as { read?: boolean };
  await saveMessage({ ...msg, read: Boolean(read) });
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  if (!(await isAdmin())) return unauthorized();
  const { id } = await ctx.params;
  await deleteMessage(id);
  return Response.json({ ok: true });
}

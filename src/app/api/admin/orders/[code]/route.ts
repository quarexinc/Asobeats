import { isAdmin, unauthorized } from "@/lib/auth";
import { deleteOrder, getOrder, markOrderPaid, saveOrder } from "@/lib/db";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ code: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  if (!(await isAdmin())) return unauthorized();
  const { code } = await ctx.params;
  const order = await getOrder(code);
  if (!order) return Response.json({ error: "Sipariş bulunamadı" }, { status: 404 });
  const { status } = (await request.json().catch(() => ({}))) as { status?: string };

  if (status === "paid") await markOrderPaid(order);
  else if (status === "cancelled" || status === "pending") await saveOrder({ ...order, status });
  else return Response.json({ error: "Geçersiz durum" }, { status: 400 });

  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  if (!(await isAdmin())) return unauthorized();
  const { code } = await ctx.params;
  await deleteOrder(code);
  return Response.json({ ok: true });
}

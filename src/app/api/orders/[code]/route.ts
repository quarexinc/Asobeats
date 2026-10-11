import { getOrder } from "@/lib/db";

export const runtime = "nodejs";

/** Sipariş sayfası ödeme onayını beklerken durumu buradan sorar */
export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const order = await getOrder(code);
  if (!order) return Response.json({ error: "Sipariş bulunamadı" }, { status: 404 });
  return Response.json({ status: order.status }, { headers: { "Cache-Control": "no-store" } });
}

import { getBeat, getSettings, markOrderPaid, newId, saveOrder } from "@/lib/db";
import { isEmail } from "@/lib/format";
import { Order } from "@/lib/types";

export const runtime = "nodejs";

/** Satın alma: sipariş oluşturur. Ödeme modu "anında" ise dosya hemen teslim edilir. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, string>;
  if (body.website) return Response.json({ error: "Geçersiz istek" }, { status: 400 }); // bot tuzağı

  const name = String(body.name || "").trim().slice(0, 80);
  const email = String(body.email || "").trim().toLowerCase().slice(0, 160);
  const note = String(body.note || "").trim().slice(0, 500);
  if (name.length < 2) return Response.json({ error: "Adını yaz." }, { status: 400 });
  if (!isEmail(email)) return Response.json({ error: "Geçerli bir e-posta adresi yaz." }, { status: 400 });

  const beat = await getBeat(String(body.beatId || ""));
  if (!beat || !beat.published) return Response.json({ error: "Bu beat artık satışta değil." }, { status: 404 });
  if (beat.sold) return Response.json({ error: "Bu beat tek satışlıktı ve satıldı." }, { status: 409 });

  const settings = await getSettings();
  let order: Order = {
    code: newId(24),
    beatId: beat.id,
    beatTitle: beat.title,
    coverUrl: beat.coverUrl,
    price: beat.price,
    buyerName: name,
    buyerEmail: email,
    note: note || undefined,
    status: "pending",
    fileUrl: beat.fileUrl,
    fileName: beat.fileName,
    createdAt: Date.now(),
    downloads: 0,
  };
  await saveOrder(order);

  if (settings.paymentMode === "instant") {
    order = await markOrderPaid(order);
  }

  return Response.json({ ok: true, code: order.code, status: order.status });
}

import { createReadStream, promises as fs } from "fs";
import path from "path";
import { Readable } from "stream";
import { getOrder, saveOrder } from "@/lib/db";
import { MIME, resolveLocal, safeName } from "@/lib/files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Otomatik teslim: ödemesi onaylanmış siparişin MP3 dosyasını verir.
 * ?inline=1 → tarayıcıda çal, aksi halde indir.
 */
export async function GET(request: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const inline = new URL(request.url).searchParams.get("inline") === "1";
  const order = await getOrder(code);

  if (!order || order.status !== "paid" || !order.fileUrl) {
    return new Response("Bu indirme linki geçerli değil ya da ödeme henüz onaylanmadı.", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  if (!inline) {
    await saveOrder({ ...order, downloads: (order.downloads || 0) + 1 });
  }

  const ext = path.extname(order.fileName || order.fileUrl.split("?")[0]) || ".mp3";
  const niceName = safeName(`${order.beatTitle} - Aso Beats`) + ext;

  // Vercel Blob: dosyaya yönlendir
  if (!order.fileUrl.startsWith("local:")) {
    const url = new URL(order.fileUrl);
    if (!inline) url.searchParams.set("download", "1");
    return Response.redirect(url.toString(), 302);
  }

  // Yerel geliştirme
  try {
    const full = resolveLocal(order.fileUrl);
    const stat = await fs.stat(full);
    const stream = Readable.toWeb(createReadStream(full)) as ReadableStream;
    return new Response(stream, {
      headers: {
        "Content-Type": MIME[ext.toLowerCase()] || "audio/mpeg",
        "Content-Length": String(stat.size),
        "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${niceName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("Dosya bulunamadı.", { status: 404 });
  }
}

import { promises as fs } from "fs";
import path from "path";
import { MIME, resolveLocal } from "@/lib/files";

export const runtime = "nodejs";

/** Yerel geliştirme: herkese açık dosyaları (kapak, demo) sunar */
export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const parts = (await ctx.params).path;
  if (parts[0] !== "public") return new Response("Bulunamadı", { status: 404 });
  try {
    const full = resolveLocal("local:" + parts.join("/"));
    const data = await fs.readFile(full);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": MIME[path.extname(full).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new Response("Bulunamadı", { status: 404 });
  }
}

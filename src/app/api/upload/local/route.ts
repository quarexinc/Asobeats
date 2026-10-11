import { promises as fs } from "fs";
import path from "path";
import { isAdmin, unauthorized } from "@/lib/auth";
import { hasBlob, newId } from "@/lib/db";
import { LOCAL_ROOT, localPublicUrl, safeName } from "@/lib/files";

export const runtime = "nodejs";

/** Sadece yerel geliştirme: Blob bağlı değilken dosyaları .data klasörüne kaydeder */
export async function POST(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  if (hasBlob || process.env.VERCEL) {
    return Response.json(
      { error: "Vercel'de dosyalar Vercel Blob'a yüklenir. Storage sekmesinden Blob bağla." },
      { status: 400 },
    );
  }
  const form = await request.formData();
  const file = form.get("file");
  const kind = form.get("kind") === "private" ? "private" : "public";
  const folder = String(form.get("folder") || "misc").replace(/[^a-z-]/g, "");
  if (!(file instanceof File)) return Response.json({ error: "Dosya yok" }, { status: 400 });

  const rel = `${kind}/${folder}/${newId(10)}-${safeName(file.name)}`;
  const full = path.join(LOCAL_ROOT, rel);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, Buffer.from(await file.arrayBuffer()));

  const url = kind === "private" ? `local:${rel}` : localPublicUrl(rel);
  return Response.json({ url });
}

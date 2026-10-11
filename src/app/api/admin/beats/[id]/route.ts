import { isAdmin, unauthorized } from "@/lib/auth";
import { deleteBeat, getBeat, saveBeat } from "@/lib/db";
import { parseBeatInput } from "@/lib/beatInput";
import { removeFile } from "@/lib/files";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, ctx: Ctx) {
  if (!(await isAdmin())) return unauthorized();
  const { id } = await ctx.params;
  const existing = await getBeat(id);
  if (!existing) return Response.json({ error: "Beat bulunamadı" }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const beat = parseBeatInput(body, existing);
  if (typeof beat === "string") return Response.json({ error: beat }, { status: 400 });

  // değişen dosyaların eskilerini temizle (satılmış tam dosyalar alıcılar için korunur)
  if (existing.coverUrl && existing.coverUrl !== beat.coverUrl) await removeFile(existing.coverUrl);
  if (existing.previewUrl && existing.previewUrl !== beat.previewUrl) await removeFile(existing.previewUrl);
  if (existing.fileUrl !== beat.fileUrl && !existing.salesCount) await removeFile(existing.fileUrl);

  await saveBeat(beat);
  return Response.json({ ok: true });
}

/** Hızlı değişiklik: yayında / öne çıkan / satıldı */
export async function PATCH(request: Request, ctx: Ctx) {
  if (!(await isAdmin())) return unauthorized();
  const { id } = await ctx.params;
  const beat = await getBeat(id);
  if (!beat) return Response.json({ error: "Beat bulunamadı" }, { status: 404 });
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  for (const key of ["published", "featured", "sold"] as const) {
    if (typeof body[key] === "boolean") beat[key] = body[key] as boolean;
  }
  beat.updatedAt = Date.now();
  await saveBeat(beat);
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  if (!(await isAdmin())) return unauthorized();
  const { id } = await ctx.params;
  const beat = await getBeat(id);
  if (!beat) return Response.json({ ok: true });
  await deleteBeat(id);
  await removeFile(beat.coverUrl);
  await removeFile(beat.previewUrl);
  // satılmış beatin tam dosyası, alıcılar indirmeye devam edebilsin diye silinmez
  if (!beat.salesCount) await removeFile(beat.fileUrl);
  return Response.json({ ok: true });
}

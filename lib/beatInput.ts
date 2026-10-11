import { Beat } from "./types";

const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const num = (v: unknown) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(",", "."));
  return isFinite(n) ? n : undefined;
};

/** Admin panelinden gelen beat verisini temizler */
export function parseBeatInput(body: Record<string, unknown>, existing?: Beat): Beat | string {
  const title = str(body.title, 120);
  if (!title) return "Beat adı zorunlu.";
  const price = num(body.price);
  if (price === undefined || price < 0) return "Geçerli bir fiyat gir.";
  const fileUrl = str(body.fileUrl, 1000) || existing?.fileUrl || "";
  if (!fileUrl) return "Teslim edilecek MP3 dosyasını yükle.";

  const peaks = Array.isArray(body.peaks)
    ? (body.peaks as unknown[]).slice(0, 200).map((p) => Math.max(0, Math.min(1, Number(p) || 0)))
    : existing?.peaks;

  const tags = (Array.isArray(body.tags) ? body.tags : String(body.tags ?? "").split(","))
    .map((t) => str(t, 30))
    .filter(Boolean)
    .slice(0, 10);

  const now = Date.now();
  return {
    id: existing?.id ?? "",
    title,
    description: str(body.description, 3000),
    price: Math.round(price * 100) / 100,
    bpm: num(body.bpm) ? Math.round(num(body.bpm)!) : undefined,
    musicalKey: str(body.musicalKey, 20) || undefined,
    genre: str(body.genre, 40) || undefined,
    tags,
    coverUrl: str(body.coverUrl, 1000) || undefined,
    previewUrl: str(body.previewUrl, 1000) || undefined,
    fileUrl,
    fileName: str(body.fileName, 200) || existing?.fileName,
    durationSec: num(body.durationSec) ?? existing?.durationSec,
    peaks,
    exclusive: Boolean(body.exclusive),
    sold: body.sold === undefined ? existing?.sold ?? false : Boolean(body.sold),
    published: body.published === undefined ? true : Boolean(body.published),
    featured: Boolean(body.featured),
    salesCount: existing?.salesCount ?? 0,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

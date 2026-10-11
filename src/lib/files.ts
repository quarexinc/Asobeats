import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { del } from "@vercel/blob";
import { hasBlob } from "./db";

/** Yerel geliştirme modunda dosyaların tutulduğu klasör */
export const LOCAL_ROOT = path.join(process.cwd(), ".data", "uploads");

export function safeName(name: string) {
  const base = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return base || "dosya";
}

/** "local:private/abc/beat.mp3" → mutlak yol (klasör dışına çıkmayı engeller) */
export function resolveLocal(ref: string) {
  const rel = ref.replace(/^local:/, "");
  const full = path.resolve(LOCAL_ROOT, rel);
  if (!full.startsWith(LOCAL_ROOT + path.sep)) throw new Error("Geçersiz yol");
  return full;
}

export function localPublicUrl(rel: string) {
  return "/api/files/" + rel.split("/").map(encodeURIComponent).join("/");
}

/** Bir dosyayı sil (Blob ya da yerel). Hata olursa sessizce geçer. */
export async function removeFile(url?: string) {
  if (!url) return;
  try {
    if (url.startsWith("local:")) {
      await fs.unlink(resolveLocal(url));
    } else if (url.startsWith("/api/files/")) {
      const rel = decodeURIComponent(url.replace("/api/files/", ""));
      await fs.unlink(resolveLocal("local:" + rel));
    } else if (hasBlob && url.includes("blob.vercel-storage.com")) {
      await del(url);
    }
  } catch {
    /* dosya zaten yoksa sorun değil */
  }
}

export const MIME: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

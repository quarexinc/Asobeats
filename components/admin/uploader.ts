"use client";

import { upload } from "@vercel/blob/client";

export type StorageMode = "blob" | "local";

function slug(name: string) {
  const dot = name.lastIndexOf(".");
  const ext = dot > 0 ? name.slice(dot).toLowerCase() : "";
  const base = (dot > 0 ? name.slice(0, dot) : name)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
    .toLowerCase();
  return (base || "dosya") + ext;
}

function randomId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Dosya yükler.
 * - private: tam MP3 (tahmin edilemez bir klasöre; linki sadece satın alana verilir)
 * - public: kapak ve demo
 */
export async function uploadFile(
  file: Blob,
  opts: { mode: StorageMode; kind: "public" | "private"; folder: string; filename: string; onProgress?: (pct: number) => void },
): Promise<string> {
  const name = slug(opts.filename);

  if (opts.mode === "blob") {
    const pathname =
      opts.kind === "private" ? `beats/${opts.folder}/${randomId()}/${name}` : `beats/${opts.folder}/${name}`;
    const res = await upload(pathname, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
      contentType: file.type || undefined,
      multipart: file.size > 8 * 1024 * 1024,
      onUploadProgress: (e) => opts.onProgress?.(Math.round(e.percentage)),
    });
    return res.url;
  }

  // yerel geliştirme
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", file, name);
    fd.append("kind", opts.kind);
    fd.append("folder", opts.folder);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload/local");
    xhr.upload.onprogress = (e) => e.lengthComputable && opts.onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status >= 400) reject(new Error(json.error || "Yükleme başarısız"));
        else resolve(json.url);
      } catch {
        reject(new Error("Yükleme başarısız"));
      }
    };
    xhr.onerror = () => reject(new Error("Bağlantı hatası"));
    xhr.send(fd);
  });
}

export async function api<T = { ok: true }>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `İşlem başarısız (${res.status})`);
  return json as T;
}

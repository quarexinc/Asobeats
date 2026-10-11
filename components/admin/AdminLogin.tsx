"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) router.refresh();
    else {
      setError(json.error || "Giriş yapılamadı.");
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <Link href="/" className="font-wide text-2xl font-black tracking-[-0.03em] metal">
          ASO BEATS
        </Link>
        <h1 className="mt-8 text-2xl font-semibold">Admin paneli</h1>
        <p className="mt-2 text-sm text-ash">Beatlerini, siparişlerini ve mesajlarını yönetmek için giriş yap.</p>

        {!configured ? (
          <div className="mt-8 rounded-2xl border border-warn/30 bg-warn/5 p-4 text-sm leading-relaxed text-warn">
            Admin şifresi henüz ayarlanmamış. Vercel projesinde <b>Settings → Environment Variables</b> bölümüne{" "}
            <code className="rounded bg-black/40 px-1">ADMIN_PASSWORD</code> ekle ve yeniden deploy et.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-3">
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Şifre"
              autoFocus
              autoComplete="current-password"
              className="field"
              aria-label="Admin şifresi"
            />
            {error && <p className="text-sm text-bad">{error}</p>}
            <button
              disabled={busy || !pw}
              className="w-full rounded-2xl bg-bone py-3.5 font-semibold text-ink transition-opacity disabled:opacity-50"
            >
              {busy ? "Kontrol ediliyor…" : "Giriş yap"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

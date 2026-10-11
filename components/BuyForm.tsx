"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/format";
import { ArrowIcon } from "./icons";

export default function BuyForm({
  beatId,
  price,
  mode,
  sold,
}: {
  beatId: string;
  price: number;
  mode: "instant" | "manual";
  sold: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (sold) {
    return (
      <div className="rounded-2xl border border-line p-6 text-fog">
        Bu beat tek satışlıktı ve sahibini buldu. Benzer bir beat için diğer beatlere göz at ya da bana ulaş.
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, beatId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Sipariş oluşturulamadı.");
      router.push(`/siparis/${json.code}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm text-fog">Adın</span>
          <input name="name" required minLength={2} autoComplete="name" className="field" placeholder="Ad Soyad" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-fog">E-posta</span>
          <input name="email" type="email" required autoComplete="email" className="field" placeholder="sen@ornek.com" />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm text-fog">Not (isteğe bağlı)</span>
        <input name="note" className="field" placeholder="Sanatçı adın, proje adı…" />
      </label>
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-bad/30 bg-bad/10 px-4 py-3 text-sm text-bad">
          {error}
        </motion.p>
      )}

      <button
        disabled={busy}
        className="group flex w-full items-center justify-between rounded-2xl bg-bone px-6 py-4 font-semibold text-ink transition-[transform,opacity] hover:scale-[1.01] disabled:opacity-60"
      >
        <span>{busy ? "Sipariş oluşturuluyor…" : mode === "instant" ? "Satın al ve indir" : "Sipariş oluştur"}</span>
        <span className="flex items-center gap-3 tabular-nums">
          {formatPrice(price)}
          <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </button>
      <p className="text-xs leading-relaxed text-ash">
        {mode === "instant"
          ? "Sipariş oluşturulduğu anda tam MP3 dosyası sipariş sayfanda indirmeye açılır."
          : "Siparişten sonra ödeme bilgilerini göreceksin. Ödemen onaylanınca tam MP3 dosyası sipariş sayfanda otomatik olarak açılır."}
      </p>
    </form>
  );
}

"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowIcon, CheckIcon } from "./icons";

const SUBJECTS = ["Özel beat", "İşbirliği", "Satın alma", "Diğer"];

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setStatus("sending");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, subject }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Mesaj gönderilemedi.");
      form.reset();
      setStatus("sent");
    } catch (err) {
      setError((err as Error).message);
      setStatus("idle");
    }
  }

  return (
    <div className="relative rounded-[28px] border border-line bg-coal p-5 sm:p-8">
      <AnimatePresence mode="wait">
        {status === "sent" ? (
          <motion.div
            key="ok"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex min-h-[420px] flex-col items-center justify-center text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
              className="grid h-16 w-16 place-items-center rounded-full bg-bone text-ink"
            >
              <CheckIcon className="h-8 w-8" />
            </motion.div>
            <h3 className="font-wide mt-6 text-2xl font-black tracking-[-0.03em]">Mesajın ulaştı</h3>
            <p className="mt-2 max-w-xs text-ash">En kısa sürede e-posta adresine dönüş yapacağım.</p>
            <button onClick={() => setStatus("idle")} className="mt-8 text-sm text-fog underline underline-offset-4 hover:text-bone">
              Yeni mesaj yaz
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={onSubmit} exit={{ opacity: 0 }} className="space-y-4">
            <div>
              <span className="mb-2 block text-sm text-fog">Konu</span>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setSubject(s)}
                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                      subject === s ? "border-bone bg-bone text-ink" : "border-line text-fog hover:border-fog"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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
              <span className="mb-1.5 block text-sm text-fog">Mesajın</span>
              <textarea
                name="message"
                required
                minLength={5}
                rows={6}
                className="field"
                placeholder="Projenden, referans şarkılardan, istediğin tempo ve havadan bahset…"
              />
            </label>
            <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            {error && <p className="rounded-xl border border-bad/30 bg-bad/10 px-4 py-3 text-sm text-bad">{error}</p>}
            <button
              disabled={status === "sending"}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-bone px-6 py-4 font-semibold text-ink transition-[transform,opacity] hover:scale-[1.01] disabled:opacity-60"
            >
              {status === "sending" ? "Gönderiliyor…" : "Mesajı gönder"}
              <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

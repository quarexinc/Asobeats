"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate, formatPrice } from "@/lib/format";
import { Cover } from "../player/PlayerBar";
import { AdminOrder, Empty, Panel, StatusBadge, useToast } from "./ui";
import { api } from "./uploader";

type Filter = "all" | "pending" | "paid" | "cancelled";

export default function OrdersTab({ orders }: { orders: AdminOrder[] }) {
  const router = useRouter();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const list = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("tr");
    return orders.filter(
      (o) =>
        (filter === "all" || o.status === filter) &&
        (!term ||
          [o.buyerName, o.buyerEmail, o.beatTitle, o.code.slice(0, 8)].some((s) => s.toLocaleLowerCase("tr").includes(term))),
    );
  }, [orders, filter, q]);

  async function setStatus(o: AdminOrder, status: string) {
    setBusy(o.code);
    try {
      await api(`/api/admin/orders/${o.code}`, "PATCH", { status });
      toast(status === "paid" ? "Ödeme onaylandı, dosya teslim edildi" : "Sipariş güncellendi");
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "bad");
    } finally {
      setBusy(null);
    }
  }

  async function remove(o: AdminOrder) {
    if (!confirm("Bu sipariş kaydı silinsin mi? Alıcının indirme linki çalışmaz hale gelir.")) return;
    setBusy(o.code);
    try {
      await api(`/api/admin/orders/${o.code}`, "DELETE");
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "bad");
    } finally {
      setBusy(null);
    }
  }

  async function copyLink(o: AdminOrder) {
    const url = `${window.location.origin}/siparis/${o.code}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("Sipariş linki kopyalandı");
    } catch {
      window.prompt("Sipariş linki:", url);
    }
  }

  const filters: [Filter, string][] = [
    ["all", "Tümü"],
    ["pending", "Ödeme bekleyen"],
    ["paid", "Teslim edilen"],
    ["cancelled", "İptal"],
  ];

  return (
    <div>
      <h1 className="font-wide text-3xl font-black tracking-[-0.04em] sm:text-4xl">Siparişler</h1>
      <p className="mt-2 text-sm text-ash">Ödemeyi onayladığın anda alıcının sipariş sayfasında indirme açılır.</p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                filter === id ? "border-bone bg-bone text-ink" : "border-line text-fog hover:border-fog"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="İsim, e-posta, beat ya da kod ara" className="field !rounded-full !py-2 sm:w-72" />
      </div>

      <Panel className="mt-5">
        {list.length === 0 ? (
          <Empty>{orders.length ? "Bu filtrede sipariş yok." : "Henüz sipariş yok."}</Empty>
        ) : (
          <ul className="divide-y divide-line">
            {list.map((o) => (
              <li key={o.code} className={`grid gap-4 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] lg:items-center ${busy === o.code ? "opacity-50" : ""}`}>
                <div className="flex min-w-0 items-center gap-3">
                  <Cover url={o.coverUrl} title={o.beatTitle} className="h-11 w-11 rounded-lg" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{o.beatTitle}</p>
                    <p className="text-xs text-ash">
                      <span className="tracking-wider text-fog">{o.code.slice(0, 8).toUpperCase()}</span> · {formatDate(o.createdAt)} · {formatPrice(o.price)}
                    </p>
                  </div>
                </div>
                <div className="min-w-0 text-sm">
                  <p className="truncate">{o.buyerName}</p>
                  <a href={`mailto:${o.buyerEmail}`} className="block truncate text-xs text-ash hover:text-bone">
                    {o.buyerEmail}
                  </a>
                  {o.note && <p className="mt-1 truncate text-xs text-ash">Not: {o.note}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <StatusBadge status={o.status} />
                  {o.status === "paid" && <span className="text-xs text-ash">{o.downloads} indirme</span>}
                  {o.status !== "paid" && (
                    <button onClick={() => setStatus(o, "paid")} className="rounded-full bg-bone px-3.5 py-1.5 text-xs font-semibold text-ink">
                      Ödemeyi onayla
                    </button>
                  )}
                  {o.status === "pending" && (
                    <button onClick={() => setStatus(o, "cancelled")} className="rounded-full border border-line px-3.5 py-1.5 text-xs text-fog hover:border-fog">
                      İptal et
                    </button>
                  )}
                  <button onClick={() => copyLink(o)} className="rounded-full border border-line px-3.5 py-1.5 text-xs text-fog hover:border-fog">
                    Linki kopyala
                  </button>
                  <button onClick={() => remove(o)} className="rounded-full border border-line px-3.5 py-1.5 text-xs text-fog hover:border-bad hover:text-bad">
                    Sil
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

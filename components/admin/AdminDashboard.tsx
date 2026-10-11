"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { Beat, Message, Settings } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/format";
import { Cover } from "../player/PlayerBar";
import { AdminOrder, Empty, Panel, StatusBadge, ToastProvider } from "./ui";
import BeatsTab from "./BeatsTab";
import OrdersTab from "./OrdersTab";
import MessagesTab from "./MessagesTab";
import SettingsTab from "./SettingsTab";
import type { StorageMode } from "./uploader";

type Tab = "overview" | "beats" | "orders" | "messages" | "settings";

type Props = {
  beats: Beat[];
  orders: AdminOrder[];
  messages: Message[];
  settings: Settings;
  storageMode: StorageMode;
  warnings: string[];
};

export default function AdminDashboard(props: Props) {
  return (
    <ToastProvider>
      <Shell {...props} />
    </ToastProvider>
  );
}

function Shell({ beats, orders, messages, settings, storageMode, warnings }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");

  const unread = messages.filter((m) => !m.read).length;
  const pending = orders.filter((o) => o.status === "pending").length;

  const nav: { id: Tab; label: string; count?: number }[] = [
    { id: "overview", label: "Genel bakış" },
    { id: "beats", label: "Beatler", count: beats.length },
    { id: "orders", label: "Siparişler", count: pending || undefined },
    { id: "messages", label: "Mesajlar", count: unread || undefined },
    { id: "settings", label: "Ayarlar" },
  ];

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="sticky top-0 z-30 border-b border-line bg-black/85 backdrop-blur-xl lg:h-dvh lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block lg:px-6 lg:py-7">
          <Link href="/" className="font-wide text-lg font-black tracking-[-0.03em] metal">
            ASO BEATS
          </Link>
          <p className="hidden text-xs text-ash lg:mt-1 lg:block">Admin paneli</p>
          <button onClick={logout} className="text-sm text-ash hover:text-bone lg:hidden">
            Çıkış
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:pb-0">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`relative isolate flex shrink-0 items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm transition-colors ${
                tab === n.id ? "text-bone" : "text-ash hover:text-bone"
              }`}
            >
              {tab === n.id && (
                <motion.span layoutId="admin-tab" className="absolute inset-0 -z-10 rounded-xl bg-steel" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
              )}
              {n.label}
              {n.count !== undefined && (
                <span className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums ${tab === n.id ? "bg-bone text-ink" : "bg-steel text-fog"}`}>
                  {n.count}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 hidden space-y-1 p-3 lg:block">
          <Link href="/" target="_blank" className="block rounded-xl px-3.5 py-2.5 text-sm text-ash hover:text-bone">
            Siteyi aç ↗
          </Link>
          <button onClick={logout} className="block w-full rounded-xl px-3.5 py-2.5 text-left text-sm text-ash hover:text-bone">
            Çıkış yap
          </button>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-10">
        {warnings.length > 0 && (
          <div className="mb-6 space-y-2">
            {warnings.map((w) => (
              <p key={w} className="rounded-2xl border border-warn/30 bg-warn/5 px-4 py-3 text-sm text-warn">
                {w}
              </p>
            ))}
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {tab === "overview" && <Overview beats={beats} orders={orders} messages={messages} settings={settings} go={setTab} />}
            {tab === "beats" && <BeatsTab beats={beats} storageMode={storageMode} />}
            {tab === "orders" && <OrdersTab orders={orders} />}
            {tab === "messages" && <MessagesTab messages={messages} />}
            {tab === "settings" && <SettingsTab settings={settings} storageMode={storageMode} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function Overview({
  beats,
  orders,
  messages,
  settings,
  go,
}: {
  beats: Beat[];
  orders: AdminOrder[];
  messages: Message[];
  settings: Settings;
  go: (t: Tab) => void;
}) {
  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.status === "paid");
    const monthAgo = Date.now() - 30 * 864e5;
    return {
      revenue: paid.reduce((s, o) => s + o.price, 0),
      revenue30: paid.filter((o) => (o.paidAt || o.createdAt) > monthAgo).reduce((s, o) => s + o.price, 0),
      sales: paid.length,
      live: beats.filter((b) => b.published && !b.sold).length,
      pending: orders.filter((o) => o.status === "pending").length,
      unread: messages.filter((m) => !m.read).length,
    };
  }, [beats, orders, messages]);

  const top = [...beats].sort((a, b) => b.salesCount - a.salesCount).filter((b) => b.salesCount > 0).slice(0, 5);

  const cards = [
    { label: "Toplam kazanç", value: formatPrice(stats.revenue), sub: `Son 30 gün: ${formatPrice(stats.revenue30)}` },
    { label: "Satış", value: stats.sales, sub: "Teslim edilen sipariş" },
    { label: "Yayındaki beat", value: stats.live, sub: `${beats.length} beat toplam` },
    { label: "Bekleyen", value: stats.pending, sub: `${stats.unread} okunmamış mesaj` },
  ];

  return (
    <div>
      <h1 className="font-wide text-3xl font-black tracking-[-0.04em] sm:text-4xl">Genel bakış</h1>
      <p className="mt-2 text-sm text-ash">
        Ödeme modu:{" "}
        <span className="text-bone">
          {settings.paymentMode === "instant" ? "Anında teslim (ödeme sistemi bağlanana kadar test)" : "Manuel onay (havale/EFT)"}
        </span>
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[22px] border border-line bg-coal p-5"
          >
            <p className="text-sm text-ash">{c.label}</p>
            <p className="font-wide mt-3 text-3xl font-black tabular-nums tracking-[-0.03em]">{c.value}</p>
            <p className="mt-1 text-xs text-ash">{c.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel
          title="Son siparişler"
          action={
            <button onClick={() => go("orders")} className="text-sm text-ash hover:text-bone">
              Tümü
            </button>
          }
        >
          {orders.length === 0 ? (
            <Empty>Henüz sipariş yok. İlk beatini ekleyip siteyi paylaş.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {orders.slice(0, 6).map((o) => (
                <li key={o.code} className="flex items-center gap-3 px-5 py-3.5">
                  <Cover url={o.coverUrl} title={o.beatTitle} className="h-10 w-10 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{o.beatTitle}</p>
                    <p className="truncate text-xs text-ash">
                      {o.buyerName} · {formatDate(o.createdAt)}
                    </p>
                  </div>
                  <span className="hidden text-sm tabular-nums sm:block">{formatPrice(o.price)}</span>
                  <StatusBadge status={o.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="En çok satanlar">
          {top.length === 0 ? (
            <Empty>Satış geldikçe burada görünecek.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {top.map((b) => (
                <li key={b.id} className="flex items-center gap-3 px-5 py-3.5">
                  <Cover url={b.coverUrl} title={b.title} className="h-10 w-10 rounded-lg" />
                  <p className="min-w-0 flex-1 truncate text-sm">{b.title}</p>
                  <span className="text-sm tabular-nums text-ash">{b.salesCount} satış</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {beats.length === 0 && (
        <div className="mt-6 flex flex-col items-start gap-4 rounded-[22px] border border-dashed border-line p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">İlk beatini ekle</p>
            <p className="mt-1 text-sm text-ash">MP3 dosyasını yükle; 15 saniyelik demo ve dalga formu otomatik hazırlanır.</p>
          </div>
          <button onClick={() => go("beats")} className="rounded-full bg-bone px-5 py-2.5 text-sm font-semibold text-ink">
            Beat ekle
          </button>
        </div>
      )}
    </div>
  );
}

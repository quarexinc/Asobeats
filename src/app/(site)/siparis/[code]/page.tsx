import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getOrder, getSettings } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";
import { Cover } from "@/components/player/PlayerBar";
import FullTrackPlayer from "@/components/order/FullTrackPlayer";
import OrderWatcher from "@/components/order/OrderWatcher";
import CopyButton from "@/components/order/CopyButton";
import Reveal from "@/components/Reveal";
import { CheckIcon, DownloadIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Siparişin", robots: { index: false } };

export default async function OrderPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const order = await getOrder(code);
  if (!order) notFound();
  const settings = await getSettings();
  const shortCode = order.code.slice(0, 8).toUpperCase();

  return (
    <div className="mx-auto max-w-2xl px-5 pt-32 sm:pt-40">
      <Reveal>
        {order.status === "paid" && (
          <div className="grid h-16 w-16 place-items-center rounded-full bg-bone text-ink">
            <CheckIcon className="h-8 w-8" />
          </div>
        )}
        <h1 className="font-wide mt-6 text-4xl font-black leading-[0.95] tracking-[-0.045em] sm:text-5xl">
          {order.status === "paid" && "Beatin hazır."}
          {order.status === "pending" && "Siparişin alındı."}
          {order.status === "cancelled" && "Sipariş iptal edildi."}
        </h1>
        <p className="mt-4 text-fog">
          {order.status === "paid" && `Teşekkürler ${order.buyerName.split(" ")[0]}. Tam MP3 dosyan aşağıda. Bu sayfanın linkini kaydet; dosyayı buradan istediğin zaman tekrar indirebilirsin.`}
          {order.status === "pending" && "Ödemen onaylandığı anda bu sayfada indirme butonu otomatik olarak açılacak. Sayfayı açık bırakabilir ya da linkini kaydedip sonra dönebilirsin."}
          {order.status === "cancelled" && "Bu sipariş iptal edildi. Bir hata olduğunu düşünüyorsan bana ulaş."}
        </p>
      </Reveal>

      <Reveal delay={0.08} className="mt-10 rounded-[28px] border border-line p-5 sm:p-7">
        <div className="flex items-center gap-4">
          <Cover url={order.coverUrl} title={order.beatTitle} className="h-16 w-16 rounded-2xl" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold">{order.beatTitle}</p>
            <p className="text-sm text-ash">
              Sipariş {shortCode} · {formatDate(order.createdAt)}
            </p>
          </div>
          <p className="font-semibold tabular-nums">{formatPrice(order.price)}</p>
        </div>

        {order.status === "paid" && (
          <div className="mt-7 space-y-3">
            <FullTrackPlayer src={`/api/download/${order.code}?inline=1`} title={order.beatTitle} />
            <a
              href={`/api/download/${order.code}`}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-bone px-6 py-4 font-semibold text-ink transition-transform hover:scale-[1.01]"
            >
              <DownloadIcon className="h-5 w-5 transition-transform group-hover:translate-y-0.5" />
              MP3 dosyasını indir
            </a>
          </div>
        )}

        {order.status === "pending" && (
          <div className="mt-7 space-y-4">
            <div className="flex items-center gap-3 rounded-2xl border border-warn/25 bg-warn/5 px-4 py-3 text-sm text-warn">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warn opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-warn" />
              </span>
              Ödeme onayı bekleniyor
            </div>
            {settings.bankInfo && (
              <div className="rounded-2xl bg-coal p-5">
                <p className="text-sm text-ash">Ödeme bilgileri</p>
                <p className="mt-2 whitespace-pre-line leading-relaxed">{settings.bankInfo}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4 text-sm">
                  <span className="text-ash">Açıklamaya yazacağın kod:</span>
                  <span className="font-semibold tracking-wider">{shortCode}</span>
                  <CopyButton text={shortCode} />
                </div>
              </div>
            )}
            <OrderWatcher code={order.code} />
          </div>
        )}
      </Reveal>

      <Reveal delay={0.12} className="mt-6 flex flex-wrap items-center gap-3 text-sm text-ash">
        <span>Bu sayfanın linki:</span>
        <CopyButton text={`/siparis/${order.code}`} absolute label="Linki kopyala" />
        <Link href="/#beatler" className="ml-auto hover:text-bone">
          Diğer beatlere göz at →
        </Link>
      </Reveal>
    </div>
  );
}

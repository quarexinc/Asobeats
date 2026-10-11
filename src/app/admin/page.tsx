import type { Metadata } from "next";
import { adminConfigured, isAdmin } from "@/lib/auth";
import { getSettings, hasBlob, hasRedis, isVercel, listBeats, listMessages, listOrders } from "@/lib/db";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin Panel", robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return <AdminLogin configured={adminConfigured()} />;
  }

  const [beats, orders, messages, settings] = await Promise.all([
    listBeats(),
    listOrders(),
    listMessages(),
    getSettings(),
  ]);

  // tam dosya linkleri admin dışına çıkmaz; panele sadece "dosya var mı" bilgisini gönderiyoruz
  const safeOrders = orders.map(({ fileUrl, ...o }) => ({ ...o, hasFile: Boolean(fileUrl) }));

  const warnings: string[] = [];
  if (isVercel && !hasRedis) warnings.push("Veritabanı bağlı değil. Vercel → Storage → Upstash (Redis) bağla ve yeniden deploy et.");
  if (isVercel && !hasBlob) warnings.push("Dosya deposu bağlı değil. Vercel → Storage → Blob bağla ve yeniden deploy et.");
  if (!process.env.ADMIN_SECRET) warnings.push("ADMIN_SECRET tanımlı değil. Güvenlik için Environment Variables'a rastgele uzun bir değer ekle.");

  return (
    <AdminDashboard
      beats={beats}
      orders={safeOrders}
      messages={messages}
      settings={settings}
      storageMode={hasBlob ? "blob" : "local"}
      warnings={warnings}
    />
  );
}

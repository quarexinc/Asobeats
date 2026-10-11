import { isAdmin, unauthorized } from "@/lib/auth";
import { getSettings, saveSettings } from "@/lib/db";
import { Settings } from "@/lib/types";

export const runtime = "nodejs";

const s = (v: unknown, max = 500) => (typeof v === "string" ? v.slice(0, max) : undefined);

export async function PUT(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const cur = await getSettings();

  const faq = Array.isArray(body.faq)
    ? (body.faq as { q?: unknown; a?: unknown }[])
        .map((f) => ({ q: s(f?.q, 300)?.trim() || "", a: s(f?.a, 3000)?.trim() || "" }))
        .filter((f) => f.q && f.a)
        .slice(0, 40)
    : cur.faq;

  const next: Settings = {
    paymentMode: body.paymentMode === "manual" ? "manual" : body.paymentMode === "instant" ? "instant" : cur.paymentMode,
    bankInfo: s(body.bankInfo, 1000) ?? cur.bankInfo,
    heroText: s(body.heroText, 400) ?? cur.heroText,
    aboutTitle: s(body.aboutTitle, 120) ?? cur.aboutTitle,
    aboutText: s(body.aboutText, 5000) ?? cur.aboutText,
    aboutImage: s(body.aboutImage, 1000) ?? cur.aboutImage,
    contactEmail: s(body.contactEmail, 200) ?? cur.contactEmail,
    instagram: s(body.instagram, 300) ?? cur.instagram,
    youtube: s(body.youtube, 300) ?? cur.youtube,
    spotify: s(body.spotify, 300) ?? cur.spotify,
    whatsapp: s(body.whatsapp, 40) ?? cur.whatsapp,
    faq,
  };
  await saveSettings(next);
  return Response.json({ ok: true });
}

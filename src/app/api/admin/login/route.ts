import { adminConfigured, checkPassword, createSession, destroySession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!adminConfigured()) {
    return Response.json(
      { error: "ADMIN_PASSWORD tanımlı değil. Vercel → Settings → Environment Variables bölümünden ekle." },
      { status: 500 },
    );
  }
  const { password } = (await request.json().catch(() => ({}))) as { password?: string };
  // kaba kuvvet denemelerini yavaşlat
  await new Promise((r) => setTimeout(r, 600));
  if (!password || !checkPassword(password)) {
    return Response.json({ error: "Şifre hatalı." }, { status: 401 });
  }
  await createSession();
  return Response.json({ ok: true });
}

export async function DELETE() {
  await destroySession();
  return Response.json({ ok: true });
}

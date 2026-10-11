import { newId, saveMessage } from "@/lib/db";
import { isEmail } from "@/lib/format";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, string>;
  if (body.website) return Response.json({ ok: true }); // bot tuzağı

  const name = String(body.name || "").trim().slice(0, 80);
  const email = String(body.email || "").trim().slice(0, 160);
  const subject = String(body.subject || "").trim().slice(0, 120);
  const message = String(body.message || "").trim().slice(0, 4000);

  if (name.length < 2) return Response.json({ error: "Adını yaz." }, { status: 400 });
  if (!isEmail(email)) return Response.json({ error: "Geçerli bir e-posta adresi yaz." }, { status: 400 });
  if (message.length < 5) return Response.json({ error: "Mesajın çok kısa." }, { status: 400 });

  await saveMessage({
    id: newId(12),
    name,
    email,
    subject: subject || "Genel",
    message,
    read: false,
    createdAt: Date.now(),
  });
  return Response.json({ ok: true });
}

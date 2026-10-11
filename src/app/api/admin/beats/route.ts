import { isAdmin, unauthorized } from "@/lib/auth";
import { newId, saveBeat } from "@/lib/db";
import { parseBeatInput } from "@/lib/beatInput";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  const body = await request.json().catch(() => ({}));
  const beat = parseBeatInput(body);
  if (typeof beat === "string") return Response.json({ error: beat }, { status: 400 });
  beat.id = newId(10);
  await saveBeat(beat);
  return Response.json({ ok: true, id: beat.id });
}

import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE = "aso_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 gün

function secret() {
  const s = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD;
  if (!s) throw new Error("ADMIN_PASSWORD ortam değişkeni tanımlı değil");
  return s + "::" + (process.env.ADMIN_PASSWORD || "");
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkPassword(input: string) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const a = createHmac("sha256", "cmp").update(input).digest();
  const b = createHmac("sha256", "cmp").update(pw).digest();
  return timingSafeEqual(a, b);
}

export async function createSession() {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const token = `${exp}.${sign(String(exp))}`;
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  if (!adminConfigured()) return false;
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now() / 1000) return false;
  try {
    return safeEqual(sig, sign(exp));
  } catch {
    return false;
  }
}

export function unauthorized() {
  return Response.json({ error: "Yetkisiz. Lütfen tekrar giriş yap." }, { status: 401 });
}

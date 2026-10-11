import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isAdmin, unauthorized } from "@/lib/auth";

export const runtime = "nodejs";

const ALLOWED = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/mp4",
  "audio/x-m4a",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

/** Vercel Blob'a tarayıcıdan doğrudan yükleme için token üretir (sadece admin) */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  if (body.type === "blob.generate-client-token" && !(await isAdmin())) {
    return unauthorized();
  }

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("beats/")) throw new Error("Geçersiz klasör");
        return {
          allowedContentTypes: ALLOWED,
          maximumSizeInBytes: 200 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
    });
    return Response.json(json);
  } catch (e) {
    console.error("[upload] token üretilemedi:", (e as Error).message);
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}

/** Yükleme başarısız olursa panel buradan nedenini öğrenir (sadece admin) */
export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  const rw = process.env.BLOB_READ_WRITE_TOKEN;
  let problem = "";
  if (!rw && !process.env.BLOB_STORE_ID) {
    problem =
      "Bu projeye bağlı bir Blob deposu yok. Vercel → Storage → Create → Blob (Public) oluştur, bu projeye bağla ve Redeploy yap.";
  } else if (!rw) {
    problem =
      "Blob bağlı ama BLOB_READ_WRITE_TOKEN eksik. Vercel → Storage → Blob deponu aç → Projects sekmesi → ⋯ → Update Project Connection ile Production'ı işaretle, sonra Redeploy yap.";
  } else if (!rw.startsWith("vercel_blob_rw_")) {
    problem = "BLOB_READ_WRITE_TOKEN değeri hatalı görünüyor. Environment Variables'tan silip Blob'u projeye yeniden bağla.";
  }
  return Response.json({ ok: !problem, problem });
}

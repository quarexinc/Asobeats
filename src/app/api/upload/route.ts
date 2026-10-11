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
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}

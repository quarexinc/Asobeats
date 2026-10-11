"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Ödeme onayı beklerken her 10 saniyede bir durumu kontrol eder */
export default function OrderWatcher({ code }: { code: string }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${code}`, { cache: "no-store" });
        const json = await res.json();
        if (json.status && json.status !== "pending") router.refresh();
      } catch {}
    }, 10000);
    return () => clearInterval(t);
  }, [code, router]);
  return null;
}

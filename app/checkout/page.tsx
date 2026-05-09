"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Payment now happens inside the generate wizard (final step).
export default function CheckoutPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/generate"); }, [router]);
  return null;
}

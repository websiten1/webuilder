"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Initial site checkout no longer uses this page.
// Edit payments still use /edit/processing.
export default function CheckoutSuccessPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/dashboard"); }, [router]);
  return null;
}

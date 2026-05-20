"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GenerateWizard from "@/app/components/GenerateWizard";

function Spinner() {
  return (
    <div style={{ background: "#FAFAFA", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 28, height: 28, border: "2px solid rgba(10,14,20,0.1)", borderTopColor: "#FF5A1F", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function GenerateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSiteId = searchParams.get("edit") ?? undefined;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) { router.push("/login"); return; }
        setReady(true);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  if (!ready) return <Spinner />;
  return <GenerateWizard editSiteId={editSiteId} />;
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <GenerateContent />
    </Suspense>
  );
}

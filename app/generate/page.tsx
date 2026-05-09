"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GenerateWizard from "@/app/components/GenerateWizard";

export default function GeneratePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) {
          router.push("/login");
        } else {
          setReady(true);
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  if (!ready) {
    return (
      <div style={{ background: "#050510", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 28, height: 28, border: "2px solid rgba(99,102,241,0.3)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <GenerateWizard />;
}

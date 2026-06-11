import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "insixlive — Your website live in six minutes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0A0E14",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Subtle radial glow behind the mark */}
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,90,31,0.18) 0%, transparent 70%)",
            top: 55,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
            position: "relative",
          }}
        >
          {/* Logo mark */}
          <div
            style={{
              width: 140,
              height: 140,
              background: "#FF5A1F",
              borderRadius: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 32,
            }}
          >
            <span
              style={{
                fontSize: 96,
                fontWeight: 900,
                color: "#0A0E14",
                lineHeight: 1,
                marginTop: 6,
              }}
            >
              6
            </span>
          </div>

          {/* Wordmark */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: -2.5,
              lineHeight: 1,
              color: "#fff",
              marginBottom: 22,
            }}
          >
            in
            <span style={{ color: "#FF5A1F" }}>six</span>
            live
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 26,
              fontWeight: 400,
              color: "rgba(255,255,255,0.50)",
              letterSpacing: 0,
              textAlign: "center",
            }}
          >
            Your website live in six minutes · €59.99 one-time
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

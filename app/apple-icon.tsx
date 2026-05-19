import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#0A0E14",
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 118,
            fontWeight: 900,
            color: "#FF5A1F",
            lineHeight: 1,
            marginTop: 6,
          }}
        >
          6
        </span>
      </div>
    ),
    { ...size }
  );
}

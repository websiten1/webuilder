import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#0A0E14",
          borderRadius: 9,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 21,
            fontWeight: 900,
            color: "#FF5A1F",
            lineHeight: 1,
            marginTop: 1,
          }}
        >
          6
        </span>
      </div>
    ),
    { ...size }
  );
}

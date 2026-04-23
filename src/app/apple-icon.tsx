// Apple touch icon — Kiki cat on cream, shown when "Add to Home Screen"
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FAF6F1 0%, #F5F0E8 100%)",
          position: "relative",
        }}
      >
        {/* Dusty rose accent circle behind the cat */}
        <div
          style={{
            position: "absolute",
            width: 130,
            height: 130,
            borderRadius: "50%",
            background: "rgba(196, 112, 110, 0.12)",
            display: "flex",
          }}
        />
        <div style={{ fontSize: 120, display: "flex" }}>🐱</div>
      </div>
    ),
    { ...size }
  );
}

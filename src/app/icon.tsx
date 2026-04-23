// Favicon — simplified Jiji silhouette at 32×32
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAF6F1",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          {/* Ears */}
          <path d="M 7 13 L 10 3 L 14 12 Z" fill="#0F0E10" />
          <path d="M 25 13 L 22 3 L 18 12 Z" fill="#0F0E10" />
          {/* Head */}
          <ellipse cx="16" cy="18" rx="10" ry="10" fill="#0F0E10" />
          {/* Eyes */}
          <circle cx="12.5" cy="17" r="2" fill="#F2C94C" />
          <circle cx="19.5" cy="17" r="2" fill="#F2C94C" />
        </svg>
      </div>
    ),
    { ...size }
  );
}

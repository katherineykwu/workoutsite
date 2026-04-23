// Apple touch icon — Jiji, Kiki's black cat, rendered as SVG for clean shapes
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
          background: "#FAF6F1",
        }}
      >
        <svg width="160" height="160" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
          {/* Ears — triangular pointy ears */}
          <path d="M 38 62 L 50 18 L 72 58 Z" fill="#0F0E10" />
          <path d="M 122 62 L 110 18 L 88 58 Z" fill="#0F0E10" />
          {/* Head — soft rounded shape */}
          <ellipse cx="80" cy="85" rx="50" ry="48" fill="#0F0E10" />
          {/* Left eye — warm yellow almond */}
          <ellipse cx="63" cy="82" rx="9" ry="12" fill="#F2C94C" />
          {/* Right eye */}
          <ellipse cx="97" cy="82" rx="9" ry="12" fill="#F2C94C" />
          {/* Pupils — thin vertical slits */}
          <ellipse cx="63" cy="82" rx="1.5" ry="8" fill="#0F0E10" />
          <ellipse cx="97" cy="82" rx="1.5" ry="8" fill="#0F0E10" />
          {/* Nose — small dusty rose triangle */}
          <path d="M 77 104 L 83 104 L 80 108 Z" fill="#D4918F" />
          {/* Mouth — subtle curve */}
          <path d="M 80 108 Q 76 114 72 112" stroke="#3A3438" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M 80 108 Q 84 114 88 112" stroke="#3A3438" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Whiskers — light cream on black */}
          <line x1="42" y1="96" x2="56" y2="98" stroke="#FAF6F1" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
          <line x1="42" y1="104" x2="56" y2="103" stroke="#FAF6F1" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
          <line x1="118" y1="96" x2="104" y2="98" stroke="#FAF6F1" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
          <line x1="118" y1="104" x2="104" y2="103" stroke="#FAF6F1" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
        </svg>
      </div>
    ),
    { ...size }
  );
}

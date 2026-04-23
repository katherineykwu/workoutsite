import type { Metadata, Viewport } from "next";
import { Nunito, Fredoka } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  // Edge-to-edge on iPhone (behind the notch and home indicator)
  viewportFit: "cover",
  // Prevent accidental pinch-zoom while allowing user zoom with double-tap
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  // Status bar color on iOS / address bar on Android matches cream theme
  themeColor: "#FAF6F1",
};

export const metadata: Metadata = {
  title: "My Workout 🐱",
  description: "Weekly workout routines from Jamie",
  // When "Add to Home Screen" on iOS, this title shows below the icon
  appleWebApp: {
    capable: true,
    title: "My Workout",
    statusBarStyle: "default",
  },
  // Disable iOS auto-formatting that converts numbers to phone links
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} ${fredoka.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

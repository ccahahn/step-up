import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import RegisterSW from "@/components/RegisterSW";
import "./globals.css";

const sans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Step Up",
  description: "Plan what's coming up, then keep the difference.",
  // Added to Home Screen: launch without browser chrome, under a translucent
  // status bar. The .wrap padding clears the notch — see globals.css.
  appleWebApp: {
    capable: true,
    title: "Step Up",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0C0E",
  width: "device-width",
  initialScale: 1,
  // Without this the safe-area insets all report zero.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={sans.className}>
      <body>
        <div className="wrap">{children}</div>
        <RegisterSW />
      </body>
    </html>
  );
}

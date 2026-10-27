import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

import InlineScript from "@/components/InlineScript";
import { THEME_INIT_SCRIPT } from "@/lib/themeScript";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Sets data-theme before paint to avoid a light/dark flash; static script, no user data. */}
        <InlineScript html={THEME_INIT_SCRIPT} />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}

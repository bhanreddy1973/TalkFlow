import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "TalkFlow — Live Voice Typing for macOS",
  description:
    "Real-time speech-to-text that types as you speak. 100% local, works in any app. Powered by Whisper on Apple Silicon.",
  keywords: ["voice typing", "speech to text", "macOS", "whisper", "local", "privacy"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}

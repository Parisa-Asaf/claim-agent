// src/app/layout.tsx
import type { Metadata } from "next";
import { Playfair_Display, DM_Mono, Instrument_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["300", "400", "500"],
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ACRLE — Autonomous Consumer Rights & Legal Recovery Engine",
  description: "Module 1: Foundation & Verification — CSE471 Group 07, BRAC University Spring 2026",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${dmMono.variable} ${instrumentSans.variable} font-sans bg-bg text-text antialiased`}>
        {children}
      </body>
    </html>
  );
}
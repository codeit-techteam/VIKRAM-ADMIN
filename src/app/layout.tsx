import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "@/styles/globals.css";
import { AppProviders } from "@/components/providers/app-providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Bajriwala Admin Panel",
    template: "%s | Bajriwala Admin Panel",
  },
  description: "Enterprise ERP Admin Panel for Bajriwala",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

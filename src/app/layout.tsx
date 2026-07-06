import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { CapacitorHardwareBackButton } from "@/components/CapacitorHardwareBackButton";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "E-Komite | Madrasah Aliyah",
  description: "Sistem Perbendaharaan Digital Madrasah Aliyah",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0A0E1A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans antialiased`}>
        <CapacitorHardwareBackButton />
        {children}
        <Toaster position="top-center" theme="dark" richColors />
      </body>
    </html>
  );
}

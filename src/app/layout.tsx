import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "Parfüm AI - Yapay Zeka ile Parfüm Reçetesi",
  description: "Hammade ve esanslarınızdan yapay zeka ile kişiselleştirilmiş parfüm reçeteleri oluşturun",
  keywords: "parfüm, yapay zeka, reçete, esans, hammade, parfüm yapımı",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}

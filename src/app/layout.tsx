import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/constants/brand";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: `${BRAND_NAME} — ${BRAND_TAGLINE}`,
  description:
    "Marketplace hibrid B2B + B2C pentru servicii, logistică și evenimente în România.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" className="dark">
      <body className={`${inter.variable} font-sans`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

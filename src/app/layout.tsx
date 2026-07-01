import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { Footer } from "@/components/footer";
import { MobileNav } from "@/components/mobile-nav";
import { Toaster } from "sonner";
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
        <SessionProvider>
          {children}
          <Footer />
          <MobileNav />
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: "#0f172a",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}

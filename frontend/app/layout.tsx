import type { Metadata } from "next";
import { Zen_Maru_Gothic, Cormorant_Garamond } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BloomingFlowers from "@/components/BloomingFlowers";
import "./globals.css";

const zenMaru = Zen_Maru_Gothic({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-jp",
});
const cormorant = Cormorant_Garamond({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-en",
});

export const metadata: Metadata = {
  title: { default: "ひいらぎ | Webデザイナー・コーダー Portfolio", template: "%s | ひいらぎ Portfolio" },
  description: "Webデザイナー/コーダー ひいらぎのポートフォリオサイト。やさしく、自然のぬくもりを感じるデザインをお届けします。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${zenMaru.variable} ${cormorant.variable}`}>
      <body>
        <BloomingFlowers />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

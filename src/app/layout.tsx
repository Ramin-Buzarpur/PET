import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";
import { CartProvider } from "@/components/providers/CartProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { PawCursorTrail } from "@/components/home/PawCursorTrail";
import { getNavSections, getHelperSection } from "@/lib/catalog";

const vazirmatn = Vazirmatn({
  variable: "--font-vazir",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "پت‌لند | فروشگاه و آموزشگاه آنلاین حیوانات خانگی",
  description:
    "فروشگاه آنلاین محصولات حیوانات خانگی و پکیج‌های آموزشی کامل برای نگهداری بهتر از سگ، گربه و دیگر دوستان کوچک شما.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [sections, helperSection] = await Promise.all([getNavSections(), getHelperSection()]);

  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthSessionProvider>
          <CartProvider>
            <Header sections={sections} helperSection={helperSection} />
            <main className="flex-1">{children}</main>
            <Footer />
            <ChatWidget />
            <PawCursorTrail />
          </CartProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}

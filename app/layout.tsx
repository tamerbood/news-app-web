import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteChrome from "./components/SiteChrome";

const madaSans = IBM_Plex_Sans_Arabic({
  variable: "--font-mada-sans",
  subsets: ["arabic", "latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://madaalalam.com'),
  title: {
    default: "مدى العالم | أخبار العالم لحظة بلحظة",
    template: "%s | مدى العالم",
  },
  description: "منصة أخبار تجمع لك أهم الأخبار من مصادر متعددة في تجربة عربية حديثة وسريعة.",
  applicationName: "مدى العالم",
  authors: [{ name: 'مدى العالم' }],
  creator: 'مدى العالم',
  publisher: 'مدى العالم',
  robots: { index: true, follow: true },
  keywords: ["مدى العالم", "أخبار", "أخبار عربية", "أخبار العالم", "رياضة", "تكنولوجيا"],
  icons: { icon: '/favicon.ico', shortcut: '/favicon.ico' },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className={`${madaSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}

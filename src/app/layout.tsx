import type { Metadata, Viewport } from "next";
import { Sora, Oswald, Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PopupManager from "@/components/PopupManager";
import TrackView from "@/components/TrackView";
import { activePopup } from "@/lib/db";
import { SITE_URL } from "@/lib/utils";
import "./globals.css";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MundialYa — El hub social del Mundial 2026",
    template: "%s | MundialYa",
  },
  description:
    "Vive el Mundial 2026 en Colombia: calendario en vivo con hora de Bogotá, polla gratis con tu parche, votaciones y dónde ver los partidos.",
  openGraph: {
    siteName: "MundialYa",
    locale: "es_CO",
    type: "website",
  },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#11A14A",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const popup = await activePopup();
  return (
    <html lang="es-CO" suppressHydrationWarning>
      <head>
        {/* Aplica el tema antes de hidratar para evitar flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('my_theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className={`${sora.variable} ${oswald.variable} ${inter.variable} font-body antialiased`}>
        <Header />
        <main className="mx-auto min-h-[70vh] w-full max-w-5xl px-4 py-6">{children}</main>
        <Footer />
        <PopupManager popup={popup} />
        <TrackView kind="site" />
      </body>
    </html>
  );
}

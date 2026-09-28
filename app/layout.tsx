import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });
export const metadata: Metadata = {
  title: { default: "Veilscope", template: "%s | Veilscope" },
  description: "Research into U.S.-listed companies, supported by financial pattern mapping and company context tools in development.",
};
export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en" className={`${inter.variable} ${plexMono.variable}`}><body>{children}</body></html>;
}

import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://arc-zenith.vercel.app"),
  title: "APEX RESISTANCE COALITION | Zenith",
  description:
    "Official homepage of the APEX RESISTANCE COALITION — MIR4 clans united as one resistance, one coalition, one future.",
  openGraph: {
    title: "APEX RESISTANCE COALITION | Zenith",
    description:
      "Join the coalition. Choose your clan. Rise with Zenith in MIR4.",
    images: ["/assets/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}

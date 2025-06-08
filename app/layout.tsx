import type { Metadata } from "next";
import { Space_Grotesk, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { MoneyExchangeProvider } from "./contexts/MoneyExchangeContext";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FutureFX - Modern Currency Exchange",
  description: "Modern currency conversion with real-time exchange rates. Check currency rates for free and access premium business services.",
  keywords: "currency exchange, forex, money converter, exchange rates, international business, future trading",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${spaceGrotesk.variable} ${robotoMono.variable} bg-gradient-to-br from-black via-gray-900 to-slate-900 text-white antialiased min-h-screen`}
      >
        <MoneyExchangeProvider>
          {children}
        </MoneyExchangeProvider>
      </body>
    </html>
  );
}

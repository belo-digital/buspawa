import type { Metadata } from 'next';
import './globals.css';
import { Mandali } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/lib/auth";

const mandali = Mandali({weight:'400', subsets:['latin'], variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'BusPawa - Transport Management',
  description: 'Fleet, ticketing, parcel & finance management for Kenya transport operators',
  manifest: '/manifest.json',
  themeColor: '#146464',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", mandali.variable)}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

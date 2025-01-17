import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from '@/components/Providers/SessionProvider'
import { getServerSession } from 'next-auth'
import { options } from './api/auth/[...nextauth]/options'
import Footer from '@/components/Footer/Footer'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Folio Lynkr - Create no code portfolio website",
  description: "Folio Lynkr is a platform for creating and sharing your own portfolio websites without any coding skills.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(options)

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          {children}
            <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}

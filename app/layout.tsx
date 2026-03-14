import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Scene3D } from "@/components/ui/Scene3D";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FluxCred | AI-Native Escrow + AQA",
  description: "Secure, AI-verified milestone payments for modern work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
        <body className="antialiased font-sans selection:bg-primary/30">
          <Scene3D />
          {children}
          <Toaster position="bottom-right" theme="dark" closeButton richColors />
          <ChatWidget />
        </body>
      </html>
    </ClerkProvider>
  );
}

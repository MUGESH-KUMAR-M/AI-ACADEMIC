import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Academic OS — Multi-Agent AI Platform",
  description:
    "A multi-agent AI platform that autonomously generates complete academic course packages.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`} suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1e1b4b",
              border: "1px solid rgba(139,92,246,0.3)",
              color: "#e2e8f0",
              borderRadius: "12px",
              fontSize: "13px",
            },
            success: {
              iconTheme: { primary: "#34d399", secondary: "#1e1b4b" },
            },
            error: {
              iconTheme: { primary: "#f87171", secondary: "#1e1b4b" },
            },
          }}
        />
      </body>
    </html>
  );
}

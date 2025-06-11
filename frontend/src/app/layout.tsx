import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Junokit - AI Work Assistant",
  description: "Your intelligent work companion powered by Jupiter. Streamline your workflow with AI assistance tailored to your role.",
  keywords: ["AI", "assistant", "productivity", "work", "automation", "chat"],
  authors: [{ name: "Junokit Team" }],
  creator: "Junokit",
  publisher: "Junokit",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://junokit.com",
    title: "Junokit - AI Work Assistant",
    description: "Your intelligent work companion powered by Jupiter. Streamline your workflow with AI assistance tailored to your role.",
    siteName: "Junokit",
  },
  twitter: {
    card: "summary_large_image",
    title: "Junokit - AI Work Assistant",
    description: "Your intelligent work companion powered by Jupiter.",
    creator: "@junokit",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2937" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
              {children}
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

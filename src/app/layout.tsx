import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://aparte.com"),
  title: "Aparte",
  description: "Aparte helps you find and manage places you can call home.",
  openGraph: {
    title: "Aparte",
    description: "Aparte helps you find and manage places you can call home.",
    type: "website",
    siteName: "Aparte",
    images: [
      {
        url: "/icon.png",
        width: 400,
        height: 231,
        alt: "Aparte logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aparte",
    description: "Aparte helps you find and manage places you can call home.",
    images: ["/aparte-logo.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

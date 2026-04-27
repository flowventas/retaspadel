import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://retaspadel.vercel.app"),
  title: {
    default: "6 loco",
    template: "%s | 6 loco",
  },
  description:
    "6 loco organiza retas de padel con scores rapidos, tabla de poder en vivo y una vibra competitiva lista para la cancha.",
  applicationName: "6 loco",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "6 loco",
    description: "Juega. Compite. Sube en el ranking.",
    url: "https://retaspadel.vercel.app",
    siteName: "6 loco",
    locale: "es_MX",
    type: "website",
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: "6 loco",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "6 loco",
    description: "Juega. Compite. Sube en el ranking.",
    images: ["/icon.svg"],
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B0B0B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

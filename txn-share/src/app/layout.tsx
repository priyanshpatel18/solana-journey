import Providers from "@/components/Providers";
import { siteConfig } from "@/config/siteConfig";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

const inter = Inter({ subsets: ["latin"] });

export const metadata = siteConfig;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`min-h-screen ${inter.className} antialiased`}
      >
        <Providers>
          <GoogleAnalytics />
          {children}
        </Providers>
      </body>
    </html>
  );
}

import Providers from "@/components/Providers";
import { siteConfig } from "@/config/siteConfig";
import { ReactNode } from "react";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css"
import { Toaster } from "@/components/ui/sonner";

export const metadata = siteConfig;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
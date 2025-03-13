"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { ComponentProps, ReactNode, useEffect, useState } from "react";
import { Toaster } from "./ui/sonner";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
      <div className="relative min-h-screen">
        <ThemeToggle />
        {children}
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="absolute top-4 right-4 p-2"
      whileTap={{ scale: 0.9 }}
      whileHover={{ rotate: 15 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {isDark ? <Sun className="text-yellow-400" /> : <Moon className="text-gray-900" />}
    </motion.button>
  );
}

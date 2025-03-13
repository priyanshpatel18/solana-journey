'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-4">
      <motion.h1
        className="text-5xl font-bold text-red-500"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        404
      </motion.h1>
      <motion.p
        className="text-lg text-gray-600 mt-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Oops! The page you are looking for does not exist.
      </motion.p>
      <motion.div
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Link href="/">
          <Button variant="default">Go Home</Button>
        </Link>
      </motion.div>
    </div>
  );
}

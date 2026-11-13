"use client";
import { motion } from "framer-motion";

/** Kartalar ketma-ket, yengil animatsiya bilan paydo bo‘ladi. */
export function Stagger({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}>
      {children}
    </motion.div>
  );
}

export function Item({ children, className = "h-full" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: "easeOut" } } }}>
      {children}
    </motion.div>
  );
}

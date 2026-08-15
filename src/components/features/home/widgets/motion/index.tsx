"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const MOTION = {
  fast: 0.15,
  base: 0.22,
  slow: 0.32,
  stagger: 0.05,
} as const;

export function useMotionSafe() {
  const reduce = useReducedMotion();
  return !reduce;
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION.base, ease: "easeOut" },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: MOTION.base, ease: "easeOut" },
  },
};

export function MotionList({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const safe = useMotionSafe();
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        show: {
          transition: { staggerChildren: safe ? MOTION.stagger : 0 },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function MotionItem({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div className={className} variants={fadeUp}>
      {children}
    </motion.div>
  );
}

export function AnimatedNumber({
  value,
  className,
  decimals = 0,
}: {
  value: number;
  className?: string;
  decimals?: number;
}) {
  const safe = useMotionSafe();
  if (!safe) {
    return (
      <span className={className}>
        {value.toFixed(decimals)}
      </span>
    );
  }
  return (
    <motion.span
      key={value}
      className={cn("inline-block tabular-nums", className)}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: MOTION.fast }}
    >
      {value.toFixed(decimals)}
    </motion.span>
  );
}

"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { DashboardCanvas } from "./widgets/dashboard-canvas";
import { useMotionSafe, MOTION } from "./widgets/motion";

function greetingKey():
  | "greetingMorning"
  | "greetingAfternoon"
  | "greetingEvening" {
  const hour = new Date().getHours();
  if (hour < 12) return "greetingMorning";
  if (hour < 18) return "greetingAfternoon";
  return "greetingEvening";
}

/**
 * Home dashboard — viewport-locked editable widget canvas.
 */
export function HomePageView() {
  const t = useTranslations("dashboard");
  const { user } = useAuth();
  const safe = useMotionSafe();
  const displayName = user?.displayName ?? user?.username ?? "";
  const titleText = displayName
    ? t(greetingKey(), { name: displayName })
    : t("title");

  const title: ReactNode = (
    <motion.h1
      className="text-2xl font-bold tracking-tight md:text-3xl"
      initial={safe ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: MOTION.base }}
    >
      {titleText}
    </motion.h1>
  );

  return (
    <div className="flex h-full min-h-[calc(100dvh-3.5rem)] flex-col">
      <DashboardCanvas headerTitle={title} />
    </div>
  );
}

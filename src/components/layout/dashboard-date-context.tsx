"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

interface DashboardDateContextValue {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const DashboardDateContext = createContext<DashboardDateContextValue | null>(
  null,
);

export function DashboardDateProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const value = useMemo(
    () => ({ selectedDate, setSelectedDate }),
    [selectedDate],
  );

  return (
    <DashboardDateContext.Provider value={value}>
      {children}
    </DashboardDateContext.Provider>
  );
}

export function useDashboardDate() {
  const ctx = useContext(DashboardDateContext);
  if (!ctx) {
    throw new Error("useDashboardDate must be used within DashboardDateProvider");
  }
  return ctx;
}

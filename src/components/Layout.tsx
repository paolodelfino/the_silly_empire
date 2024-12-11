"use client";

import Toolbar from "@/components/Toolbar";
import useMediaQuery from "@/hooks/useMediaQuery";
import React, { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const isMonitor = useMediaQuery("(min-width: 1600px)", false);

  return (
    <React.Fragment>
      <Toolbar variant={isMonitor ? "monitor" : "mobile"} />
      <main className="w-full pb-48">{children}</main>
    </React.Fragment>
  );
}

"use client";

import { ScreenPredictContext } from "@/components/ScreenPredictProvider";
import Toolbar from "@/components/Toolbar";
import React, { ReactNode, useContext } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const screen = useContext(ScreenPredictContext);

  return (
    <React.Fragment>
      <Toolbar
        variant={screen === undefined || screen >= 1600 ? "monitor" : "mobile"}
      />
      <main className="w-full pb-48">{children}</main>
    </React.Fragment>
  );
}

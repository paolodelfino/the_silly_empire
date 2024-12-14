"use client";

import { ScreenPredictContext } from "@/components/ScreenPredictProvider";
import Toolbar from "@/components/Toolbar";
import React, { ReactNode, useContext } from "react";

export default function Layout({
  children,
  authenticated,
}: {
  children: ReactNode;
  authenticated: boolean;
}) {
  const screen = useContext(ScreenPredictContext);

  return (
    <React.Fragment>
      <Toolbar
        authenticated={authenticated}
        variant={screen === undefined || screen >= 1600 ? "monitor" : "mobile"}
      />
      <main className="w-full pb-48">{children}</main>
    </React.Fragment>
  );
}

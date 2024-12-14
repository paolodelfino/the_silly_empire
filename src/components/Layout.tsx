"use client";

import { Logo } from "@/components/icons";
import { ScreenPredictContext } from "@/components/ScreenPredictProvider";
import Toolbar from "@/components/Toolbar";
import Text from "@/components/ui/Text";
import { ReactNode, useContext } from "react";

export default function Layout({
  children,
  authenticated,
}: {
  children: ReactNode;
  authenticated: boolean;
}) {
  const screen = useContext(ScreenPredictContext);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="app-region-drag flex w-full items-center px-2">
        <Logo />
        <Text>The Silly Empire</Text>
      </div>

      <div className="flex h-full w-full">
        <Toolbar
          authenticated={authenticated}
          variant={
            screen === undefined || screen >= 1600 ? "monitor" : "mobile"
          }
        />
        <main className="w-full pb-48">{children}</main>
      </div>
    </div>
  );
}

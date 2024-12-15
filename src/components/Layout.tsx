"use client";

import { Logo } from "@/components/icons";
import { ScreenPredictContext } from "@/components/ScreenPredictProvider";
import Toolbar from "@/components/Toolbar";
import Text from "@/components/ui/Text";
import { cn } from "@/utils/cn";
import { Dictionary } from "@/utils/dictionary";
import { ReactNode, useContext } from "react";

export default function Layout({
  children,
  authenticated,
  dictionary,
}: {
  children: ReactNode;
  authenticated: boolean;
  dictionary: Dictionary["/home"]["Toolbar"];
}) {
  const screen = useContext(ScreenPredictContext);

  return (
    <div className={cn("flex flex-col", "min-h-screen w-screen")}>
      <div className="app-region-drag flex w-full items-center pl-[calc(env(safe-area-inset-left)+0.5rem)] pr-[calc(env(safe-area-inset-right)+0.5rem)] pt-safe-top">
        <Logo />
        <Text>The Silly Empire</Text>
      </div>

      <div className="flex h-full w-full">
        <Toolbar
          authenticated={authenticated}
          variant={
            screen === undefined || screen >= 1600 ? "monitor" : "mobile"
          }
          dictionary={dictionary}
        />
        <main className={cn("h-full w-full", "pb-48")}>{children}</main>
      </div>
    </div>
  );
}

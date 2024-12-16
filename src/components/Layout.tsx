"use client";

import ActionSet__Lang from "@/actions/ActionSet__Lang";
import FieldSelect from "@/components/form_ui/FieldSelect";
import { Logo } from "@/components/icons";
import InstallPrompt from "@/components/InstallPrompt";
import { LanguageContext } from "@/components/LanguageProvider";
import { ScreenPredictContext } from "@/components/ScreenPredictProvider";
import Toolbar from "@/components/Toolbar";
import Text from "@/components/ui/Text";
import { cn } from "@/utils/cn";
import { Dictionary } from "@/utils/dictionary";
import { locales } from "@/utils/dictionary/client";
import { ReactNode, useContext } from "react";

export default function Layout({
  children,
  authenticated,
  dictionary,
}: {
  children: ReactNode;
  authenticated: boolean;
  dictionary: {
    Toolbar: Dictionary["Toolbar"];
    InstallPrompt: Dictionary["InstallPrompt"];
    "Language.title"?: Dictionary["/settings"]["Section"]["Language"]["title"];
  };
}) {
  const screen = useContext(ScreenPredictContext);
  const lang = useContext(LanguageContext);

  return (
    <div className={cn("flex flex-col", "min-h-screen w-screen")}>
      <div className="app-region-drag flex w-full items-center pl-[calc(env(safe-area-inset-left)+0.5rem)] pr-[calc(env(safe-area-inset-right)+0.5rem)] pt-safe-top">
        <Logo />
        <Text>The Silly Empire</Text>

        {!authenticated && (
          <FieldSelect
            meta={{
              items: locales,
              selectedItem: lang,
            }}
            setMeta={(value) =>
              ActionSet__Lang({ value: value.selectedItem! as any })
            }
            placeholder={dictionary["Language.title"]!}
            setValue={() => {}}
            error={undefined}
          />
        )}
      </div>

      <div className="flex h-full w-full">
        <Toolbar
          authenticated={authenticated}
          variant={
            screen === undefined || screen >= 1600 ? "monitor" : "mobile"
          }
          dictionary={dictionary.Toolbar}
        />
        <main className={cn("h-full w-full", "pb-48")}>{children}</main>
      </div>

      {authenticated && <InstallPrompt dictionary={dictionary.InstallPrompt} />}
    </div>
  );
}

"use client";

import ActionSetLang from "@/actions/ActionSetLang";
import FieldSelect from "@/components/form_ui/FieldSelect";
import { Logo } from "@/components/icons";
import InstallPrompt from "@/components/InstallPrompt";
import { LanguageContext } from "@/components/LanguageProvider";
import { ScreenPredictContext } from "@/components/ScreenPredictProvider";
import Toolbar from "@/components/Toolbar";
import Text from "@/components/ui/Text";
import { Dictionary } from "@/utils/dictionary";
import { locales } from "@/utils/locale.client";
import { localeConfigureZod } from "@/utils/locale.zod";
import { useRouter } from "next/navigation";
import { ReactNode, useContext } from "react";

export default function Layout({
  children,
  authenticated,
  dictionary,
}: {
  children: ReactNode;
  authenticated: boolean;
  dictionary: Pick<
    Dictionary,
    "toolbar" | "installPrompt" | "langReloadAfterSet"
  > & {
    "settings.language"?: Dictionary["settings"]["language"];
  };
}) {
  const screen = useContext(ScreenPredictContext);
  const lang = useContext(LanguageContext);
  localeConfigureZod(lang!); // TODO: Maybe I will be constrained to put a loading state to wait for this
  const router = useRouter();

  return (
    <div className="flex h-full min-h-screen w-full flex-col">
      <div className="flex w-full items-center pl-[calc(env(safe-area-inset-left)+0.5rem)] pr-[calc(env(safe-area-inset-right)+0.5rem)] pt-safe-top app-region-drag">
        <Logo />
        <Text>The Silly Empire</Text>

        {!authenticated && (
          <FieldSelect
            meta={{
              items: locales,
              selectedItem: lang,
            }}
            setMeta={(value) =>
              ActionSetLang({ value: value.selectedItem! as any }).then(
                (data) => {
                  router.replace(data);
                  alert(dictionary.langReloadAfterSet);
                },
              )
            }
            placeholder={dictionary["settings.language"]!}
            setValue={() => {}}
            error={undefined}
          />
        )}
      </div>

      <div className="flex h-full w-full pb-48">
        <Toolbar
          authenticated={authenticated}
          variant={
            screen === undefined || screen >= 1600 ? "monitor" : "mobile"
          }
          dictionary={dictionary.toolbar}
        />
        <main
          className="h-full w-full"
          style={{
            maxWidth:
              authenticated && screen !== undefined && screen >= 1600
                ? "calc(100% - 11rem)"
                : "100%",
          }}
        >
          {children}
        </main>
      </div>

      {authenticated && <InstallPrompt dictionary={dictionary.installPrompt} />}
    </div>
  );
}

"use client";

import ActionSetLang from "@/actions/ActionSetLang";
import ActionSetScTld from "@/actions/ActionSetScTld";
import { FontSizeContext } from "@/components/FontSizeProvider";
import FieldNumber from "@/components/form_ui/FieldNumber";
import FieldSelect from "@/components/form_ui/FieldSelect";
import FieldText from "@/components/form_ui/FieldText";
import { LanguageContext } from "@/components/LanguageProvider";
import { ScContext } from "@/components/ScProvider";
import { Button } from "@/components/ui/Button";
import { ColoredSuperTitle, SuperTitle } from "@/components/ui/SuperTitle";
import Text from "@/components/ui/Text";
import Title from "@/components/ui/Title";
import useFormSetScTld, { formSetScTld } from "@/stores/forms/useFormSetScTld";
import { cn } from "@/utils/cn";
import { Dictionary } from "@/utils/dictionary";
import { locales } from "@/utils/locale.client";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";

export default function Page({
  dictionary,
}: {
  dictionary: Pick<
    Dictionary,
    | "settings"
    | "save"
    | "langReloadAfterSet"
    | "copied"
    | "couldNotCopy"
    | "invalid"
  >;
}) {
  const font = useContext(FontSizeContext);
  const lang = useContext(LanguageContext);

  const sc = useContext(ScContext);
  const scForm = useFormSetScTld();
  const [scFormIsPending, setScFormIsPending] = useState(false);
  const [scTldModalOpen, setScTldModalOpen] = useState(false);
  const touchDown = useRef(false);

  useEffect(
    () =>
      scForm.setOnSubmit(async (form) => {
        setScFormIsPending(true);

        const result = await ActionSetScTld(form.values());
        if (result === "set") window.location.reload();
        else if (result === "not-set") alert(dictionary.invalid);

        setScFormIsPending(false);
      }),
    [scForm.setOnSubmit],
  );

  useEffect(() => {
    if (!scForm.init) {
      scForm.initialize(formSetScTld({ scTld: sc!.tld }));
    }
  }, [scForm.init]);

  const scFormJsx = useMemo(() => {
    if (scForm.init)
      return (
        <div>
          <Title>
            SC{" "}
            {sc!.outdated && (
              <Button
                className="ml-2 !bg-transparent text-start"
                TextProps={{ className: "!text-green-500 p-0" }}
                action={() => setScTldModalOpen((state) => !state)}
              >
                {dictionary.settings.sc.warning}
              </Button>
            )}
          </Title>

          <div className="flex items-center gap-2">
            <FieldText
              placeholder="TLD"
              meta={scForm.fields.value.meta}
              setMeta={scForm.setMeta.bind(null, "value")}
              setValue={scForm.setValue.bind(null, "value")}
              error={scForm.fields.value.error}
              defaultMeta={sc!.tld}
              disabled={scFormIsPending || !sc!.outdated}
            />

            {scTldModalOpen &&
              ReactDOM.createPortal(
                <div
                  className={cn(
                    "fixed left-0 top-0",
                    "h-screen w-full pl-safe-left pr-safe-right",
                    "flex items-center justify-center",
                    "bg-neutral-600/40",
                    "z-20",
                  )}
                  onPointerDown={(e) => {
                    if (e.target === e.currentTarget) {
                      if (e.pointerType === "mouse") setScTldModalOpen(false);
                      else touchDown.current = true;
                    }
                  }}
                  onPointerUp={(e) => {
                    if (e.target === e.currentTarget) {
                      if (
                        e.pointerType === "touch" &&
                        touchDown.current === true
                      )
                        setScTldModalOpen(false);
                    }
                  }}
                >
                  <div
                    className={cn(
                      "flex flex-col gap-2",
                      "max-h-[75vh] w-full max-w-4xl overflow-y-scroll 4xl:rounded 4xl:px-8 4xl:py-4",
                      "bg-neutral-700",
                    )}
                  >
                    <SuperTitle>{dictionary.settings.sc.update}</SuperTitle>

                    <Text>
                      {dictionary.settings.sc.howTo1}
                      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                      <span
                        className="italic"
                        onClick={() => {
                          try {
                            navigator.clipboard
                              .writeText("@BelloFigoIlRobot")
                              .then(() => alert(dictionary.copied));
                          } catch (err) {
                            alert(dictionary.couldNotCopy);
                          }
                        }}
                      >
                        @BelloFigoIlRobot
                      </span>
                      {dictionary.settings.sc.howTo2}
                      <span className="text-gray-500">
                        https://streamingcommunity.
                        <span className="text-yellow-500">family</span>
                      </span>
                      {dictionary.settings.sc.howTo3}
                    </Text>
                  </div>
                </div>,
                document.body,
              )}

            <Button
              disabled={
                !sc!.outdated ||
                scFormIsPending ||
                scForm.isInvalid ||
                scForm.values().value === sc!.tld
              }
              action={scForm.submit}
            >
              {dictionary.save}
            </Button>
          </div>
        </div>
      );
  }, [scForm, scTldModalOpen, sc!.outdated]);

  const router = useRouter();

  return (
    <div className="">
      <ColoredSuperTitle>{dictionary.settings.title}</ColoredSuperTitle>

      <Title>{dictionary.settings.fontSize}</Title>

      <FieldNumber
        meta={font?.value}
        defaultMeta={font?.original}
        // @ts-expect-error
        setMeta={font?.setValue}
        min={16}
        max={48}
        step={0.5}
        setValue={() => {}}
        error={undefined}
      />

      <Title>{dictionary.settings.language}</Title>

      <FieldSelect
        meta={{
          items: locales,
          selectedItem: lang,
        }}
        setMeta={(value) =>
          ActionSetLang({ value: value.selectedItem! as any }).then((data) => {
            router.replace(data);
            alert(dictionary.langReloadAfterSet);
          })
        }
        placeholder={dictionary.settings.language}
        setValue={() => {}}
        error={undefined}
      />

      {scFormJsx}
    </div>
  );
}

"use client";

import ActionSet__Lang from "@/actions/ActionSet__Lang";
import ActionSet__ScTld from "@/actions/ActionSet__ScTld";
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
import useFormSet__ScTld, {
  init__formSet__ScTld,
} from "@/stores/forms/useFormSet__ScTld";
import { cn } from "@/utils/cn";
import { Dictionary } from "@/utils/dictionary";
import { locales } from "@/utils/locale.client";
import { scCheck } from "@/utils/sc";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";

export default function Page({
  dictionary,
}: {
  dictionary: Pick<Dictionary, "settings" | "save">;
}) {
  const font = useContext(FontSizeContext);
  const lang = useContext(LanguageContext);

  const sc = useContext(ScContext);
  const scForm = useFormSet__ScTld();
  const [scFormIsPending, setScFormIsPending] = useState(false);
  const [scTldModalOpen, setScTldModalOpen] = useState(false);
  const touchDown = useRef(false);

  useEffect(
    () =>
      scForm.setOnSubmit(async (form) => {
        setScFormIsPending(true);

        const result = await ActionSet__ScTld(form.values());
        if (result === "set") window.location.reload();
        else if (result === "not-set") alert("Invalid");

        setScFormIsPending(false);
      }),
    [scForm.setOnSubmit],
  );

  useEffect(() => {
    if (!scForm.init) {
      scForm.initialize(init__formSet__ScTld({ scTld: sc! }));

      scCheck(sc!).then((isFine) => {
        scForm.setFormMeta({ isOutdated: !isFine });
      });
    }
  }, [scForm.init]);

  const scFormJsx = useMemo(() => {
    if (scForm.init)
      return (
        <div>
          <Title>
            SC{" "}
            {scForm.meta.isOutdated && (
              <Button
                className="!bg-transparent text-start"
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
              defaultMeta={sc}
              disabled={scFormIsPending || !scForm.meta.isOutdated}
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
                              .then(() => alert("Copied"));
                          } catch (err) {
                            alert("Could not copy text");
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
                !scForm.meta.isOutdated ||
                scFormIsPending ||
                scForm.isInvalid ||
                scForm.values().value === sc
              }
              action={scForm.submit}
            >
              {dictionary.save}
            </Button>
          </div>
        </div>
      );
  }, [scForm, scTldModalOpen]);

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
          ActionSet__Lang({ value: value.selectedItem! as any })
        }
        placeholder={dictionary.settings.language}
        setValue={() => {}}
        error={undefined}
      />

      {scFormJsx}
    </div>
  );
}

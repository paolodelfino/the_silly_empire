"use client";

import ActionSet__Lang from "@/actions/ActionSet__Lang";
import { FontSizeContext } from "@/components/FontSizeProvider";
import FieldNumber from "@/components/form_ui/FieldNumber";
import FieldSelect from "@/components/form_ui/FieldSelect";
import { LanguageContext } from "@/components/LanguageProvider";
import { ColoredSuperTitle } from "@/components/ui/SuperTitle";
import Title from "@/components/ui/Title";
import { Dictionary } from "@/utils/dictionary";
import { useContext } from "react";

export default function Page({
  dictionary,
}: {
  dictionary: Dictionary["/settings"];
}) {
  const font = useContext(FontSizeContext);
  const lang = useContext(LanguageContext);

  return (
    <div className="">
      <ColoredSuperTitle>{dictionary.title}</ColoredSuperTitle>

      <div>
        <Title>{dictionary.Section.FontSize.title}</Title>

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
      </div>

      <div>
        <Title>{dictionary.Section.Language.title}</Title>

        <FieldSelect
          meta={{
            items: [
              { content: "English", id: "en" },
              { content: "Italiano", id: "it" },
            ],
            selectedItem: lang,
          }}
          setMeta={(value) =>
            ActionSet__Lang({ value: value.selectedItem! as any })
          }
          placeholder={dictionary.Section.Language.title}
          setValue={() => {}}
          error={undefined}
        />
      </div>
    </div>
  );
}

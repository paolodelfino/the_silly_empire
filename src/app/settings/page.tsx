"use client";

import { FontSizeContext } from "@/components/FontSizeProvider";
import FieldNumber from "@/components/form_ui/FieldNumber";
import { ColoredSuperTitle, SuperTitle } from "@/components/ui/SuperTitle";
import Title from "@/components/ui/Title";
import { useContext } from "react";

export default function Page() {
  const font = useContext(FontSizeContext);

  return (
    <div className="space-y-6">
      <ColoredSuperTitle>Settings</ColoredSuperTitle>

      <div>
        <Title>Scale</Title>
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
    </div>
  );
}
"use client";

import FieldSelect from "@/components/form_ui/FieldSelect";
import FieldText from "@/components/form_ui/FieldText";
import { IcBaselineSearch } from "@/components/icons";
import { LanguageContext } from "@/components/LanguageProvider";
import { ErrorButton, IconButton } from "@/components/ui/Button";
import { ColoredSuperTitle } from "@/components/ui/SuperTitle";
import Title from "@/components/ui/Title";
import useFormQuery__Entry from "@/stores/forms/useFormQuery__Entry";
import { cn } from "@/utils/cn";
import { Dictionary } from "@/utils/dictionary";
import { formValuesToString } from "@/utils/url";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";

export default function Page({
  dictionary,
}: {
  dictionary: Dictionary["Query"];
}) {
  const form = useFormQuery__Entry();
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const locale = useContext(LanguageContext);

  useEffect(() => {
    form.setOnSubmit(async (form) => {
      setIsPending(true);

      router.push(`/${locale}/query/${formValuesToString(form.values())}`);

      setIsPending(false);
    });
  }, [form.setOnSubmit]);

  return (
    <div className="mx-auto w-full max-w-4xl 1600px:mx-0">
      <div className="mb-2 flex items-center gap-2 pr-4">
        <ColoredSuperTitle className="mb-0 bg-red-500" disabled={isPending}>
          {dictionary.title}
        </ColoredSuperTitle>

        <ErrorButton>{form.error}</ErrorButton>

        <IconButton
          disabled={isPending || form.isInvalid}
          classNames={{ button: cn("sm:ml-0 ml-auto") }}
          action={form.submit}
        >
          {(className) => (
            <IcBaselineSearch className={cn(className, "text-red-500")} />
          )}
        </IconButton>
      </div>

      <Title disabled={isPending}>{dictionary.name}</Title>
      <FieldText
        meta={form.fields.search.meta}
        setMeta={form.setMeta.bind(null, "search")}
        setValue={form.setValue.bind(null, "search")}
        error={form.fields.search.error}
        disabled={isPending}
        acceptIndeterminate
        placeholder={dictionary.name}
        full
      />

      <Title disabled={isPending}>{dictionary.kind}</Title>
      <FieldSelect
        meta={form.fields.kind.meta}
        setMeta={form.setMeta.bind(null, "kind")}
        setValue={form.setValue.bind(null, "kind")}
        error={form.fields.kind.error}
        disabled={isPending}
        acceptIndeterminate
        placeholder={dictionary.kind}
        full
      />

      <Title disabled={isPending}>{dictionary.genre}</Title>
      <FieldSelect
        meta={form.fields.genre.meta}
        setMeta={form.setMeta.bind(null, "genre")}
        setValue={form.setValue.bind(null, "genre")}
        error={form.fields.genre.error}
        disabled={isPending}
        acceptIndeterminate
        placeholder={dictionary.genre}
        full
      />

      <Title disabled={isPending}>{dictionary.year}</Title>
      <FieldSelect
        meta={form.fields.year.meta}
        setMeta={form.setMeta.bind(null, "year")}
        setValue={form.setValue.bind(null, "year")}
        error={form.fields.year.error}
        disabled={isPending}
        acceptIndeterminate
        placeholder={dictionary.year}
        full
      />

      <Title disabled={isPending}>{dictionary.service}</Title>
      <FieldSelect
        meta={form.fields.service.meta}
        setMeta={form.setMeta.bind(null, "service")}
        setValue={form.setValue.bind(null, "service")}
        error={form.fields.service.error}
        disabled={isPending}
        acceptIndeterminate
        placeholder={dictionary.service}
        full
      />

      <Title disabled={isPending}>{dictionary.age}</Title>
      <FieldSelect
        meta={form.fields.age.meta}
        setMeta={form.setMeta.bind(null, "age")}
        setValue={form.setValue.bind(null, "age")}
        error={form.fields.age.error}
        disabled={isPending}
        acceptIndeterminate
        placeholder={dictionary.age}
        full
      />
    </div>
  );
}

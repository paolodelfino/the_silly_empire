"use client";

// import { notFound } from "next/navigation";

import FieldSelect, { fieldSelect } from "@/components/form_ui/FieldSelect";
import { ErrorButton } from "@/components/ui/Button";
import { createForm } from "@/utils/form";
import { z } from "zod";

const useForm = createForm(
  z.object({ foo: z.literal("foo").optional() }),
  {
    foo: fieldSelect({
      items: [
        { content: "Foo", id: "foo" },
        { content: "Bar", id: "bar" },
        { content: "Baz", id: "baz" },
        { content: "Qux", id: "qux" },
        { content: "Quux", id: "quux" },
        { content: "Corge", id: "corge" },
        { content: "Grault", id: "grault" },
        { content: "Garply", id: "garply" },
        { content: "Waldo", id: "waldo" },
        { content: "Fred", id: "fred" },
        { content: "Plugh", id: "plugh" },
        { content: "Xyzzy", id: "xyzzy" },
        { content: "Thud", id: "thud" },
        { content: "Zork", id: "zork" },
        { content: "Blort", id: "blort" },
        { content: "Gloop", id: "gloop" },
        { content: "Gnome", id: "gnome" },
        { content: "Snarf", id: "snarf" },
        { content: "Zot", id: "zot" },
        { content: "Mumble", id: "mumble" },
        { content: "Frotz", id: "frotz" },
        { content: "Ozmo", id: "ozmo" },
      ],
    }),
  },
  {},
);

export default function Page() {
  // notFound();
  const form = useForm();
  return (
    <div>
      <FieldSelect
        disabled={false}
        error={form.fields.foo.error}
        meta={form.fields.foo.meta}
        placeholder="Placeholder"
        setMeta={form.setMeta.bind(null, "foo")}
        setValue={form.setValue.bind(null, "foo")}
        acceptIndeterminate
      />

      <div className="pl-32">
        <ErrorButton>Test error</ErrorButton>
      </div>
      <ErrorButton>Test error</ErrorButton>
    </div>
  );
}

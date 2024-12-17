"use client";

// import { notFound } from "next/navigation";

import FieldSelect, { fieldSelect } from "@/components/form_ui/FieldSelect";
import FieldText, { fieldText } from "@/components/form_ui/FieldText";
import { ErrorButton, IconButton } from "@/components/ui/Button";
import { createForm } from "@/utils/form";
import { z } from "zod";

const useForm = createForm(
  z
    .object({ foo: z.literal("foo").optional(), bar: z.string().trim().min(3) })
    .strict(),
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
    bar: fieldText(),
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

      <FieldText
        placeholder="Placeholder"
        error={form.fields.bar.error}
        meta={form.fields.bar.meta}
        setMeta={form.setMeta.bind(null, "bar")}
        setValue={form.setValue.bind(null, "bar")}
        defaultMeta="Default"
        acceptIndeterminate
      />

      <ErrorButton>{form.error}</ErrorButton>

      <div className="p-10">
        {/* <Button asChild action={() => console.log("Say hi")}>
          <div>Hi</div>
        </Button> */}
      </div>

      <button
        onPointerUp={(e) => {
          console.log(e.target, e.currentTarget);
        }}
      >
        <span>hllo</span>
      </button>
      <IconButton
        action={() => alert("A")}
        classNames={{ button: "bg-green-500" }}
      >
        A
      </IconButton>
      <IconButton
        action={() => alert("B")}
        classNames={{ button: "bg-blue-500" }}
      >
        B
      </IconButton>

      <div className="pl-32">
        <ErrorButton>Test error</ErrorButton>
        <ErrorButton>
          Test error Test error Test error Test error Test error Test error Test
          error Test error Test error Test error Test error Test error Test
          error Test error Test error Test error Test error Test error Test
          error Test error Test error Test error Test error Test error Test
          error Test error Test error Test error Test error Test error Test
          error Test error Test error Test error Test error Test error Test
          error Test error Test error Test error Test error Test error Test
          error Test error Test error Test error Test error Test error Test
          error Test error Test error Test error Test error Test error Test
          error Test error Test error Test error Test error Test error Test
          error Test error Test error Test error Test error Test error Test
          error Test error Test error Test error Test error Test error Test
          error Test error Test error Test error Test error Test error{" "}
        </ErrorButton>
      </div>
      <ErrorButton>Test error</ErrorButton>
    </div>
  );
}

"use client";
import Button from "@/components/Button";
import { Cloud, InformationCircle } from "@/components/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { FormField } from "@/utils/form";
import { ReactNode, useEffect } from "react";
import { ClassValue, tv } from "tailwind-variants";

export const styles = tv({
  slots: {
    container: "",
    input:
      "w-full hyphens-auto break-words rounded bg-neutral-700 p-4 disabled:opacity-50",
  },
  // TODO: Perché qui non c'è anche label?
});

type Meta = string;

type Value = string | undefined;

export type FieldText__Type = FormField<Value, Meta>;

// We use undefined as the guard value assuming that undefined is equivalent to indeterminate state and nothing else for any field
export function fieldText(meta?: Meta): FieldText__Type {
  return {
    meta: meta === undefined ? "" : meta,
    value: undefined,
    default: {
      meta: meta === undefined ? "" : meta,
      value: undefined,
    },
    error: undefined,
  };
}

/**
 * Simple rule for label and placeholder: if there is a label, no placeholder needed and use label if there will be times the placeholder won't be visible because there will already be content filling the space, but don't use label if it's a pretty known, deducible field by the user
 */
export default function FieldText({
  meta,
  defaultMeta,
  setMeta,
  setValue,
  error,
  acceptIndeterminate,
  classNames,
  placeholder,
  label: _label,
  ...rest
}: {
  acceptIndeterminate?: boolean;
  meta: Meta;
  defaultMeta?: Meta; // TODO: Maybe make required
  setMeta: (meta: Meta) => void;
  setValue: (value: Value) => void;
  error: string | undefined;
  disabled: boolean;
  className?: never;
  classNames?: {
    [key in keyof ReturnType<typeof styles>]?: ClassValue;
  };
  placeholder?: string;
  label?: ReactNode;
} & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>) {
  const { container, input } = styles();

  const label =
    typeof _label === "string" ? (
      <h2
        data-disabled={rest.disabled}
        className="py-1 pl-4 text-lg font-medium leading-10 data-[disabled=true]:opacity-50"
      >
        {_label}
      </h2>
    ) : (
      _label
    );

  useEffect(() => {
    setValue(acceptIndeterminate && meta.length <= 0 ? undefined : meta);
  }, [meta]);

  return (
    <div className={container({ className: classNames?.container })}>
      {label}

      <div className="flex items-center gap-2">
        <input
          className={input({ className: classNames?.input })}
          type="text"
          value={meta}
          onChange={(e) => setMeta(e.target.value)}
          placeholder={placeholder}
          {...rest}
        />

        {error !== undefined && (
          <Popover>
            <PopoverTrigger color="danger">
              <InformationCircle />
            </PopoverTrigger>
            <PopoverContent className="rounded border bg-neutral-700 p-4 italic">
              {error}
            </PopoverContent>
          </Popover>
        )}

        {defaultMeta !== undefined && meta !== defaultMeta && (
          <Button
            title="Clear"
            disabled={rest.disabled}
            color="ghost"
            onClick={() => setMeta(defaultMeta)}
          >
            <Cloud />
          </Button>
        )}
      </div>
    </div>
  );
}

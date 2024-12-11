"use client";

import Button from "@/components/Button";
import { Cloud, InformationCircle } from "@/components/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { cn } from "@/utils/cn";
import { FormField } from "@/utils/form";
import { useCallback, useEffect, useId, useRef, useState } from "react";

type Meta = { value: number | undefined; isNegative: boolean };

type Value = number | undefined;

export type FieldNumber__Type = FormField<Value, Meta>;

// We use undefined as the guard value assuming that undefined is equivalent to indeterminate state and nothing else for any field
export function fieldNumber(meta?: Partial<Meta>): FieldNumber__Type {
  if (meta?.value !== undefined && meta.value < 0)
    throw new Error("Value must be a number >= 0");
  return {
    meta: {
      value: undefined,
      isNegative: false,
      ...meta,
    },
    value: undefined,
    default: {
      meta: {
        value: undefined,
        isNegative: false,
        ...meta,
      },
      value: undefined,
    },
    error: undefined,
  };
}

// TODO: min, max and stuff
// TODO: Show sign button only if min < 0
export default function FieldNumber({
  meta,
  defaultMeta,
  setMeta,
  setValue,
  error,
  acceptIndeterminate,
  placeholder,
  ...rest
}: {
  acceptIndeterminate?: boolean;
  meta: Meta;
  defaultMeta?: Meta;
  setMeta: (meta: Partial<Meta>) => void;
  setValue: (value: Value) => void;
  error: string | undefined;
  disabled?: boolean;
  placeholder?: string;
} & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>) {
  useEffect(() => {
    setValue(
      meta.value === undefined
        ? undefined
        : meta.value * (meta.isNegative ? -1 : 1),
    );
  }, [meta]);

  const id = useId();
  const ref = useRef<HTMLInputElement | null>(null);
  const [focused, setFocused] = useState(false);
  const onFocus = useCallback(() => {
    setFocused(true);
  }, []);
  const onBlur = useCallback(() => {
    setFocused(false);
  }, []);

  useEffect(() => {
    if (ref.current !== null) {
      ref.current.addEventListener("focus", onFocus);
      ref.current.addEventListener("blur", onBlur);
      return () => {
        // console.log(ref.current)
        // TODO: ref.current sembra essere sempre null, forse è inutile questa cosa qui e nemmeno necessaria come si potrebbe credere
        ref.current?.removeEventListener("focus", onFocus);
        ref.current?.removeEventListener("blur", onBlur);
      };
    }
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex">
        <Button
          onClick={() => setMeta({ isNegative: !meta.isNegative })}
          classNames={{
            button: cn(
              "rounded-none rounded-l px-4",
              meta.isNegative && "!ring-sky-500 !ring-1",
            ),
          }}
          disabled={rest.disabled}
        >
          -
        </Button>

        <Button
          classNames={{
            button: "rounded-none w-8 justify-center",
          }}
          disabled={meta.value === 0}
          onClick={() =>
            setMeta({
              value: Math.max(0, (meta.value! ?? 0) - 1),
            })
          }
        >
          -
        </Button>

        <label
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          htmlFor={id}
          className={cn(
            "z-[1] flex h-10 w-auto min-w-10 select-none items-center justify-center bg-neutral-700 px-3 hover:cursor-text data-[disabled=true]:opacity-50",
            meta.value === undefined &&
              placeholder !== undefined &&
              "text-neutral-400",
            focused && "ring-1 ring-sky-500",
          )}
          data-disabled={rest.disabled}
          onFocus={() => ref.current!.focus()}
        >
          {meta.value === undefined ? placeholder : meta.value}
        </label>

        <Button
          classNames={{
            button: "rounded-none w-8 justify-center rounded-r",
          }}
          // disabled={meta.value === undefined}
          onClick={() =>
            setMeta({ value: meta.value === undefined ? 0 : meta.value! + 1 })
          }
        >
          +
        </Button>

        <input
          ref={ref}
          id={id}
          tabIndex={-1}
          className="pointer-events-none absolute w-0"
          type="number"
          inputMode="numeric"
          value={meta.value || ""}
          onKeyDown={(e) => {
            if (
              (e.key >= "0" && e.key <= "9") ||
              e.key === "Backspace" ||
              e.key === "ArrowDown" ||
              e.key === "ArrowUp"
            )
              return;

            if (e.key === "Escape") (e.target as HTMLInputElement).blur();

            // console.log(e.key);

            e.preventDefault();
          }}
          onChange={(e) => {
            setMeta({
              value: e.target.value === "" ? undefined : e.target.valueAsNumber,
            });
          }}
          placeholder={placeholder}
          {...rest}
        />
      </div>

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
          title="Reset"
          disabled={rest.disabled}
          color="ghost"
          onClick={() => setMeta(defaultMeta)}
        >
          <Cloud />
        </Button>
      )}
    </div>
  );
}

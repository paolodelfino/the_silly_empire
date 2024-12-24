"use client";

import { IcBaselineCloud } from "@/components/icons";
import { Button, ErrorButton, IconButton } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { Props } from "@/utils/component";
import { FormField } from "@/utils/form";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";

// TODO: Think of custom styling

type Item = {
  content: string;
  id: string;
  disabled?: boolean;
};

type Meta = {
  items: Item[];
  selectedItem: string | undefined;
};

type Value = string | undefined;

export type FieldSelect__Type = FormField<Value, Meta>;

// We use undefined as the guard value assuming that undefined is equivalent to indeterminate state and nothing else for any field
export function fieldSelect(
  meta: Partial<Pick<Meta, "selectedItem">> & Pick<Meta, "items">,
): FieldSelect__Type {
  if (meta.items.length <= 0) throw new Error("No items to select");
  return {
    meta: {
      selectedItem: undefined,
      ...meta,
    },
    value: undefined,
    default: {
      meta: {
        selectedItem: undefined,
        ...meta,
      },
      value: undefined,
    },
    error: undefined,
  };
}

// TODO: Support default
export default function FieldSelect({
  meta,
  setMeta,
  setValue,
  error = undefined,
  disabled = false,
  acceptIndeterminate,
  placeholder,
  full,
  buttonClassName,
}: {
  acceptIndeterminate?: boolean;
  setValue: (value: Value) => void;
  meta: Meta;
  setMeta: (meta: Partial<Meta>) => void;
  error: string | undefined;
  disabled?: boolean;
  placeholder: string;
  full?: boolean; // TODO: Temporary
  buttonClassName?: string; // TODO: Temporary
}) {
  useEffect(() => {
    setValue(
      acceptIndeterminate && meta.selectedItem === undefined
        ? undefined
        : meta.selectedItem,
    );
  }, [meta.selectedItem]);

  useEffect(() => {
    if (meta.items.length <= 0) throw new Error("No items to select");
  }, [meta.items]);

  const selectedItem = useMemo(
    () =>
      meta.selectedItem === undefined
        ? undefined
        : meta.items.find((it) => it.id === meta.selectedItem),
    [meta.selectedItem, meta.items],
  );

  const canClear = useMemo(
    () => acceptIndeterminate === true && selectedItem !== undefined,
    [selectedItem],
  );

  const [open, setOpen] = useState(false);

  const touchDown = useRef(false);

  return (
    <div className="flex shrink-0 items-center">
      <Button
        disabled={disabled}
        className={cn(full && "w-full text-start", "z-[3]", buttonClassName)}
        TextProps={{
          className: cn(selectedItem === undefined && "text-neutral-400"),
        }}
        action={() => setOpen((state) => !state)}
      >
        {selectedItem === undefined ? placeholder : selectedItem.content}
      </Button>

      {open &&
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
                if (e.pointerType === "mouse") setOpen(false);
                else touchDown.current = true;
              }
            }}
            onPointerUp={(e) => {
              if (e.target === e.currentTarget) {
                if (e.pointerType === "touch" && touchDown.current === true)
                  setOpen(false);
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
              {meta.items.map((it) => (
                <Button
                  key={it.id}
                  disabled={disabled || it.disabled}
                  action={(e) => {
                    {
                      if (!it.disabled && !disabled) {
                        setMeta({
                          selectedItem: it.id,
                        });
                        setOpen(false);
                      }
                    }
                  }}
                  className="text-start"
                >
                  {it.content}
                </Button>
              ))}
            </div>
          </div>,
          document.body,
        )}

      <ErrorButton>{error}</ErrorButton>

      {canClear && (
        <IconButton
          disabled={disabled || !canClear}
          action={() =>
            setMeta({
              selectedItem: undefined,
            })
          }
        >
          {(className) => (
            <IcBaselineCloud className={cn(className, "text-gray-500")} />
          )}
        </IconButton>
      )}
    </div>
  );
}

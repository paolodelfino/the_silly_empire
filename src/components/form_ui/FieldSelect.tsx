"use client";

import { IcBaselineCloud } from "@/components/icons";
import { Button, ErrorButton, IconButton } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { FormField } from "@/utils/form";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";

// TODO: Think of custom styling

type Item = {
  content: string;
  id: string;
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

export default function FieldSelect({
  meta,
  setMeta,
  setValue,
  error = undefined,
  disabled = false,
  acceptIndeterminate,
  placeholder,
}: {
  acceptIndeterminate?: boolean;
  setValue: (value: Value) => void;
  meta: Meta;
  setMeta: (meta: Partial<Meta>) => void;
  error: string | undefined;
  disabled?: boolean;
  placeholder: string;
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
    <div className="flex items-center">
      <Button
        disabled={disabled}
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
              "absolute left-0 top-0",
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
                "4xl:py-4 4xl:px-8 4xl:rounded max-h-[75vh] w-full max-w-4xl overflow-y-scroll",
                "bg-neutral-700",
              )}
            >
              {meta.items.map((it) => (
                <Button
                  key={it.id}
                  disabled={disabled}
                  action={(e) => {
                    setMeta({
                      selectedItem: it.id,
                    });
                    setOpen(false);
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

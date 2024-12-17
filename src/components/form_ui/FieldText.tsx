"use client";

import { IcBaselineCloud, IcSharpLockReset } from "@/components/icons";
import { ErrorButton, IconButton } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { FormField } from "@/utils/form";
import { useCallback, useEffect, useMemo, useRef } from "react";

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
  acceptIndeterminate = false,
  disabled = false,
  placeholder,
  full,
}: {
  acceptIndeterminate?: boolean;
  meta: Meta;
  defaultMeta?: Meta;
  setMeta: (meta: Meta) => void;
  setValue: (value: Value) => void;
  error: string | undefined;
  disabled?: boolean;
  placeholder?: string;
  full?: boolean; // TODO: Temporary
}) {
  const canReset = useMemo(
    () => defaultMeta !== undefined && meta !== defaultMeta,
    [meta, defaultMeta],
  );

  const reset = useCallback(() => {
    if (canReset && !disabled) setMeta(defaultMeta!);
  }, [canReset, disabled, defaultMeta]);

  const canClear = useMemo(
    () => acceptIndeterminate === true && meta !== "",
    [meta],
  );

  const clear = useCallback(() => {
    if (!disabled && canClear) setMeta("");
  }, [canClear, disabled, setMeta]);

  useEffect(() => {
    setValue(acceptIndeterminate && meta.length <= 0 ? undefined : meta);
  }, [meta]);

  const touchDown = useRef(false);
  const playSound = useCallback(() => {
    const audio = new Audio("/sound2.ogg");
    audio.oncanplay = () => {
      audio.volume = disabled ? 0.05 : 0.5;
      // TODO: Maybe do something about the error. Also because you can catch NotAllowedError even only on the first click, which means from the second click onward it be play the sound
      audio.play().catch((e) => console.log(e));
    };
  }, []);
  const playAnim = useCallback(
    (e: React.PointerEvent<HTMLInputElement> | PointerEvent) => {
      const input = e.target as HTMLInputElement;
      input.animate(
        [{ transform: "scale(0.95)" }, { transform: "scale(1.05)" }],
        { duration: 105 },
      );
    },
    [],
  );

  return (
    <div className="flex items-center">
      <input
        disabled={disabled}
        className={cn(
          "hyphens-auto whitespace-pre-wrap break-words p-3 text-base",
          "disabled:opacity-50",
          "rounded bg-neutral-700 text-neutral-300",
          "transition-[background-color,transform,opacity] [&.hover:not(:focus)]:scale-105 [&.hover:not(:focus)]:bg-white [&.hover:not(:focus)]:text-black [&.hover:not(:focus)]:placeholder:text-black",
          "[&.hover:not(:focus)]:cursor-pointer",
          "z-[3]",
          full && "w-full text-start",
        )}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget && e.button === 0) {
            if (e.pointerType === "mouse") {
              playSound();
              playAnim(e);
            } else touchDown.current = true;
          }
        }}
        onPointerUp={(e) => {
          if (e.target === e.currentTarget && e.button === 0) {
            if (e.pointerType === "touch" && touchDown.current === true) {
              const input = e.target as HTMLButtonElement;
              const rect = input.getBoundingClientRect();
              const intersect =
                e.clientX >= rect.x &&
                e.clientX <= rect.x + rect.width &&
                e.clientY >= rect.y &&
                e.clientY <= rect.y + rect.height;

              if (intersect) {
                playSound();
                playAnim(e);
              }
            }
          }
        }}
        onPointerOver={(e) => {
          if (e.target === e.currentTarget) {
            if (e.pointerType === "mouse") {
              const input = e.target as HTMLInputElement;
              input.classList.add("hover");
            }
          }
        }}
        onPointerLeave={(e) => {
          if (e.target === e.currentTarget) {
            if (e.pointerType === "mouse") {
              const input = e.target as HTMLInputElement;
              input.classList.remove("hover");
            }
          }
        }}
        type="text"
        value={meta}
        onChange={(e) => setMeta(e.target.value)}
        placeholder={placeholder}
      />

      <ErrorButton>{error}</ErrorButton>

      {canReset && (
        <IconButton disabled={disabled} action={reset}>
          {(className) => (
            <IcSharpLockReset className={cn(className, "text-sky-700")} />
          )}
        </IconButton>
      )}

      {canClear && (
        <IconButton disabled={disabled} action={clear}>
          {(className) => (
            <IcBaselineCloud className={cn(className, "text-gray-500")} />
          )}
        </IconButton>
      )}
    </div>
  );
}

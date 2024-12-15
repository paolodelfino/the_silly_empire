"use client";

import { IcBaselineCloud } from "@/components/icons";
import { ErrorButton, IconButton } from "@/components/ui/Button";
import Text from "@/components/ui/Text";
import { cn } from "@/utils/cn";
import { FormField } from "@/utils/form";
import { useCallback, useEffect, useMemo, useState } from "react";

type Meta = number | undefined;

type Value = number | undefined;

export type FieldNumber__Type = FormField<Value, Meta>;

// We use undefined as the guard value assuming that undefined is equivalent to indeterminate state and nothing else for any field
export function fieldNumber(meta?: Meta): FieldNumber__Type {
  return {
    meta: meta,
    value: undefined,
    default: {
      meta: meta,
      value: undefined,
    },
    error: undefined,
  };
}

export default function FieldNumber({
  min,
  max,
  step = 1,
  meta,
  defaultMeta,
  setMeta,
  setValue,
  error,
  acceptIndeterminate = false,
  disabled = false,
  placeholder,
}: {
  min?: number;
  max?: number;
  step?: number;
  acceptIndeterminate?: boolean;
  meta: Meta;
  defaultMeta?: Meta;
  setMeta: (meta: Meta) => void;
  setValue: (value: Value) => void;
  error: string | undefined;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [number, setNumber] = useState<HTMLParagraphElement | null>(null);

  const canReset = useMemo(
    () => defaultMeta !== undefined && meta !== defaultMeta,
    [meta, defaultMeta],
  );

  useEffect(() => {
    if (!canReset && number !== null) number.classList.remove("hover");
  }, [canReset]); // TODO: Possiamo farlo sotto

  const animateNumber = useCallback(
    (instance?: HTMLParagraphElement) => {
      (instance ?? number!).animate(
        [{ transform: "scale(0.95)" }, { transform: "scale(1.05)" }],
        { duration: 105 },
      );
    },
    [number],
  );

  const numberRef = useCallback(
    (instance: HTMLParagraphElement | null) => {
      setNumber(instance);

      const onPointerDown = (e: PointerEvent) => {
        if (canReset) {
          const audio = new Audio("/sound2.ogg");
          audio.oncanplay = () => {
            audio.volume = disabled ? 0.05 : 0.5;
            audio.play();
            audio.oncanplay = null;
          };

          animateNumber(instance!);

          if (!disabled) setMeta(defaultMeta);
        }
      };

      const onPointerOver = (e: PointerEvent) => {
        if (canReset && e.pointerType === "mouse") {
          instance!.classList.add("hover");
        }
      };

      const onPointerLeave = (e: PointerEvent) => {
        if (canReset && e.pointerType === "mouse") {
          instance!.classList.remove("hover");
        }
      };

      instance?.addEventListener("pointerdown", onPointerDown);
      instance?.addEventListener("pointerover", onPointerOver);
      instance?.addEventListener("pointerleave", onPointerLeave);
      return () => {
        instance?.removeEventListener("pointerdown", onPointerDown);
        instance?.removeEventListener("pointerover", onPointerOver);
        instance?.removeEventListener("pointerleave", onPointerLeave);
      };
    },
    [canReset, disabled, defaultMeta],
  );

  const bound = useCallback(
    (value: number) => {
      if (min !== undefined) value = Math.max(min, value);
      if (max !== undefined) value = Math.min(max, value);
      return value;
    },
    [min, max],
  );

  const canDecrease = useMemo(
    () =>
      !(
        (min !== undefined &&
          meta !== undefined &&
          meta + step - min === step) ||
        disabled
      ),
    [meta, disabled],
  );

  const decrease = useCallback(() => {
    if (canDecrease) {
      const value = (meta || 0) - step;
      setMeta(min !== undefined ? bound(value) : value);
    }
    animateNumber();
  }, [canDecrease, meta, animateNumber]);

  const canIncrease = useMemo(
    () =>
      !(
        (max !== undefined &&
          meta !== undefined &&
          meta + step - max === step) ||
        disabled
      ),
    [meta, disabled],
  );

  const increase = useCallback(() => {
    if (canIncrease) {
      const value = (meta || 0) + step;
      setMeta(max !== undefined ? bound(value) : value);
    }
    animateNumber();
  }, [canIncrease, meta, animateNumber]);

  const canClear = useMemo(
    () => acceptIndeterminate && meta !== undefined,
    [meta],
  );

  const clear = useCallback(() => {
    if (!disabled && canClear) setMeta(undefined);
  }, [canClear, disabled, setMeta]);

  useEffect(() => setValue(meta), [meta]);

  return (
    <div className="flex items-center">
      <IconButton disabled={!canDecrease} downAfter={decrease}>
        -
      </IconButton>

      <Text
        ref={numberRef}
        disabled={disabled}
        className={cn(
          "mx-0.5 flex min-h-[calc(0.75rem*2+1.5rem)] min-w-24 items-center justify-center rounded bg-blue-500 text-white",
          "transition-[opacity,background-color,color] [&.hover]:cursor-pointer [&.hover]:bg-white [&.hover]:text-black",
          meta === undefined &&
            placeholder !== undefined &&
            "font-medium [&:not(.hover)]:text-blue-300",
        )}
      >
        {meta ?? placeholder}
      </Text>

      <IconButton disabled={!canIncrease} downAfter={increase}>
        +
      </IconButton>

      <ErrorButton>{error}</ErrorButton>

      {canClear && (
        <IconButton disabled={disabled || !canClear} downAfter={clear}>
          {(className) => (
            <IcBaselineCloud className={cn(className, "text-gray-500")} />
          )}
        </IconButton>
      )}
    </div>
  );
}

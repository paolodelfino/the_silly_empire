"use client";

import { IcBaselineCloud } from "@/components/icons";
import { Button, ErrorButton, IconButton } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { FormField } from "@/utils/form";
import { useCallback, useEffect, useMemo, useRef } from "react";

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
  const button = useRef<HTMLButtonElement | null>(null);

  const canReset = useMemo(
    () => defaultMeta !== undefined && meta !== defaultMeta,
    [meta, defaultMeta],
  );

  useEffect(() => {
    if (!canReset && button.current !== null)
      button.current!.classList.remove("hover");
  }, [canReset]); // TODO: Possiamo farlo sotto

  const animateNumber = useCallback(() => {
    button.current!.animate(
      [{ transform: "scale(0.95)" }, { transform: "scale(1.05)" }],
      { duration: 105 },
    );
  }, []);

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
      <IconButton disabled={!canDecrease} action={decrease}>
        -
      </IconButton>

      <Button
        ref={button}
        disabled={disabled || !canReset}
        className={cn(
          "min-h-[calc(0.75rem*2+1.5rem)] min-w-24",
          !disabled && !canReset && "[&:not(.hover)]:opacity-100",
          meta === undefined &&
            placeholder !== undefined &&
            "font-medium [&:not(.hover)]:text-neutral-300",
        )}
        action={(e) => {
          animateNumber();

          if (canReset && !disabled) setMeta(defaultMeta);
        }}
      >
        {meta?.toString() ?? placeholder}
      </Button>

      <IconButton disabled={!canIncrease} action={increase}>
        +
      </IconButton>

      <ErrorButton>{error}</ErrorButton>

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

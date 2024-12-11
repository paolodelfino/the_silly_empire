"use client";
import Button, { styles as buttonStyles } from "@/components/Button";
import { RemoveSquare, Square } from "@/components/icons";
import { FormField } from "@/utils/form";
import React, { useEffect } from "react";
import { ClassValue, tv, VariantProps } from "tailwind-variants";

export const styles = tv({
  extend: buttonStyles,
  slots: {
    icon: "",
  },
  variants: {
    checked: {
      true: { icon: "fill-current" },
      false: {},
    },
  },
});

type Meta = boolean | undefined;

type Value = boolean | undefined;

export type FieldCheckbox__Type = FormField<Value, Meta>;

// We use undefined as the guard value assuming that undefined is equivalent to indeterminate state and nothing else for any field
export function fieldCheckbox(meta?: Meta): FieldCheckbox__Type {
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

export default function FieldCheckbox({
  meta,
  setMeta,
  setValue,
  error,
  disabled,
  acceptIndeterminate,
  label,
  checkedIcon,
  uncheckedIcon,
  indeterminateIcon,
  classNames,
  color = "ghost",
  full = false,
  size = "default",
}: {
  acceptIndeterminate?: boolean;
  meta: Meta;
  setMeta: (meta: Meta) => void;
  setValue: (value: Value) => void;
  error: string | undefined;
  disabled: boolean;
  label?: string; // TODO: ReactNode
  checkedIcon?: React.ReactNode;
  uncheckedIcon?: React.ReactNode;
  indeterminateIcon?: React.ReactNode;
  classNames?: {
    [key in keyof ReturnType<typeof styles>]?: ClassValue;
  };
} & Pick<VariantProps<typeof styles>, "color" | "full" | "size">) {
  useEffect(() => {
    setValue(meta);
  }, [meta]);

  const {
    button,
    endContentContainer,
    startContentContainer,
    text,
    icon: iconStyles,
  } = styles({
    color,
    size,
    full,
    checked: meta,
  });

  let onClick: VoidFunction, icon: React.ReactNode;

  if (acceptIndeterminate)
    onClick = () =>
      setMeta(meta === true ? false : meta === false ? undefined : true);
  else onClick = () => setMeta(!meta);

  if (meta === true)
    if (checkedIcon) icon = checkedIcon;
    else
      icon = <Square className={iconStyles({ className: classNames?.icon })} />;
  else if (meta === false)
    if (uncheckedIcon) icon = uncheckedIcon;
    else
      icon = <Square className={iconStyles({ className: classNames?.icon })} />;
  else if (meta === undefined)
    if (indeterminateIcon) icon = indeterminateIcon;
    else
      icon = (
        <RemoveSquare className={iconStyles({ className: classNames?.icon })} />
      );

  return (
    <React.Fragment>
      <Button
        aria-label="Change checkbox state"
        color="ghost"
        classNames={{
          button: button({ className: classNames?.button }),
          startContentContainer: startContentContainer({
            className: classNames?.startContentContainer,
          }),
          text: text({ className: classNames?.text }),
        }}
        onClick={onClick}
        disabled={disabled}
        startContent={label && icon}
      >
        {!label && icon}
        {label}
      </Button>

      {error !== undefined && <span className="italic">{error}</span>}
    </React.Fragment>
  );
}

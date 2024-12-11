"use client";

import FieldDate, {
  fieldDate,
  FieldDate__Type,
} from "@/components/form_ui/FieldDate";
import FieldSelect, {
  fieldSelect,
  FieldSelect__Type,
} from "@/components/form_ui/FieldSelect";
import { dateFromDatetime } from "@/utils/date";
import { FormField } from "@/utils/form";
import { useEffect } from "react";

// TODO: Think of custom styling

type Value =
  | {
      comparison: ">" | "<" | "=" | ">=" | "<=";
      date: Date;
    }
  | {
      comparison: "between";
      date: Date;
      date2: Date;
    }
  | undefined;

type Meta = {
  comparison: FieldSelect__Type;
  date: FieldDate__Type | undefined;
  date2: FieldDate__Type | undefined;
};

export type FieldComparisonDate__Type = FormField<Value, Meta>;

// We use undefined as the guard value assuming that undefined is equivalent to indeterminate state and nothing else for any field
export function fieldComparisonDate(value?: {
  comparison?: Pick<Parameters<typeof fieldSelect>[0], "selectedItem">;
  date?: Parameters<typeof fieldDate>[0];
  date2?: Parameters<typeof fieldDate>[0];
}): FieldComparisonDate__Type {
  const comparison: FieldSelect__Type = fieldSelect({
    items: [
      { content: "=", id: "=" },
      { content: "<=", id: "<=" },
      { content: ">=", id: ">=" },
      { content: "<", id: "<" },
      { content: ">", id: ">" },
      { content: "Between", id: "between" },
    ],
    ...value?.comparison,
  });
  const date: FieldDate__Type | undefined =
    value?.date === undefined ? undefined : fieldDate(value.date);
  const date2: FieldDate__Type | undefined =
    value?.date2 === undefined ? undefined : fieldDate(value.date2);
  return {
    value: undefined,
    error: undefined,
    default: {
      value: undefined,
      meta: { comparison, date, date2 },
    },
    meta: { comparison, date, date2 },
  };
}

export default function FieldComparisonDate({
  disabled,
  error,
  meta,
  setMeta,
  setValue,
  title,
  acceptIndeterminate,
}: {
  acceptIndeterminate?: boolean;
  setValue: (value: Value) => void;
  meta: Meta;
  setMeta: (meta: Partial<Meta>) => void;
  error: string | undefined;
  disabled: boolean;
  title: string; // TODO: Make React.ReactNode
}) {
  useEffect(() => {
    const comparison = meta.comparison.value;

    if (comparison === undefined) {
      setMeta({
        date: undefined,
        date2: undefined,
      });
    } else {
      setMeta({
        date:
          meta.date === undefined
            ? {
                meta: {
                  date: undefined,
                  time: undefined,
                },
                value: undefined,
                default: {
                  meta: {
                    date: undefined,
                    time: undefined,
                  },
                  value: undefined,
                },
                error: undefined,
              }
            : meta.date,
        date2:
          comparison === "between"
            ? meta.date2 === undefined
              ? {
                  meta: {
                    date: undefined,
                    time: undefined,
                  },
                  value: undefined,
                  default: {
                    meta: {
                      date: undefined,
                      time: undefined,
                    },
                    value: undefined,
                  },
                  error: undefined,
                }
              : meta.date2
            : undefined,
      });
    }
  }, [meta.comparison.value]);

  useEffect(() => {
    const comparison = meta.comparison.value as
      | NonNullable<Value>["comparison"]
      | undefined;

    const date =
      meta.date !== undefined &&
      meta.date.meta.date !== undefined &&
      meta.date.meta.time !== undefined
        ? dateFromDatetime(meta.date.meta.date, meta.date.meta.time)
        : undefined;

    const date2 =
      meta.date2 !== undefined &&
      meta.date2.meta.date !== undefined &&
      meta.date2.meta.time !== undefined
        ? dateFromDatetime(meta.date2.meta.date, meta.date2.meta.time)
        : undefined;

    setValue(
      acceptIndeterminate && comparison === undefined
        ? undefined
        : { comparison: comparison!, date: date!, date2: date2! },
    );
  }, [meta]);

  return (
    <div className="flex gap-2 overflow-x-auto">
      <FieldSelect
        disabled={disabled}
        error={meta.comparison.error ?? error}
        meta={meta.comparison.meta}
        placeholder={title}
        setMeta={(value) =>
          setMeta({
            ...meta,
            comparison: {
              ...meta.comparison,
              meta: { ...meta.comparison.meta, ...value },
            },
          })
        }
        setValue={(value) =>
          setMeta({
            ...meta,
            comparison: {
              ...meta.comparison,
              value,
            },
          })
        }
        acceptIndeterminate={acceptIndeterminate}
      />

      {meta.date !== undefined && (
        <FieldDate
          placeholder="date"
          meta={meta.date.meta}
          setMeta={(value) =>
            setMeta({
              date: {
                ...meta.date!,
                meta: { ...meta.date!.meta, ...value },
              },
            })
          }
          setValue={(value) =>
            setMeta({
              ...meta,
              date: {
                ...meta.date!,
                value,
              },
            })
          }
          error={meta.date.error}
          disabled={disabled}
        />
      )}

      {meta.date2 !== undefined && (
        <FieldDate
          placeholder="date2"
          meta={meta.date2.meta}
          setMeta={(value) =>
            setMeta({
              date2: {
                ...meta.date2!,
                meta: { ...meta.date2!.meta, ...value },
              },
            })
          }
          setValue={(value) =>
            setMeta({
              ...meta,
              date2: {
                ...meta.date2!,
                value,
              },
            })
          }
          error={meta.date2.error}
          disabled={disabled}
        />
      )}
    </div>
  );
}

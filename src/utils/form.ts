import { isObject, PartialIfObject } from "@/utils/object";
import { z, ZodType } from "zod";
import { create } from "zustand";

export type FormField<Value, Meta> = {
  meta: Meta;
  value: Value;
  default: {
    meta: Meta;
    value: Value /* TODO: NOTE: Probably useless, because we assume that changing meta, changes value */;
  };
  error: string | undefined;
};

export type FormFields = { [key: string]: FormField<any, any> };

export type FormSchema = ZodType;

export type FormState<T extends FormFields, FormMeta, U extends FormSchema> = {
  fields: T;
  schema: U;
  meta: FormMeta;
  isInvalid: boolean;
  error: string | undefined;
  onSubmit?: (form: FormState<T, FormMeta, U>) => void; // TODO: Could return something
  values: () => FormValues<U>;
  reset: () => void;
  setValue: <Key extends keyof T, Value extends T[Key]["value"]>(
    key: Key,
    value: PartialIfObject<Value>,
  ) => void;
  setValues: (values: {
    [key in keyof T]?: PartialIfObject<T[key]["value"]>;
  }) => void;
  setMeta: <Key extends keyof T, Value extends T[Key]["meta"]>(
    key: Key,
    value: PartialIfObject<Value>,
  ) => void;
  setMetas: (metas: {
    [key in keyof T]?: PartialIfObject<T[key]["meta"]>;
  }) => void;
  setFormMeta: (
    value: FormMeta extends object ? Partial<FormMeta> : FormMeta,
  ) => void;
  setOnSubmit: (callback: (form: FormState<T, FormMeta, U>) => void) => void;
  submit: () => void; // TODO: Wait for callback
};

// export type FormValues<T extends ZodType> = {
//   [key in NonNullable<keyof z.infer<T>>]: z.infer<T>[key];
// };
export type FormValues<T extends ZodType> = z.infer<T>;

export type FormHook<
  T extends FormFields,
  FormMeta,
  U extends FormSchema,
> = ReturnType<typeof createForm<T, FormMeta, U>>;

export function createForm<
  T extends FormFields,
  FormMeta,
  U extends FormSchema,
>(schema: U, fields: T, meta: FormMeta) {
  return create<FormState<T, FormMeta, U>>((set, get, api) => {
    function values(fields: T) {
      return Object.entries(fields).reduce(
        (acc, [key, value]) => {
          acc[key as keyof T] = value.value;
          return acc;
        },
        {} as {
          [key in keyof T]: T[key]["value"];
        },
      );
    }

    function validate(
      fields: T,
      schema: FormSchema,
    ): [fields: T, isInvalid: boolean, formError: string | undefined] {
      const result = schema.safeParse(values(fields));
      const errors = result.error?.flatten();

      const formError = errors?.formErrors[0];

      function clearErrors(fields: T) {
        return Object.entries(fields).reduce((acc, [key, value]) => {
          acc[key as keyof T] = {
            ...value,
            error: undefined,
          } as T[keyof T];
          return acc;
        }, {} as T);
      }

      fields = clearErrors(fields);

      if (errors === undefined)
        Object.entries(result.data as ReturnType<typeof values>).map(
          ([field, value]) => {
            fields[field].value = value;
          },
        );
      else
        Object.entries(errors.fieldErrors).map(([field, errors]) => {
          // TODO: Check for empty array?
          // TODO: Relation between isInvalid and errors being undefined?
          fields[field].error = errors?.[0]; // TODO: Support for more than one error per field
        });

      return [
        fields,
        errors !== undefined || formError !== undefined,
        formError,
      ];
    }

    const state: FormState<T, FormMeta, U> = {
      fields,
      schema: schema,
      meta,
      isInvalid: false,
      error: undefined,
      reset() {
        set((state) => ({
          fields: Object.entries(state.fields).reduce((acc, [key, value]) => {
            acc[key as keyof T] = {
              ...value,
              meta: value.default.meta,
              // value: value.default.value, NOTE: We assume that changing meta, changes value
            } as T[keyof T];
            return acc;
          }, {} as T),
        }));
      },
      values() {
        return values(get().fields);
      },
      setValue(key, value) {
        set((state) => {
          state.fields[key].value = isObject(value)
            ? { ...state.fields[key].value, ...value }
            : value;

          const [fields, isInvalid, formError] = validate(
            state.fields,
            state.schema,
          );

          return { fields, isInvalid, error: formError };
        });
      },
      setValues(values) {
        set((state) => {
          for (const key in values)
            state.fields[key].value = isObject(values[key])
              ? {
                  ...state.fields[key].value,
                  ...values[key],
                }
              : values[key];

          const [fields, isInvalid, formError] = validate(
            state.fields,
            state.schema,
          );

          return { fields, isInvalid, formError };
        });
      },
      setMeta(key, value) {
        set((state) => {
          state.fields[key].meta = isObject(value)
            ? { ...state.fields[key].meta, ...value }
            : value;

          return { fields: state.fields };
        });
      },
      setMetas(metas) {
        set((state) => {
          for (const key in metas)
            state.fields[key].meta = isObject(metas[key])
              ? { ...state.fields[key].meta, ...metas[key] }
              : metas[key];

          return { fields: state.fields };
        });
      },
      setFormMeta(value) {
        set((state) => ({
          meta: isObject(value)
            ? { ...state.meta, ...value }
            : (value as FormMeta),
        }));
      },
      setOnSubmit(callback) {
        set({ onSubmit: callback });
      },
      submit() {
        const state = get();
        if (!state.isInvalid) state.onSubmit?.(state);
      },
    };

    const [_fields, isInvalid, formError] = validate(
      state.fields,
      state.schema,
    );
    state.fields = _fields;
    state.isInvalid = isInvalid;
    state.error = formError;

    return state;
  });
}

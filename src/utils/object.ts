import { types } from "util";

export type PartialIfObject<T> = T extends
  | string
  | number
  | bigint
  | boolean
  | symbol
  | Array<any>
  | Date
  ? T
  : Partial<T>;

export function isObject(value: unknown): value is Record<any, any> {
  return (
    typeof value === "object" &&
    !Array.isArray(value) &&
    value !== null &&
    !types.isDate(value)
  );
}

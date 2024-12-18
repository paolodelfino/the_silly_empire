import { dateFromString, dateToString } from "@/utils/date";
import "client-only"; // For date value
import { types } from "util";

// TODO: Maybe move in form

interface FormValues {
  [key: string]:
    | string
    | string[]
    | Date
    | FormValues
    | undefined
    | boolean
    | number;
}

/**
 * TODO: It assumes keys are not search params-like
 */
export function formValuesToString(values: FormValues) {
  function recursion(values: FormValues, prefix?: string) {
    let sb = "";
    const keys = Object.keys(values);
    for (let i = 0; i < keys.length; ++i) {
      const key = (prefix === undefined ? "" : prefix) + keys[i];
      const value = values[keys[i]];

      if (value === undefined) sb += `${key}=___undefined`;
      else if (typeof value === "string")
        sb += `${key}=${encodeURIComponent(value)}`;
      else if (typeof value === "boolean") sb += `${key}=___boolean${value}`;
      else if (Array.isArray(value)) {
        let sb2 = `${key}=${value.length}&${key}=`;

        if (value.length > 0) sb2 += "&";

        for (let j = 0; j < value.length; ++j) {
          sb2 += `${key}=${encodeURIComponent(value[j])}`;
          if (j + 1 < value.length) sb2 += "&";
        }

        sb += sb2;
      } else if (types.isDate(value))
        sb += `${key}=___date${encodeURIComponent(dateToString(value))}`;
      else if (typeof value === "number")
        sb += `${key}=___number${encodeURIComponent(value)}`;
      else sb += recursion(value, `___object${key}___`);

      if (i + 1 < keys.length) sb += "&";
    }
    return sb;
  }

  return encodeURIComponent(btoa(recursion(values)));
}

/**
 * At the moment, it handles only one nested object
 */
export function formValuesFromString(values: string) {
  const searchParams: {
    [key: string]: string | string[] | undefined;
  } = {};

  for (const [key, value] of new URLSearchParams(
    atob(decodeURIComponent(values)),
  ).entries()) {
    if (searchParams[key] === undefined) searchParams[key] = value;
    else if (typeof searchParams[key] === "string")
      searchParams[key] = [searchParams[key], value];
    else searchParams[key].push(value);
  }

  return formValuesFromSearchParams(searchParams);
}

/**
 * At the moment, it handles only one nested object
 */
export function formValuesFromSearchParams(searchParams: {
  // TODO: Is this compatible with data format a page receives?
  [key: string]: string | string[] | undefined;
}) {
  let obj: FormValues = {};

  for (const key in searchParams) {
    const value = searchParams[key] as string | string[];

    function getValue(value: string | string[]) {
      if (Array.isArray(value)) {
        const len = Number(value[0]);
        if (len <= 0) return [];
        else return value.slice(2).map((it) => decodeURIComponent(it));
      } else if (value.startsWith("___date"))
        return dateFromString(decodeURIComponent(value.slice(7)));
      else if (value.startsWith("___number"))
        return Number(decodeURIComponent(value.slice(9)));
      else if (value.startsWith("___boolean"))
        return value.slice(10) === "true" ? true : false;
      else if (value.startsWith("___undefined")) return undefined;
      else return decodeURIComponent(value);
    }

    if (key.startsWith("___object")) {
      const parentKeyEnd = key.indexOf("___", 9);
      const parentKey = key.slice(9, parentKeyEnd);
      const k = key.slice(parentKeyEnd + 3);

      if (obj[parentKey] === undefined) obj[parentKey] = {};
      (obj[parentKey] as FormValues)[k] = getValue(value);
    } else obj[key] = getValue(value);
  }

  return obj;
}

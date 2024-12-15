import { dictionary } from "@/utils/dictionary";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { NextRequest } from "next/server";
import "server-only";

export const locales = ["en", "it"];

export function getLocale(req: NextRequest): {
  locale: string;
  needsRedirect: boolean;
  cookieNeedsUpdate: boolean;
} {
  let path: string | undefined;
  for (const locale of locales)
    if (
      req.nextUrl.pathname.startsWith(`/${locale}/`) ||
      req.nextUrl.pathname === `/${locale}`
    ) {
      path = locale;
      break;
    }
  if (path !== undefined)
    return {
      needsRedirect: false,
      locale: path,
      cookieNeedsUpdate: false,
    };

  // TODO: Maybe at this point we should always also consider accept-language in case the user changes language preferences

  const cookie = req.cookies.get("locale")?.value;
  if (cookie !== undefined)
    return {
      needsRedirect: true,
      locale: cookie,
      cookieNeedsUpdate: false,
    };

  const auto = match(
    new Negotiator({
      headers: Object.fromEntries(req.headers),
    }).languages(),
    locales,
    req.nextUrl.defaultLocale!,
  );
  return {
    needsRedirect: true,
    locale: auto,
    cookieNeedsUpdate: true,
  };
}

export async function getDictionary(locale: string) {
  return await dictionary[locale as keyof typeof dictionary]();
}

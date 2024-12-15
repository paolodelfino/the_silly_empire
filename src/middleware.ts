import { keys } from "@/keys";
import { getLocale } from "@/utils/locale";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { locale, needsRedirect, cookieNeedsUpdate } = getLocale(req);

  let res: NextResponse;

  if (needsRedirect) {
    req.nextUrl.pathname = `/${locale}${req.nextUrl.pathname}`;
    res = NextResponse.redirect(req.nextUrl);
  } else res = NextResponse.next();

  if (cookieNeedsUpdate)
    res.cookies.set("locale", locale, {
      maxAge: 31536000,
      secure: true,
      httpOnly: true,
      sameSite: "lax",
    });

  const key = req.cookies.get("key")?.value;
  if (
    (key === undefined || !keys.includes(key)) &&
    !req.nextUrl.pathname.endsWith("/login")
  )
    res = NextResponse.redirect(new URL(`/${locale}/login`, req.url), {
      headers: res.headers,
    });

  res.headers.append("locale", locale);
  return res;
}

export const config = {
  matcher: [
    "\/((?!_next\/static|.*\\.webmanifest|.*\\.ico|.*\\.ogg|_next\/image|.*\\.png$).*)",
    "/",
  ],
};

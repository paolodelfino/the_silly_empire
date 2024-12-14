import { keys } from "@/keys";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const key = req.cookies.get("key")?.value;
  if (
    (key === undefined || !keys.includes(key)) &&
    req.nextUrl.pathname !== "/login"
  )
    return NextResponse.redirect(new URL("/login", req.url));

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|.*\\.webmanifest|.*\\.ico|.*\\.ogg|_next/image|.*\\.png$).*)",
  ],
};

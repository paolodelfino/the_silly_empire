"use server";

import schemaSetLang from "@/schemas/schemaSetLang";
import { FormValues } from "@/utils/form";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ActionSetLang(
  values: FormValues<typeof schemaSetLang>,
) {
  const { value } = schemaSetLang.parse(values);

  (await cookies()).set("locale", value, {
    maxAge: 31536000,
    secure: true,
    httpOnly: true,
    sameSite: "lax",
  });

  const referer = (await headers()).get("referer")!;
  const pathname = new URL(referer).pathname;
  const i = pathname.indexOf("/", 1);
  if (i === -1) redirect(`/${value}`);
  else redirect(`/${value}${pathname.slice(i)}`);
}

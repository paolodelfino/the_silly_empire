"use server";

import schemaLang__Set from "@/schemas/schemaLang__Set";
import { FormValues } from "@/utils/form";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ActionSet__Lang(
  values: FormValues<typeof schemaLang__Set>,
) {
  const { value } = schemaLang__Set.parse(values);

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

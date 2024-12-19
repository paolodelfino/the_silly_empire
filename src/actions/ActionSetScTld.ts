"use server";

import schemaSetScTld from "@/schemas/schemaSetScTld";
import { FormValues } from "@/utils/form";
import { scCheck } from "@/utils/sc";
import { cookies } from "next/headers";

export default async function ActionSetScTld(
  values: FormValues<typeof schemaSetScTld>,
) {
  const { value } = schemaSetScTld.parse(values);

  const cookieStore = await cookies();

  if (value === cookieStore.get("scTld")?.value) return "already-set";
  else {
    if (await scCheck(value)) {
      cookieStore.set("scTld", value, {
        maxAge: 31536000,
        secure: true,
        httpOnly: false,
        sameSite: "lax",
      });

      return "set";
    } else return "not-set";
  }
}

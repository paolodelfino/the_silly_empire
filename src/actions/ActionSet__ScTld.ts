"use server";

import schemaScTld__Set from "@/schemas/schemaScTld__Set";
import { FormValues } from "@/utils/form";
import { scCheck } from "@/utils/sc";
import { cookies } from "next/headers";

export default async function ActionSet__ScTld(
  values: FormValues<typeof schemaScTld__Set>,
) {
  const { value } = schemaScTld__Set.parse(values);

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

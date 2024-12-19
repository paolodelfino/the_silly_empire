"use server";

import schemaFetchUpcoming from "@/schemas/schemaFetchUpcoming";
import { FormValues } from "@/utils/form";
import { SC_DEFAULT_TLD, scUpcoming } from "@/utils/sc";
import { cookies } from "next/headers";

export default async function ActionFetchUpcoming(
  values: FormValues<typeof schemaFetchUpcoming>,
) {
  const { offset } = schemaFetchUpcoming.parse(values);
  const tld = (await cookies()).get("scTld")?.value ?? SC_DEFAULT_TLD;
  return scUpcoming(offset, tld);
}

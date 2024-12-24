"use server";

import schemaFetchTitle from "@/schemas/schemaFetchTitle";
import { FormValues } from "@/utils/form";
import { SC_DEFAULT_TLD, scTitle } from "@/utils/sc";
import { cookies } from "next/headers";

export default async function ActionFetchTitle(
  values: FormValues<typeof schemaFetchTitle>,
) {
  const { id } = schemaFetchTitle.parse(values);
  const tld = (await cookies()).get("scTld")?.value ?? SC_DEFAULT_TLD;
  return scTitle(tld, id);
}

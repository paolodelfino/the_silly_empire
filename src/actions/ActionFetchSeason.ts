"use server";

import schemaFetchSeason from "@/schemas/schemaFetchSeason";
import { FormValues } from "@/utils/form";
import { SC_DEFAULT_TLD, scSeason } from "@/utils/sc";
import { cookies } from "next/headers";

export default async function ActionFetchSeason(
  values: FormValues<typeof schemaFetchSeason>,
) {
  const { id, number } = schemaFetchSeason.parse(values);
  const tld = (await cookies()).get("scTld")?.value ?? SC_DEFAULT_TLD;
  return scSeason(tld, id, number);
}

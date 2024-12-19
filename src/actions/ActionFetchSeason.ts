"use server";

import schemaFetchSeason from "@/schemas/schemaFetchSeason";
import { FormValues } from "@/utils/form";
import { scSeason } from "@/utils/sc";

export default async function ActionFetchSeason(
  values: FormValues<typeof schemaFetchSeason>,
) {
  const { id, number } = schemaFetchSeason.parse(values);
  return scSeason(id, number);
}

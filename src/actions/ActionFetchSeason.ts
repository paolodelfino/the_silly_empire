"use server";

import schemaSeasonFetch from "@/schemas/schemaSeasonFetch";
import { FormValues } from "@/utils/form";
import { scSeason } from "@/utils/sc";

export default async function ActionFetchSeason(
  values: FormValues<typeof schemaSeasonFetch>,
) {
  const { id, number } = schemaSeasonFetch.parse(values);
  return scSeason(id, number);
}

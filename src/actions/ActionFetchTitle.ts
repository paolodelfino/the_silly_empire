"use server";

import schemaFetchTitle from "@/schemas/schemaFetchTitle";
import { FormValues } from "@/utils/form";
import { scTitle } from "@/utils/sc";

export default async function ActionFetchTitle(
  values: FormValues<typeof schemaFetchTitle>,
) {
  const { id } = schemaFetchTitle.parse(values);
  return scTitle(id);
}

"use server";

import schemaEntry__Details from "@/schemas/schemaEntry__Details";
import { FormValues } from "@/utils/form";
import { scTitle } from "@/utils/sc";

export default async function ActionFetch__Title(
  values: FormValues<typeof schemaEntry__Details>,
) {
  const { id } = schemaEntry__Details.parse(values);
  return scTitle(id);
}

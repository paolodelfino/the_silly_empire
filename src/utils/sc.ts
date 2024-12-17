import schemaEntry__Search from "@/schemas/schemaEntry__Search";
import schemaEntry__Search__DB from "@/schemas/schemaEntry__Search__DB";
import { FormValues } from "@/utils/form";
import { z } from "zod";

export async function scSearch(
  _offset: number,
  values: FormValues<typeof schemaEntry__Search>,
) {
  const offset = z.number().int().gte(0).lte(1000).parse(_offset);
  const { age, genre, kind, search, quality, service, year } =
    schemaEntry__Search.parse(values);

  const url = new URL(`https://streamingcommunity.family/api/archive`);
  url.searchParams.append("sort", "created_at");
  url.searchParams.append("offset", offset.toString());

  if (age !== undefined) url.searchParams.append("age", age);

  if (genre !== undefined) url.searchParams.append("genre", genre);

  if (kind !== undefined) url.searchParams.append("kind", kind);

  if (search !== undefined) url.searchParams.append("search", search);

  if (quality !== undefined) url.searchParams.append("quality", quality);

  if (service !== undefined) url.searchParams.append("service", service);

  if (year !== undefined) url.searchParams.append("year", year);

  const result = await fetch(url);
  if (result.status !== 200) {
    console.log(result);
    throw new Error("The request went bad");
  }
  const json = await result.json();

  const entries = json.titles as z.infer<typeof schemaEntry__Search__DB>[];

  return { data: entries, total: -1 };
}
